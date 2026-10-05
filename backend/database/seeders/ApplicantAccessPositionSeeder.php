<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ApplicantAccessPositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rows = [
            ['position_id' => 'POS0001', 'application_position' => 'Congressional Staff', 'created_at' => now(), 'updated_at' => now()],
            ['position_id' => 'POS0002', 'application_position' => 'Consultant', 'created_at' => now(), 'updated_at' => now()],
            ['position_id' => 'POS0003', 'application_position' => 'House Member Security', 'created_at' => now(), 'updated_at' => now()],
            ['position_id' => 'POS0004', 'application_position' => 'Attached Agency', 'created_at' => now(), 'updated_at' => now()],
            ['position_id' => 'POS0005', 'application_position' => 'Concessionaire', 'created_at' => now(), 'updated_at' => now()],
            ['position_id' => 'POS0006', 'application_position' => 'Contractor', 'created_at' => now(), 'updated_at' => now()],
            ['position_id' => 'POS0007', 'application_position' => 'Security', 'created_at' => now(), 'updated_at' => now()],
            ['position_id' => 'POS0008', 'application_position' => 'Temporary ID for Secretariat', 'created_at' => now(), 'updated_at' => now()],
            ['position_id' => 'POS0009', 'application_position' => 'Auxiliary Service', 'created_at' => now(), 'updated_at' => now()],
        ];

        // Idempotent: safe to re-run on an already-seeded database.
        foreach ($rows as $row) {
            DB::table('applicant_access_position')->updateOrInsert(
                ['position_id' => $row['position_id']],
                ['application_position' => $row['application_position'], 'updated_at' => now()] + $row
            );
        }
    }
}