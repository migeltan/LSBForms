<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * document_access-pass: uploaded files for access pass applications.
     * application_id here refers to the human-readable ref number
     * (AP-2026-00001), NOT a foreign key, since it points to the
     * access_pass_applications table via that ref number.
     */
    public function up(): void
    {
        Schema::create('document_access-pass', function (Blueprint $table) {
            $table->id();
            $table->string('application_id', 20)->index();
            $table->string('document_type', 100)->comment("e.g. 'Letter Request', 'Valid ID 1', 'OR/CR'");
            $table->string('file_name', 255);
            $table->string('file_path', 255);
            $table->timestamp('uploaded_at')->useCurrent();
            $table->enum('verification_status', ['Pending', 'Verified', 'Rejected'])->default('Pending');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_access-pass');
    }
};