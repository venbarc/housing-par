<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->boolean('vital_documents_access')->nullable()->after('homelessness_days_past_year');
            $table->boolean('phone_access')->nullable()->after('vital_documents_access');
            $table->boolean('employed_or_income')->nullable()->after('phone_access');
            $table->boolean('support_system')->nullable()->after('employed_or_income');
            $table->boolean('is_veteran')->nullable()->after('support_system');
            $table->string('veteran_connected_services')->nullable()->after('is_veteran'); // yes|no|na
            $table->boolean('seeking_mat_services')->nullable()->after('veteran_connected_services');
            $table->boolean('enrolled_mat_services')->nullable()->after('seeking_mat_services');

            $table->string('arrests_past_12_months')->nullable()->after('enrolled_mat_services'); // 0|1_2|3_4|5_plus
            $table->string('arrests_lifetime')->nullable()->after('arrests_past_12_months'); // 0|1_2|3_4|5_plus

            $table->string('jail_days_past_12_months')->nullable()->after('arrests_lifetime'); // 0|1_7|8_14|14_plus
            $table->string('jail_days_lifetime')->nullable()->after('jail_days_past_12_months'); // 0|1_7|8_14|14_plus

            $table->string('prison_time_past_12_months')->nullable()->after('jail_days_lifetime'); // 0|1_7|8_14|14_plus
            $table->string('prison_time_lifetime')->nullable()->after('prison_time_past_12_months'); // 0|1_7|8_14|14_plus
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn([
                'vital_documents_access',
                'phone_access',
                'employed_or_income',
                'support_system',
                'is_veteran',
                'veteran_connected_services',
                'seeking_mat_services',
                'enrolled_mat_services',
                'arrests_past_12_months',
                'arrests_lifetime',
                'jail_days_past_12_months',
                'jail_days_lifetime',
                'prison_time_past_12_months',
                'prison_time_lifetime',
            ]);
        });
    }
};

