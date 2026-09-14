<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * applicants: shared personal info for BOTH application types.
     * One applicant record per application (kept simple — a returning
     * applicant currently re-enters info; can be normalized further
     * later if needed). Mirrors the `applicants` table in schema.sql.
     */
    public function up(): void
    {
        Schema::create('applicants', function (Blueprint $table) {
            $table->id();
            $table->string('application_id', 20)->unique()->comment('e.g. AP-2026-00001');
            $table->enum('application_type', ['access-pass', 'vehicle-sticker'])
                ->comment('Which form this applicant record came from');
            $table->string('first_name', 100);
            $table->string('middle_name', 100)->nullable();
            $table->string('last_name', 100);
            $table->string('suffix', 20)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('place_of_birth', 150)->nullable();
            $table->enum('sex', ['Male', 'Female', 'Prefer not to say'])->nullable();
            $table->enum('civil_status', ['Single', 'Married', 'Widowed', 'Separated', 'Other'])->nullable();
            $table->text('address')->nullable();
            $table->string('contact_number', 30)->nullable();
            $table->string('email', 150)->nullable();
            $table->enum('applicant_type', ['Plantilla', 'Non-Plantilla', 'Consultant', 'Other']);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicants');
    }
};