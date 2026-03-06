<?php

namespace App\Http\Controllers;

use App\Models\Bed;
use App\Models\Facility;
use App\Models\Patient;
use App\Models\Program;
use App\Models\Room;
use App\Support\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ImportController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        return Inertia::render('Import/Index', [
            'facilities' => $user && $user->is_admin
                ? Facility::query()->orderBy('name')->get(['id', 'name'])
                : Facility::query()->where('id', $user?->facility_id)->get(['id', 'name']),
            'programs' => Program::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function templateRoomsBeds()
    {
        return response()->streamDownload(function () {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['room_name', 'bed_number', 'bed_type']);
            fputcsv($out, ['Room 101', 'A', 'single']);
            fputcsv($out, ['Room 101', 'B', 'double_top']);
            fputcsv($out, ['Room 102', 'A', 'ada_single']);
            fclose($out);
        }, 'rooms_beds_template.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function templatePatients()
    {
        return response()->streamDownload(function () {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['first_name', 'last_name', 'dob', 'status', 'referral_from', 'insurance', 'intake_date']);
            fputcsv($out, ['Jane', 'Doe', '1990-01-15', 'referral', 'HOSN', 'Medicaid', '2026-03-01']);
            fputcsv($out, ['John', 'Smith', '1985-06-20', 'walk_in', '', '', '2026-03-05']);
            fclose($out);
        }, 'patients_template.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function importRoomsBeds(Request $request): RedirectResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'facility_id' => ['required', 'integer', 'exists:facilities,id'],
            'program_id'  => ['required', 'integer', 'exists:programs,id'],
            'file'        => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $facility = Facility::findOrFail($data['facility_id']);
        Tenant::abortIfCannotAccessFacility($user, $facility);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        $header = fgetcsv($handle);

        // Strip BOM from Excel-generated CSVs
        if ($header && isset($header[0])) {
            $header[0] = preg_replace('/^\xEF\xBB\xBF/', '', $header[0]);
        }

        $header = array_map(fn ($h) => strtolower(trim($h)), $header);
        $expectedHeaders = ['room_name', 'bed_number', 'bed_type'];

        if ($header !== $expectedHeaders) {
            fclose($handle);

            return back()->with('import_result', [
                'success'  => false,
                'message'  => 'Invalid CSV headers. Expected: room_name, bed_number, bed_type',
                'errors'   => [],
                'imported' => 0,
            ]);
        }

        $rows = [];
        $errors = [];
        $lineNumber = 1;
        $validBedTypes = ['single', 'ada_single', 'double_top', 'double_bottom'];

        while (($row = fgetcsv($handle)) !== false) {
            $lineNumber++;

            if (count($row) === 1 && trim($row[0]) === '') {
                continue;
            }

            if (count($row) !== 3) {
                $errors[] = "Row {$lineNumber}: Expected 3 columns, got ".count($row);

                continue;
            }

            $roomName = trim($row[0]);
            $bedNumber = trim($row[1]);
            $bedType = strtolower(trim($row[2]));

            $rowErrors = [];
            if ($roomName === '') {
                $rowErrors[] = 'room_name is required';
            }
            if ($bedNumber === '') {
                $rowErrors[] = 'bed_number is required';
            }
            if (! in_array($bedType, $validBedTypes, true)) {
                $rowErrors[] = 'bed_type must be one of: '.implode(', ', $validBedTypes);
            }

            if (! empty($rowErrors)) {
                $errors[] = "Row {$lineNumber}: ".implode('; ', $rowErrors);
            } else {
                $rows[] = [
                    'room_name'  => $roomName,
                    'bed_number' => $bedNumber,
                    'bed_type'   => $bedType,
                ];
            }
        }

        fclose($handle);

        if (! empty($errors)) {
            return back()->with('import_result', [
                'success'  => false,
                'message'  => 'Validation errors found. No records were imported.',
                'errors'   => $errors,
                'imported' => 0,
            ]);
        }

        if (empty($rows)) {
            return back()->with('import_result', [
                'success'  => false,
                'message'  => 'CSV file is empty (no data rows found).',
                'errors'   => [],
                'imported' => 0,
            ]);
        }

        // Check for duplicate bed_number within the same room_name in the CSV
        $seen = [];
        foreach ($rows as $i => $r) {
            $key = $r['room_name'].'|'.$r['bed_number'];
            if (isset($seen[$key])) {
                $errors[] = 'Row '.($i + 2).": Duplicate bed_number '{$r['bed_number']}' in room '{$r['room_name']}'";
            }
            $seen[$key] = true;
        }

        if (! empty($errors)) {
            return back()->with('import_result', [
                'success'  => false,
                'message'  => 'Duplicate entries found within the CSV. No records were imported.',
                'errors'   => $errors,
                'imported' => 0,
            ]);
        }

        $facilityId = (int) $data['facility_id'];
        $programId = (int) $data['program_id'];
        $bedCount = 0;

        DB::transaction(function () use ($rows, $facilityId, $programId, &$bedCount) {
            $roomCache = [];

            foreach ($rows as $row) {
                if (! isset($roomCache[$row['room_name']])) {
                    $room = Room::firstOrCreate(
                        [
                            'name'        => $row['room_name'],
                            'facility_id' => $facilityId,
                            'program_id'  => $programId,
                        ],
                        ['notes' => null]
                    );
                    $roomCache[$row['room_name']] = $room;
                }

                $room = $roomCache[$row['room_name']];

                $existingBed = Bed::where('room_id', $room->id)
                    ->where('bed_number', $row['bed_number'])
                    ->first();

                if (! $existingBed) {
                    Bed::create([
                        'bed_number' => $row['bed_number'],
                        'bed_type'   => $row['bed_type'],
                        'room_id'    => $room->id,
                        'status'     => 'available',
                    ]);
                    $bedCount++;
                }
            }
        });

        return back()->with('import_result', [
            'success'  => true,
            'message'  => "Import complete: {$bedCount} bed(s) created.",
            'errors'   => [],
            'imported' => $bedCount,
        ]);
    }

    public function importPatients(Request $request): RedirectResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'facility_id' => ['required', 'integer', 'exists:facilities,id'],
            'file'        => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $facility = Facility::findOrFail($data['facility_id']);
        Tenant::abortIfCannotAccessFacility($user, $facility);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        $header = fgetcsv($handle);

        // Strip BOM from Excel-generated CSVs
        if ($header && isset($header[0])) {
            $header[0] = preg_replace('/^\xEF\xBB\xBF/', '', $header[0]);
        }

        $header = array_map(fn ($h) => strtolower(trim($h)), $header);
        $expectedHeaders = ['first_name', 'last_name', 'dob', 'status', 'referral_from', 'insurance', 'intake_date'];

        if ($header !== $expectedHeaders) {
            fclose($handle);

            return back()->with('import_result', [
                'success'  => false,
                'message'  => 'Invalid CSV headers. Expected: '.implode(', ', $expectedHeaders),
                'errors'   => [],
                'imported' => 0,
            ]);
        }

        $rows = [];
        $errors = [];
        $lineNumber = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $lineNumber++;

            if (count($row) === 1 && trim($row[0]) === '') {
                continue;
            }

            if (count($row) !== 7) {
                $errors[] = "Row {$lineNumber}: Expected 7 columns, got ".count($row);

                continue;
            }

            $firstName = trim($row[0]);
            $lastName = trim($row[1]);
            $dob = trim($row[2]);
            $status = strtolower(trim($row[3]));
            $referralFrom = trim($row[4]);
            $insurance = trim($row[5]);
            $intakeDate = trim($row[6]);

            $rowErrors = [];
            if ($firstName === '') {
                $rowErrors[] = 'first_name is required';
            }
            if ($lastName === '') {
                $rowErrors[] = 'last_name is required';
            }

            if (! preg_match('/^\d{4}-\d{2}-\d{2}$/', $dob)) {
                $rowErrors[] = 'dob must be in YYYY-MM-DD format';
            } elseif (! strtotime($dob)) {
                $rowErrors[] = 'dob is not a valid date';
            }

            if (! in_array($status, ['referral', 'walk_in'], true)) {
                $rowErrors[] = 'status must be referral or walk_in';
            }

            if ($status === 'referral' && $referralFrom === '') {
                $rowErrors[] = 'referral_from is required when status is referral';
            }

            if ($intakeDate !== '' && ! preg_match('/^\d{4}-\d{2}-\d{2}$/', $intakeDate)) {
                $rowErrors[] = 'intake_date must be in YYYY-MM-DD format';
            } elseif ($intakeDate !== '' && ! strtotime($intakeDate)) {
                $rowErrors[] = 'intake_date is not a valid date';
            }

            if (! empty($rowErrors)) {
                $errors[] = "Row {$lineNumber}: ".implode('; ', $rowErrors);
            } else {
                $rows[] = [
                    'first_name'    => $firstName,
                    'last_name'     => $lastName,
                    'dob'           => $dob,
                    'status'        => $status,
                    'referral_from' => $referralFrom !== '' ? $referralFrom : null,
                    'insurance'     => $insurance !== '' ? $insurance : null,
                    'intake_date'   => $intakeDate !== '' ? $intakeDate : null,
                ];
            }
        }

        fclose($handle);

        if (! empty($errors)) {
            return back()->with('import_result', [
                'success'  => false,
                'message'  => 'Validation errors found. No records were imported.',
                'errors'   => $errors,
                'imported' => 0,
            ]);
        }

        if (empty($rows)) {
            return back()->with('import_result', [
                'success'  => false,
                'message'  => 'CSV file is empty (no data rows found).',
                'errors'   => [],
                'imported' => 0,
            ]);
        }

        $facilityId = (int) $data['facility_id'];

        // Resolve program_id from user context or facility rooms
        $pair = Tenant::pair($user);
        $programId = $pair['program_id'] ?? null;

        if (! $programId) {
            $programId = DB::table('rooms')
                ->where('facility_id', $facilityId)
                ->orderBy('id')
                ->value('program_id');
        }

        if (! $programId) {
            $programId = DB::table('programs')->orderBy('id')->value('id');
        }

        $patientCount = 0;

        DB::transaction(function () use ($rows, $facilityId, $programId, &$patientCount) {
            foreach ($rows as $row) {
                Patient::create([
                    'facility_id'   => $facilityId,
                    'program_id'    => $programId,
                    'first_name'    => $row['first_name'],
                    'last_name'     => $row['last_name'],
                    'dob'           => $row['dob'],
                    'status'        => $row['status'],
                    'referral_from' => $row['referral_from'],
                    'insurance'     => $row['insurance'],
                    'intake_date'   => $row['intake_date'],
                ]);
                $patientCount++;
            }
        });

        return back()->with('import_result', [
            'success'  => true,
            'message'  => "Import complete: {$patientCount} patient(s) created.",
            'errors'   => [],
            'imported' => $patientCount,
        ]);
    }
}
