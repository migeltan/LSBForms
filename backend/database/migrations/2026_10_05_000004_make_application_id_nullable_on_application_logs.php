<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('application_logs', function (Blueprint $table) {
            $table->string('application_id', 20)->nullable()->change();
        });
    }

    public function down(): void
    {
        DB::table('application_logs')->whereNull('application_id')->delete();

        Schema::table('application_logs', function (Blueprint $table) {
            $table->string('application_id', 20)->nullable(false)->change();
        });
    }
};