<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * family_background: repeatable entries per applicant.
     * Mirrors the `family_background` table in schema.sql.
     */
    public function up(): void
    {
        Schema::create('family_background', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_id')->constrained('applicants')->cascadeOnDelete();
            $table->enum('relationship', ['Father', 'Mother', 'Spouse', 'Child/Dependent']);
            $table->string('name', 150);
            $table->string('occupation', 150)->nullable();
            $table->string('other_information', 255)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('family_background');
    }
};
