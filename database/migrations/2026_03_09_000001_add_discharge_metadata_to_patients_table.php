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
            $table->string('discharge_disposition')->nullable()->after('discharged_at');
            $table->string('discharge_destination')->nullable()->after('discharge_disposition');
            $table->text('leave_details')->nullable()->after('discharge_destination');

            if ($driver === 'sqlite') {
                $table->unsignedBigInteger('move_to_facility_id')->nullable()->after('leave_details');
                $table->unsignedBigInteger('move_to_program_id')->nullable()->after('move_to_facility_id');
            } else {
                $table->foreignId('move_to_facility_id')->nullable()->after('leave_details')->constrained('facilities')->nullOnDelete();
                $table->foreignId('move_to_program_id')->nullable()->after('move_to_facility_id')->constrained('programs')->nullOnDelete();
            }

            $table->index(['move_to_facility_id', 'move_to_program_id'], 'patients_move_destination_index');
        });
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver !== 'sqlite') {
            Schema::table('patients', function (Blueprint $table) {
                $table->dropForeign(['move_to_facility_id']);
                $table->dropForeign(['move_to_program_id']);
            });
        }

        Schema::table('patients', function (Blueprint $table) {
            $table->dropIndex('patients_move_destination_index');
            $table->dropColumn([
                'discharge_disposition',
                'discharge_destination',
                'leave_details',
                'move_to_facility_id',
                'move_to_program_id',
            ]);
        });
    }
};

