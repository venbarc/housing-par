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

        Schema::table('users', function (Blueprint $table) use ($driver) {
            $table->boolean('is_admin')->default(false)->after('password');

            if ($driver === 'sqlite') {
                $table->unsignedBigInteger('facility_id')->nullable()->after('is_admin');
                $table->unsignedBigInteger('program_id')->nullable()->after('facility_id');
            } else {
                $table->foreignId('facility_id')->nullable()->after('is_admin')->constrained('facilities')->nullOnDelete();
                $table->foreignId('program_id')->nullable()->after('facility_id')->constrained('programs')->nullOnDelete();
            }

            $table->index('facility_id');
            $table->index('program_id');
            $table->index(['facility_id', 'program_id'], 'users_facility_program_index');
        });
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver !== 'sqlite') {
            Schema::table('users', function (Blueprint $table) {
                $table->dropForeign(['facility_id']);
                $table->dropForeign(['program_id']);
            });
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['facility_id']);
            $table->dropIndex(['program_id']);
            $table->dropIndex('users_facility_program_index');
            $table->dropColumn(['is_admin', 'facility_id', 'program_id']);
        });
    }
};

