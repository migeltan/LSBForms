<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications_for_vehicle-sticker', function (Blueprint $table) {
            // Per-application tweak to the sticker number's position/size.
            // NULL = template defaults (App\Support\StickerLayout).
            $table->json('layout_overrides')->nullable()->after('sticker_number');
        });
    }

    public function down(): void
    {
        Schema::table('applications_for_vehicle-sticker', function (Blueprint $table) {
            $table->dropColumn('layout_overrides');
        });
    }
};