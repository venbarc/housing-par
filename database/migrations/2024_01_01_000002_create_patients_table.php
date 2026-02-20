<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedSmallInteger('age');
            $table->string('gender');
            $table->string('diagnosis');
            $table->enum('status', ['stable', 'critical', 'recovering', 'discharged'])->default('stable');
            $table->string('doctor');
            $table->date('admission_date');
            $table->string('contact');
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('bed_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
