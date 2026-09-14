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
        DB::table('applicant_req_documents')->insert([
            ['doc_id' => 'DOC0001', 'position_id' => 'POS0001', 'doc_code' => 'NBI', 'document_name' => 'NBI', 'created_at' => now(), 'updated_at' => now()],
            ['doc_id' => 'DOC0002', 'position_id' => 'POS0002', 'doc_code' => 'CONSULTANCY', 'document_name' => 'Copy of consultancy', 'created_at' => now(), 'updated_at' => now()],
            ['doc_id' => 'DOC0003', 'position_id' => 'POS0003', 'doc_code' => 'FIREARMPERMIT', 'document_name' => 'Permit to carry firearms', 'created_at' => now(), 'updated_at' => now()],
            ['doc_id' => 'DOC0004', 'position_id' => 'POS0003', 'doc_code' => 'SECGENLETTER', 'document_name' => 'Letter request to the SecGen', 'created_at' => now(), 'updated_at' => now()],
            ['doc_id' => 'DOC0005', 'position_id' => 'POS0003', 'doc_code' => 'FIREARMLICENSE', 'document_name' => 'Firearm license', 'created_at' => now(), 'updated_at' => now()],
            ['doc_id' => 'DOC0006', 'position_id' => 'POS0003', 'doc_code' => 'DUTYORDER', 'document_name' => 'Duty detail order (PNP/AFP personnel)', 'created_at' => now(), 'updated_at' => now()],
            ['doc_id' => 'DOC0007', 'position_id' => 'POS0005', 'doc_code' => 'HEALTHCERT', 'document_name' => 'Health certificate', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}