<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('company_phone')->nullable()->after('company_website');
            $table->string('company_contact_email')->nullable()->after('company_phone');
            $table->string('company_tin_number')->nullable()->after('company_contact_email');
            $table->string('business_license_path')->nullable()->after('company_tin_number');
            $table->string('business_license_status', 20)->default('pending')->after('business_license_path');

            $table->boolean('kyc_verified')->default(false)->after('business_license_status');
            $table->boolean('tin_verified')->default(false)->after('kyc_verified');
            $table->boolean('company_info_verified')->default(false)->after('tin_verified');

            $table->string('company_verification_status', 20)->default('pending')->after('company_info_verified');
            $table->timestamp('company_submitted_at')->nullable()->after('company_verification_status');
            $table->timestamp('company_verified_at')->nullable()->after('company_submitted_at');
            $table->unsignedBigInteger('company_verified_by')->nullable()->after('company_verified_at');
            $table->text('company_verification_notes')->nullable()->after('company_verified_by');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'company_phone',
                'company_contact_email',
                'company_tin_number',
                'business_license_path',
                'business_license_status',
                'kyc_verified',
                'tin_verified',
                'company_info_verified',
                'company_verification_status',
                'company_submitted_at',
                'company_verified_at',
                'company_verified_by',
                'company_verification_notes',
            ]);
        });
    }
};
