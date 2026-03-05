<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('beds', function (Blueprint $table) {
            $table->string('bed_type')->default('single')->after('bed_number');
        });

        // Backfill: default all to single, upgrade to bunk where double occupancy is already in use
        DB::table('beds')->update(['bed_type' => 'single']);
        DB::table('beds')
            ->where('is_double_occupancy', true)
            ->update(['bed_type' => 'bunk']);

        $twoPlusBedIds = DB::table('patients')
            ->select('bed_id')
            ->whereNotNull('bed_id')
            ->groupBy('bed_id')
            ->havingRaw('COUNT(*) >= 2')
            ->pluck('bed_id');

        if ($twoPlusBedIds->isNotEmpty()) {
            DB::table('beds')
                ->whereIn('id', $twoPlusBedIds)
                ->update(['bed_type' => 'bunk']);
        }
    }

    public function down(): void
    {
        Schema::table('beds', function (Blueprint $table) {
            $table->dropColumn('bed_type');
        });
    }
};
