<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Access Pass control number, e.g. "1AA-1000". Assigned once, when the
     * application is approved (see App\Service\ControlNumberService).
     *
     * The vehicle decal number reuses the existing `sticker_number` column
     * on applications_for_vehicle-sticker, so no change is needed there.
     */
    public function up(): void
    {
        Schema::table('applications_for_access_pass', function (Blueprint $table) {
            $table->string('control_number', 20)->nullable()->unique()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('applications_for_access_pass', function (Blueprint $table) {
            $table->dropUnique(['control_number']);
            $table->dropColumn('control_number');
        });
    }
};