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
        Schema::create('applicant_req_documents', function (Blueprint $table) {
            $table->string('doc_id', 10)->primary(); // format: DOC0001
            $table->string('position_id', 10);
            $table->string('doc_code', 50); // one-word alias, e.g. NBI, FIREARMPERMIT
            $table->string('document_name', 150);
            $table->timestamps();

            $table->foreign('position_id')
                  ->references('position_id')
                  ->on('applicant_access_position')
                  ->onUpdate('cascade')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applicant_req_documents');
    }
};