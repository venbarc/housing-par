<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Seed a default program used by backfills and existing data.
        if (! DB::table('programs')->where('name', 'Navigation Center Info')->exists()) {
            DB::table('programs')->insert([
                'name' => 'Navigation Center Info',
                'notes' => 'Default program',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('programs');
    }
};

