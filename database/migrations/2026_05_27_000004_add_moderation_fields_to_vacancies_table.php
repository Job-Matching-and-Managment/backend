<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vacancies', function (Blueprint $table) {
            $table->string('moderation_status', 20)->default('approved')->after('status');
            $table->boolean('is_archived')->default(false)->after('moderation_status');
            $table->boolean('is_flagged_suspicious')->default(false)->after('is_archived');
            $table->text('moderation_notes')->nullable()->after('is_flagged_suspicious');
            $table->timestamp('moderated_at')->nullable()->after('moderation_notes');
            $table->unsignedBigInteger('moderated_by')->nullable()->after('moderated_at');
        });
    }

    public function down(): void
    {
        Schema::table('vacancies', function (Blueprint $table) {
            $table->dropColumn([
                'moderation_status',
                'is_archived',
                'is_flagged_suspicious',
                'moderation_notes',
                'moderated_at',
                'moderated_by',
            ]);
        });
    }
};
