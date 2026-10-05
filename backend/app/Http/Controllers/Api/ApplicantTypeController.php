<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class ApplicantTypeController extends Controller
{
    /**
     * GET /api/applicant-types
     * Applicant classifications + their additional (applicant-specific)
     * required documents, from applicant_access_position / applicant_req_documents.
     */
    public function index()
    {
        $docs = DB::table('applicant_req_documents')->orderBy('doc_id')->get()->groupBy('position_id');

        return response()->json(
            DB::table('applicant_access_position')->orderBy('position_id')->get()->map(fn ($p) => [
                'id' => $p->position_id,
                'name' => $p->application_position,
                'documents' => ($docs[$p->position_id] ?? collect())->map(fn ($d) => [
                    'code' => $d->doc_code,
                    'name' => $d->document_name,
                ])->values(),
            ])->values()
        );
    }
}