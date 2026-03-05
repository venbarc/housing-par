<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            // SQLite can't reliably drop/re-add foreign keys without table rebuilds.
            // For testing, it's sufficient to add the column without constraints.
            Schema::table('documents', function (Blueprint $table) {
                $table->unsignedBigInteger('bed_id')->nullable()->after('patient_id');
            });

            return;
        }

        Schema::table('documents', function (Blueprint $table) {
            $table->foreignId('bed_id')->nullable()->after('patient_id')->constrained()->nullOnDelete();
        });

        // Avoid doctrine/dbal dependency for change(): use raw SQL to set NULLable.
        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['patient_id']);
        });
        DB::statement('ALTER TABLE documents MODIFY patient_id BIGINT UNSIGNED NULL');
        Schema::table('documents', function (Blueprint $table) {
            $table->foreign('patient_id')->references('id')->on('patients')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            Schema::table('documents', function (Blueprint $table) {
                if (Schema::hasColumn('documents', 'bed_id')) {
                    $table->dropColumn('bed_id');
                }
            });

            return;
        }

        Schema::table('documents', function (Blueprint $table) {
            $table->dropConstrainedForeignId('bed_id');
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->dropForeign(['patient_id']);
        });
        DB::statement('ALTER TABLE documents MODIFY patient_id BIGINT UNSIGNED NOT NULL');
        Schema::table('documents', function (Blueprint $table) {
            $table->foreign('patient_id')->references('id')->on('patients')->cascadeOnDelete();
        });
    }
};
