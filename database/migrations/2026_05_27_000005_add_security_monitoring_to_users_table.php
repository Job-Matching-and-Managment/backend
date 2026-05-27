<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_flagged_suspicious')->default(false)->after('status_changed_at');
            $table->text('security_notes')->nullable()->after('is_flagged_suspicious');
            $table->timestamp('security_flagged_at')->nullable()->after('security_notes');
            $table->unsignedBigInteger('security_flagged_by')->nullable()->after('security_flagged_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'is_flagged_suspicious',
                'security_notes',
                'security_flagged_at',
                'security_flagged_by',
            ]);
        });
    }
};
