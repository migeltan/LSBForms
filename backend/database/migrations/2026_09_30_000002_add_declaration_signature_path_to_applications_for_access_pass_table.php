<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('applications_for_access_pass', function (Blueprint $t) {
            $t->string('declaration_signature_path')->nullable()->after('declaration_date');
        });
    }
    public function down(): void {
        Schema::table('applications_for_access_pass', fn (Blueprint $t) => $t->dropColumn('declaration_signature_path'));
    }
};