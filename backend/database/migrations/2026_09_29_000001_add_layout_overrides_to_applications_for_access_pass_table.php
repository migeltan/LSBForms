<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications_for_access_pass', function (Blueprint $table) {
            // Per-application layout tweaks made in the admin layout editor.
            // NULL = use the template defaults (App\Support\AccessPassLayout).
            $table->json('layout_overrides')->nullable()->after('control_number');
        });
    }

    public function down(): void
    {
        Schema::table('applications_for_access_pass', function (Blueprint $table) {
            $table->dropColumn('layout_overrides');
        });
    }
};