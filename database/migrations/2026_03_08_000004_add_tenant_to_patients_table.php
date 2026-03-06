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

        Schema::table('patients', function (Blueprint $table) use ($driver) {
            if ($driver === 'sqlite') {
                $table->unsignedBigInteger('facility_id')->nullable()->after('id');
                $table->unsignedBigInteger('program_id')->nullable()->after('facility_id');
            } else {
                $table->foreignId('facility_id')->nullable()->after('id')->constrained('facilities')->nullOnDelete();
                $table->foreignId('program_id')->nullable()->after('facility_id')->constrained('programs')->nullOnDelete();
            }
        });

        $defaultFacilityId = DB::table('facilities')->where('name', 'Default Facility')->value('id')
            ?? DB::table('facilities')->orderBy('id')->value('id');

        $defaultProgramId = DB::table('programs')->where('name', 'Navigation Center Info')->value('id')
            ?? DB::table('programs')->orderBy('id')->value('id');

        if ($defaultFacilityId && $defaultProgramId) {
            // Backfill from bed -> room where possible.
            $patients = DB::table('patients')->select(['id', 'bed_id'])->orderBy('id')->get();
            foreach ($patients as $patient) {
                $facilityId = null;
                $programId = null;

                if (! empty($patient->bed_id)) {
                    $row = DB::table('beds')
                        ->join('rooms', 'rooms.id', '=', 'beds.room_id')
                        ->where('beds.id', $patient->bed_id)
                        ->select(['rooms.facility_id', 'rooms.program_id'])
                        ->first();

                    if ($row) {
                        $facilityId = $row->facility_id;
                        $programId = $row->program_id;
                    }
                }

                DB::table('patients')->where('id', $patient->id)->update([
                    'facility_id' => $facilityId ?? $defaultFacilityId,
                    'program_id' => $programId ?? $defaultProgramId,
                ]);
            }
        }

        Schema::table('patients', function (Blueprint $table) {
            $table->index(['facility_id', 'program_id'], 'patients_facility_program_index');
        });
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver !== 'sqlite') {
            Schema::table('patients', function (Blueprint $table) {
                $table->dropForeign(['facility_id']);
                $table->dropForeign(['program_id']);
            });
        }

        Schema::table('patients', function (Blueprint $table) {
            $table->dropIndex('patients_facility_program_index');
            $table->dropColumn(['facility_id', 'program_id']);
        });
    }
};

