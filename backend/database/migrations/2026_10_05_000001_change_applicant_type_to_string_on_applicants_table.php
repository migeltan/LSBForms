<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * applicants.applicant_type was a fixed enum (Plantilla, Non-Plantilla, ...).
     * Classifications now live in applicant_access_position, so store the
     * position name as a plain string. Existing values are preserved.
     */
    public function up(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->string('applicant_type', 100)->change();
        });
    }

    public function down(): void
    {
        // Intentionally not restored to the old enum: new values would not fit.
    }
};