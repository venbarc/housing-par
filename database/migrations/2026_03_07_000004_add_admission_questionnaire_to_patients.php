<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->string('psych_services_access')->nullable()->after('discharged_at');
            $table->string('therapy_services_access')->nullable()->after('psych_services_access');
            $table->string('pcp_services_access')->nullable()->after('therapy_services_access');
            $table->string('medications_access')->nullable()->after('pcp_services_access');

            $table->string('er_visits_past_year')->nullable()->after('medications_access');
            $table->string('inpatient_stays_past_year')->nullable()->after('er_visits_past_year');

            $table->boolean('dependable_transportation')->nullable()->after('inpatient_stays_past_year');
            $table->boolean('stable_housing')->nullable()->after('dependable_transportation');

            $table->string('homelessness_days_past_year')->nullable()->after('stable_housing');
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn([
                'psych_services_access',
                'therapy_services_access',
                'pcp_services_access',
                'medications_access',
                'er_visits_past_year',
                'inpatient_stays_past_year',
                'dependable_transportation',
                'stable_housing',
                'homelessness_days_past_year',
            ]);
        });
    }
};

