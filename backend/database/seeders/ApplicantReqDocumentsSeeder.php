<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ApplicantReqDocumentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rows = [
            ['doc_id' => 'DOC0001', 'position_id' => 'POS0001', 'doc_code' => 'NBI', 'document_name' => 'NBI Clearance', 'created_at' => now(), 'updated_at' => now()],
            ['doc_id' => 'DOC0002', 'position_id' => 'POS0002', 'doc_code' => 'CONSULTANCY', 'document_name' => 'Copy of Consultancy', 'created_at' => now(), 'updated_at' => now()],
            ['doc_id' => 'DOC0003', 'position_id' => 'POS0003', 'doc_code' => 'FIREARMPERMIT', 'document_name' => 'Permit to Carry Firearms', 'created_at' => now(), 'updated_at' => now()],
            ['doc_id' => 'DOC0004', 'position_id' => 'POS0003', 'doc_code' => 'SECGENLETTER', 'document_name' => 'Letter Request to the Secretary General', 'created_at' => now(), 'updated_at' => now()],
            ['doc_id' => 'DOC0005', 'position_id' => 'POS0003', 'doc_code' => 'FIREARMLICENSE', 'document_name' => 'Firearm License', 'created_at' => now(), 'updated_at' => now()],
            ['doc_id' => 'DOC0006', 'position_id' => 'POS0003', 'doc_code' => 'DUTYORDER', 'document_name' => 'Duty Detail Order (PNP/AFP personnel)', 'created_at' => now(), 'updated_at' => now()],
            ['doc_id' => 'DOC0007', 'position_id' => 'POS0005', 'doc_code' => 'HEALTHCERT', 'document_name' => 'Health Certificate', 'created_at' => now(), 'updated_at' => now()],
        ];

        // Idempotent: safe to re-run on an already-seeded database.
        foreach ($rows as $row) {
            DB::table('applicant_req_documents')->updateOrInsert(
                ['doc_id' => $row['doc_id']],
                ['position_id' => $row['position_id'], 'doc_code' => $row['doc_code'], 'document_name' => $row['document_name'], 'updated_at' => now()] + $row
            );
        }
    }
}