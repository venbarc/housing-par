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

        Schema::table('rooms', function (Blueprint $table) use ($driver) {
            if ($driver === 'sqlite') {
                $table->unsignedBigInteger('program_id')->nullable()->after('facility_id');
            } else {
                $table->foreignId('program_id')->nullable()->after('facility_id')->constrained('programs')->cascadeOnDelete();
            }
        });

        $programId = DB::table('programs')->where('name', 'Navigation Center Info')->value('id');
        if (! $programId) {
            $programId = DB::table('programs')->insertGetId([
                'name' => 'Navigation Center Info',
                'notes' => 'Default program',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::table('rooms')->whereNull('program_id')->update(['program_id' => $programId]);

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE rooms MODIFY program_id BIGINT UNSIGNED NOT NULL');
        }

        Schema::table('rooms', function (Blueprint $table) {
            $table->index(['facility_id', 'program_id'], 'rooms_facility_program_index');
        });
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver !== 'sqlite') {
            Schema::table('rooms', function (Blueprint $table) {
                $table->dropForeign(['program_id']);
            });
        }

        Schema::table('rooms', function (Blueprint $table) {
            $table->dropIndex('rooms_facility_program_index');
            $table->dropColumn('program_id');
        });
    }
};

