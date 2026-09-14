<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * application_logs: simple audit trail.
     * Mirrors the `application_logs` table in schema.sql.
     */
    public function up(): void
    {
        Schema::create('application_logs', function (Blueprint $table) {
            $table->id();
            $table->string('application_id', 20)->index();
            $table->foreignId('user_id')->nullable()
                ->comment('NULL when the action was performed by the applicant, not an admin')
                ->constrained('users')->nullOnDelete();
            $table->string('action', 150);
            $table->text('remarks')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_logs');
    }
};
