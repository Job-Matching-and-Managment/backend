<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assessments', function (Blueprint $table) {
            $table->string('approval_status', 20)->default('approved')->after('is_ai_generated');
            $table->text('content_moderation_notes')->nullable()->after('approval_status');
            $table->timestamp('content_moderated_at')->nullable()->after('content_moderation_notes');
            $table->unsignedBigInteger('content_moderated_by')->nullable()->after('content_moderated_at');
        });

        Schema::table('cvs', function (Blueprint $table) {
            $table->string('summary_approval_status', 20)->default('approved')->after('summary');
            $table->text('summary_moderation_notes')->nullable()->after('summary_approval_status');
            $table->timestamp('summary_moderated_at')->nullable()->after('summary_moderation_notes');
            $table->unsignedBigInteger('summary_moderated_by')->nullable()->after('summary_moderated_at');
        });
    }

    public function down(): void
    {
        Schema::table('assessments', function (Blueprint $table) {
            $table->dropColumn([
                'approval_status',
                'content_moderation_notes',
                'content_moderated_at',
                'content_moderated_by',
            ]);
        });

        Schema::table('cvs', function (Blueprint $table) {
            $table->dropColumn([
                'summary_approval_status',
                'summary_moderation_notes',
                'summary_moderated_at',
                'summary_moderated_by',
            ]);
        });
    }
};
