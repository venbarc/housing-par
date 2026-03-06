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

        Schema::create('audit_logs', function (Blueprint $table) use ($driver) {
            $table->id();

            $table->unsignedBigInteger('user_id')->nullable();
            if ($driver !== 'sqlite') {
                $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            }

            $table->unsignedBigInteger('facility_id')->nullable();
            $table->unsignedBigInteger('program_id')->nullable();

            $table->string('action');
            $table->string('auditable_type')->nullable();
            $table->unsignedBigInteger('auditable_id')->nullable();

            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();

            $table->text('url')->nullable();
            $table->string('method', 16)->nullable();
            $table->string('ip_address', 64)->nullable();
            $table->text('user_agent')->nullable();

            $table->timestamp('created_at')->useCurrent();

            $table->index(['facility_id', 'program_id'], 'audit_logs_facility_program_index');
            $table->index('user_id');
            $table->index(['auditable_type', 'auditable_id'], 'audit_logs_auditable_index');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver !== 'sqlite') {
            Schema::table('audit_logs', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });
        }

        Schema::dropIfExists('audit_logs');
    }
};

