<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('employer_verification_status', 20)
                ->default('pending')
                ->after('account_status');
            $table->timestamp('employer_submitted_at')
                ->nullable()
                ->after('employer_verification_status');
            $table->timestamp('employer_verified_at')
                ->nullable()
                ->after('employer_submitted_at');
            $table->unsignedBigInteger('employer_verified_by')
                ->nullable()
                ->after('employer_verified_at');
            $table->text('employer_verification_notes')
                ->nullable()
                ->after('employer_verified_by');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'employer_verification_status',
                'employer_submitted_at',
                'employer_verified_at',
                'employer_verified_by',
                'employer_verification_notes',
            ]);
        });
    }
};
