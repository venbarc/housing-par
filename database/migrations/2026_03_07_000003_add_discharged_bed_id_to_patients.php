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

        Schema::table('patients', function (Blueprint $table) use ($driver) {
            $table->unsignedBigInteger('discharged_bed_id')->nullable()->after('bed_id');

            if ($driver !== 'sqlite') {
                $table->foreign('discharged_bed_id')->references('id')->on('beds')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver !== 'sqlite') {
            Schema::table('patients', function (Blueprint $table) {
                $table->dropForeign(['discharged_bed_id']);
            });
        }

        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn('discharged_bed_id');
        });
    }
};

