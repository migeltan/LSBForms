<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * applications_for_vehicle-sticker: one row per vehicle sticker application.
     * Mirrors the `applications_for_vehicle-sticker` table in schema.sql,
     * including the Clearance branch section (admin-only, section 13 of proposal).
     */
    public function up(): void
    {
        Schema::create('applications_for_vehicle-sticker', function (Blueprint $table) {
            $table->id();
            $table->string('application_id', 20)->unique();
            $table->foreignId('applicant_id')->constrained('applicants')->cascadeOnDelete();
            $table->string('plate_number', 20);
            $table->string('vehicle_type', 50)->nullable();
            $table->string('make', 80)->nullable();
            $table->string('model', 80)->nullable();
            $table->string('color', 40)->nullable();
            $table->string('year', 10)->nullable();
            $table->string('registration_information', 255)->nullable();
            $table->enum('ownership', ['Registered to Applicant', 'Not Registered to Applicant']);
            $table->enum('status', [
                'Draft', 'Submitted', 'Under Review', 'Incomplete/Returned',
                'Approved', 'Rejected', 'Completed',
            ])->default('Draft');
            $table->text('remarks')->nullable();
            $table->dateTime('date_submitted')->nullable();

            // Clearance branch section (admin-only, section 13 of proposal)
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('date_reviewed')->nullable();
            $table->string('clearance_status', 50)->nullable();
            $table->date('approval_date')->nullable();
            $table->string('sticker_number', 30)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications_for_vehicle-sticker');
    }
};