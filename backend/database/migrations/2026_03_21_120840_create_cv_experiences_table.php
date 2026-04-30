<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cv_experiences', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(App\Models\Cv::class)->constrained()->onDelete('cascade');
            $table->string('job_title');
            $table->string('company_name');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cv_experiences');
    }
};
