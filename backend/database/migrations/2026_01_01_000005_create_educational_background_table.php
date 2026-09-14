<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * educational_background: repeatable entries per applicant.
     * Mirrors the `educational_background` table in schema.sql.
     */
    public function up(): void
    {
        Schema::create('educational_background', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_id')->constrained('applicants')->cascadeOnDelete();
            $table->string('school', 200);
            $table->string('degree', 150)->nullable();
            $table->string('year_graduated', 10)->nullable();
            $table->string('other_information', 255)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('educational_background');
    }
};
