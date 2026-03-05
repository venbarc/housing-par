<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::getDriverName();

        Schema::create('facilities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        if ($driver === 'sqlite') {
            // SQLite can't add FK constraints to an existing table without rebuilds; keep it simple for tests.
            Schema::table('rooms', function (Blueprint $table) {
                $table->unsignedBigInteger('facility_id')->nullable()->after('id');
            });
        } else {
            Schema::table('rooms', function (Blueprint $table) {
                $table->foreignId('facility_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            });
        }

        // Backfill existing rooms into a default facility
        $defaultFacilityId = null;
        if (Schema::hasTable('facilities')) {
            $defaultFacilityId = DB::table('facilities')->insertGetId([
                'name' => 'Default Facility',
                'notes' => 'Auto-created during migration',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        if (Schema::hasColumn('rooms', 'facility_id') && $defaultFacilityId) {
            DB::table('rooms')->update(['facility_id' => $defaultFacilityId]);
        }

        // Avoid doctrine/dbal dependency for change(): use raw SQL to enforce NOT NULL after backfill (MySQL only).
        // Test env uses SQLite (:memory:), which doesn't support MODIFY.
        if ($driver === 'mysql') {
            // MySQL: foreignId() => BIGINT UNSIGNED
            DB::statement('ALTER TABLE rooms MODIFY facility_id BIGINT UNSIGNED NOT NULL');
        }
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver !== 'sqlite') {
            Schema::table('rooms', function (Blueprint $table) {
                $table->dropForeign(['facility_id']);
            });
        }

        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn('facility_id');
        });

        Schema::dropIfExists('facilities');
    }
};
