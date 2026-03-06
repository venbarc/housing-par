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

        Schema::table('notifications', function (Blueprint $table) use ($driver) {
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
            DB::table('notifications')->whereNull('facility_id')->update(['facility_id' => $defaultFacilityId]);
            DB::table('notifications')->whereNull('program_id')->update(['program_id' => $defaultProgramId]);
        }

        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['facility_id', 'program_id'], 'notifications_facility_program_index');
        });
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver !== 'sqlite') {
            Schema::table('notifications', function (Blueprint $table) {
                $table->dropForeign(['facility_id']);
                $table->dropForeign(['program_id']);
            });
        }

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('notifications_facility_program_index');
            $table->dropColumn(['facility_id', 'program_id']);
        });
    }
};

