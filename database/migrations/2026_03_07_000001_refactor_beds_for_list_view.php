<?php

use App\Models\Bed;
use App\Models\Patient;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Convert existing "bunk" beds into two records: double_top and double_bottom.
        if (Schema::hasColumn('beds', 'bed_type')) {
            $bunkBeds = DB::table('beds')
                ->where('bed_type', 'bunk')
                ->orderBy('id')
                ->get();

            foreach ($bunkBeds as $bed) {
                $patients = DB::table('patients')
                    ->where('bed_id', $bed->id)
                    ->orderBy('id')
                    ->get();

                if ($patients->count() > 2) {
                    throw new RuntimeException("Bed {$bed->id} has {$patients->count()} patients; cannot split into Top/Bottom safely.");
                }

                $originalNumber = (string) $bed->bed_number;
                $baseNumber = preg_replace('/-(Top|Bottom)$/', '', $originalNumber) ?? $originalNumber;
                $topNumber = "{$baseNumber}-Top";
                $bottomNumber = "{$baseNumber}-Bottom";

                // Update existing bed => Top.
                DB::table('beds')
                    ->where('id', $bed->id)
                    ->update([
                        'bed_type' => 'double_top',
                        'bed_number' => $topNumber,
                        'updated_at' => now(),
                    ]);

                // Create Bottom bed.
                $bottomBedId = DB::table('beds')->insertGetId([
                    'bed_number' => $bottomNumber,
                    'bed_type' => 'double_bottom',
                    'room_id' => $bed->room_id,
                    'status' => 'available',
                    'pos_x' => $bed->pos_x ?? 40,
                    'pos_y' => $bed->pos_y ?? 40,
                    'is_double_occupancy' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Reassign any patients to Top/Bottom.
                if ($patients->count() >= 1) {
                    DB::table('patients')->where('id', $patients[0]->id)->update(['bed_id' => $bed->id]);
                    DB::table('beds')->where('id', $bed->id)->update(['status' => 'occupied']);
                } else {
                    DB::table('beds')->where('id', $bed->id)->update(['status' => $bed->status]);
                }

                if ($patients->count() === 2) {
                    DB::table('patients')->where('id', $patients[1]->id)->update(['bed_id' => $bottomBedId]);
                    DB::table('beds')->where('id', $bottomBedId)->update(['status' => 'occupied']);
                }
            }

            // Normalize any remaining bed_type values to the new set.
            DB::table('beds')
                ->whereNotIn('bed_type', ['single', 'ada_single', 'double_top', 'double_bottom'])
                ->update(['bed_type' => 'single']);
        }

        // Remove layout/double-occupancy fields.
        Schema::table('beds', function (Blueprint $table) {
            if (Schema::hasColumn('beds', 'pos_x')) {
                $table->dropColumn('pos_x');
            }
            if (Schema::hasColumn('beds', 'pos_y')) {
                $table->dropColumn('pos_y');
            }
            if (Schema::hasColumn('beds', 'is_double_occupancy')) {
                $table->dropColumn('is_double_occupancy');
            }
        });
    }

    public function down(): void
    {
        Schema::table('beds', function (Blueprint $table) {
            if (! Schema::hasColumn('beds', 'pos_x')) {
                $table->float('pos_x')->default(40);
            }
            if (! Schema::hasColumn('beds', 'pos_y')) {
                $table->float('pos_y')->default(40);
            }
            if (! Schema::hasColumn('beds', 'is_double_occupancy')) {
                $table->boolean('is_double_occupancy')->default(false);
            }
        });

        // Best-effort: map the new types back to "single" or "bunk".
        if (Schema::hasColumn('beds', 'bed_type')) {
            DB::table('beds')
                ->whereIn('bed_type', ['double_top', 'double_bottom'])
                ->update(['bed_type' => 'bunk']);

            DB::table('beds')
                ->where('bed_type', 'ada_single')
                ->update(['bed_type' => 'single']);
        }
    }
};
