<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * applications_for_access_pass: one row per access pass application.
     * Mirrors the `applications_for_access_pass` table in schema.sql.
     */
    public function up(): void
    {
        Schema::create('applications_for_access_pass', function (Blueprint $table) {
            $table->id();
            $table->string('application_id', 20)->unique();
            $table->foreignId('applicant_id')->constrained('applicants')->cascadeOnDelete();
            $table->enum('status', [
                'Draft', 'Submitted', 'Under Review', 'Incomplete/Returned',
                'Approved', 'Rejected', 'Completed',
            ])->default('Draft');
            $table->dateTime('date_submitted')->nullable();
            $table->dateTime('date_reviewed')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('remarks')->nullable();
            $table->string('photo_path', 255)->nullable();
            $table->string('declaration_name', 150)->nullable();
            $table->date('declaration_date')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications_for_access_pass');
    }
};