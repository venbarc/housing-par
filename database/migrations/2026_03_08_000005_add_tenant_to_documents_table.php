<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::getDriverName();

        Schema::table('documents', function (Blueprint $table) use ($driver) {
            if ($driver === 'sqlite') {
                $table->unsignedBigInteger('facility_id')->nullable()->after('bed_id');
                $table->unsignedBigInteger('program_id')->nullable()->after('facility_id');
            } else {
                $table->foreignId('facility_id')->nullable()->after('bed_id')->constrained('facilities')->nullOnDelete();
                $table->foreignId('program_id')->nullable()->after('facility_id')->constrained('programs')->nullOnDelete();
            }
        });

        $defaultFacilityId = DB::table('facilities')->where('name', 'Default Facility')->value('id')
            ?? DB::table('facilities')->orderBy('id')->value('id');

        $defaultProgramId = DB::table('programs')->where('name', 'Navigation Center Info')->value('id')
            ?? DB::table('programs')->orderBy('id')->value('id');

        if ($defaultFacilityId && $defaultProgramId) {
            $documents = DB::table('documents')->select(['id', 'patient_id', 'bed_id'])->orderBy('id')->get();

            foreach ($documents as $doc) {
                $facilityId = null;
                $programId = null;

                if (! empty($doc->patient_id)) {
                    $row = DB::table('patients')
                        ->where('id', $doc->patient_id)
                        ->select(['facility_id', 'program_id'])
                        ->first();
                    if ($row) {
                        $facilityId = $row->facility_id;
                        $programId = $row->program_id;
                    }
                } elseif (! empty($doc->bed_id)) {
                    $row = DB::table('beds')
                        ->join('rooms', 'rooms.id', '=', 'beds.room_id')
                        ->where('beds.id', $doc->bed_id)
                        ->select(['rooms.facility_id', 'rooms.program_id'])
                        ->first();
                    if ($row) {
                        $facilityId = $row->facility_id;
                        $programId = $row->program_id;
                    }
                }

                DB::table('documents')->where('id', $doc->id)->update([
                    'facility_id' => $facilityId ?? $defaultFacilityId,
                    'program_id' => $programId ?? $defaultProgramId,
                ]);
            }
        }

        Schema::table('documents', function (Blueprint $table) {
            $table->index(['facility_id', 'program_id'], 'documents_facility_program_index');
        });
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver !== 'sqlite') {
            Schema::table('documents', function (Blueprint $table) {
                $table->dropForeign(['facility_id']);
                $table->dropForeign(['program_id']);
            });
        }

        Schema::table('documents', function (Blueprint $table) {
            $table->dropIndex('documents_facility_program_index');
            $table->dropColumn(['facility_id', 'program_id']);
        });
    }
};

