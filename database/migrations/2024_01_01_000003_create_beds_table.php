<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('beds', function (Blueprint $table) {
            $table->id();
            $table->string('bed_number');
            $table->foreignId('ward_id')->constrained()->cascadeOnDelete();
            $table->string('room');
            $table->enum('status', ['available', 'occupied', 'cleaning', 'maintenance'])->default('available');
            $table->float('pos_x')->default(40);
            $table->float('pos_y')->default(40);
            $table->foreignId('patient_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        // Now add the FK on patients.bed_id that references beds
        Schema::table('patients', function (Blueprint $table) {
            $table->foreign('bed_id')->references('id')->on('beds')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropForeign(['bed_id']);
        });
        Schema::dropIfExists('beds');
    }
};
