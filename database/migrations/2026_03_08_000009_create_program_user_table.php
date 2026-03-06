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

        Schema::create('program_user', function (Blueprint $table) use ($driver) {
            $table->id();

            if ($driver === 'sqlite') {
                $table->unsignedBigInteger('user_id');
                $table->unsignedBigInteger('program_id');
            } else {
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('program_id')->constrained('programs')->cascadeOnDelete();
            }

            $table->timestamps();

            $table->unique(['user_id', 'program_id'], 'program_user_unique');
            $table->index('user_id');
            $table->index('program_id');
        });

        // Backfill existing single-program assignments into the pivot for convenience.
        if (Schema::hasColumn('users', 'program_id')) {
            $rows = DB::table('users')->select(['id', 'program_id'])->whereNotNull('program_id')->get();
            foreach ($rows as $row) {
                DB::table('program_user')->updateOrInsert(
                    ['user_id' => $row->id, 'program_id' => $row->program_id],
                    ['created_at' => now(), 'updated_at' => now()]
                );
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('program_user');
    }
};

