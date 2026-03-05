<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            // Nullable for migration safety; required at the application layer.
            $table->string('first_name')->nullable()->after('id');
            $table->string('last_name')->nullable()->after('first_name');
            $table->date('dob')->nullable()->after('last_name');
            // Temporary column to avoid clashing with the existing patients.status field.
            $table->enum('intake_status', ['referral', 'walk_in'])->default('referral')->after('dob');
            $table->string('referral_from')->nullable()->after('intake_status');
            $table->string('insurance')->nullable()->after('referral_from');
            $table->date('intake_date')->nullable()->after('insurance');
            $table->date('discharge_date')->nullable()->after('intake_date');
            $table->timestamp('discharged_at')->nullable()->after('discharge_date');
        });

        // Best-effort backfill from existing columns.
        if (Schema::hasColumn('patients', 'name')) {
            $patients = DB::table('patients')->select(['id', 'name'])->orderBy('id')->get();
            foreach ($patients as $patient) {
                $name = trim((string) ($patient->name ?? ''));
                if ($name === '') {
                    continue;
                }
                $parts = preg_split('/\s+/', $name) ?: [];
                $first = $parts[0] ?? '';
                $last = count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : '';
                DB::table('patients')->where('id', $patient->id)->update([
                    'first_name' => $first,
                    'last_name' => $last !== '' ? $last : $first,
                ]);
            }
        }

        if (Schema::hasColumn('patients', 'admission_date')) {
            DB::table('patients')->whereNull('intake_date')->update(['intake_date' => DB::raw('admission_date')]);
        }

        if (Schema::hasColumn('patients', 'possible_discharge_date')) {
            DB::table('patients')->whereNull('discharge_date')->update(['discharge_date' => DB::raw('possible_discharge_date')]);
        }

        // Drop old columns (replaced by new intake-centric fields).
        Schema::table('patients', function (Blueprint $table) {
            $drop = [];
            foreach (['name', 'age', 'gender', 'diagnosis', 'doctor', 'admission_date', 'possible_discharge_date', 'contact', 'notes', 'status'] as $col) {
                if (Schema::hasColumn('patients', $col)) {
                    $drop[] = $col;
                }
            }
            if (! empty($drop)) {
                $table->dropColumn($drop);
            }
        });

        // Promote the new intake status column to be the canonical status.
        DB::statement('ALTER TABLE patients RENAME COLUMN intake_status TO status');

        // Enforce max 1 active occupant per bed.
        Schema::table('patients', function (Blueprint $table) {
            if (Schema::hasColumn('patients', 'bed_id')) {
                $table->unique('bed_id', 'patients_bed_id_unique');
            }
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropUnique('patients_bed_id_unique');
        });

        // Best-effort: restore the old status semantics.
        if (Schema::hasColumn('patients', 'status')) {
            DB::statement("ALTER TABLE patients DROP COLUMN status");
            DB::statement("ALTER TABLE patients ADD COLUMN status ENUM('stable','critical','recovering','discharged') NOT NULL DEFAULT 'stable'");
        }

        // Re-add old columns as nullable (best-effort) and drop new columns.
        Schema::table('patients', function (Blueprint $table) {
            $newCols = ['first_name', 'last_name', 'dob', 'referral_from', 'insurance', 'intake_date', 'discharge_date', 'discharged_at'];
            $drop = array_values(array_filter($newCols, fn ($col) => Schema::hasColumn('patients', $col)));
            if (! empty($drop)) {
                $table->dropColumn($drop);
            }

            if (! Schema::hasColumn('patients', 'name')) {
                $table->string('name')->nullable();
            }
            if (! Schema::hasColumn('patients', 'age')) {
                $table->unsignedSmallInteger('age')->nullable();
            }
            if (! Schema::hasColumn('patients', 'gender')) {
                $table->string('gender')->nullable();
            }
            if (! Schema::hasColumn('patients', 'diagnosis')) {
                $table->string('diagnosis')->nullable();
            }
            if (! Schema::hasColumn('patients', 'doctor')) {
                $table->string('doctor')->nullable();
            }
            if (! Schema::hasColumn('patients', 'admission_date')) {
                $table->date('admission_date')->nullable();
            }
            if (! Schema::hasColumn('patients', 'possible_discharge_date')) {
                $table->date('possible_discharge_date')->nullable();
            }
            if (! Schema::hasColumn('patients', 'contact')) {
                $table->string('contact')->nullable();
            }
            if (! Schema::hasColumn('patients', 'notes')) {
                $table->text('notes')->nullable();
            }
        });
    }
};
