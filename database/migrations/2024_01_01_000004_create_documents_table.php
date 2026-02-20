<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->string('file_name');
            $table->string('file_type');
            $table->unsignedInteger('file_size');
            $table->string('storage_path');
            $table->text('file_url');
            $table->timestamp('uploaded_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
