<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccessPassApplication;
use App\Models\Applicant;
use App\Models\DocumentAccessPass;
use App\Models\EducationalBackground;
use App\Models\FamilyBackground;
use App\Support\ReferenceNumberGenerator;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class AccessPassController extends Controller
{
    /**
     * Maps the form's file input names to the human-readable
     * document_type label stored alongside each upload.
     */
    private const DOCUMENT_FIELDS = [
        'doc_letter_request' => 'Letter Request',
        'doc_valid_id_1' => 'Valid ID 1',
        'doc_valid_id_2' => 'Valid ID 2',
        'doc_other' => 'Other',
    ];

    public function store(Request $request)
    {
        // Applicant-specific documents for the selected classification
        // (applicant_access_position / applicant_req_documents). File input
        // name is "req_{doc_code}"; stored document_type is the document name.
        $reqDocs = DB::table('applicant_req_documents as d')
            ->join('applicant_access_position as p', 'p.position_id', '=', 'd.position_id')
            ->where('p.application_position', $request->input('applicant_type'))
            ->get(['d.doc_code', 'd.document_name']);

        $reqRules = [];
        foreach ($reqDocs as $d) {
            $reqRules["req_{$d->doc_code}"] = ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'];
        }

        $validator = Validator::make($request->all(), $reqRules + [
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'suffix' => ['nullable', 'string', 'max:20'],
            'date_of_birth' => ['required', 'date'],
            'place_of_birth' => ['nullable', 'string', 'max:150'],
            'sex' => ['nullable', 'in:Male,Female,Prefer not to say'],
            'civil_status' => ['nullable', 'in:Single,Married,Widowed,Separated,Other'],
            'address' => ['nullable', 'string'],
            'contact_number' => ['required', 'string', 'max:30'],
            'email' => ['required', 'email', 'max:150'],
            'applicant_type' => ['required', 'string', Rule::exists('applicant_access_position', 'application_position')],

            'family_background' => ['required', 'string'],
            'educational_background' => ['required', 'string'],

            'declaration_name' => ['required', 'string', 'max:150'],
            'declaration_signature' => ['required', 'string', 'regex:/^data:image\/png;base64,/', 'max:2800000'],
            'declaration_date' => ['required', 'date'],

            'doc_letter_request' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
            'doc_valid_id_1' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
            'doc_valid_id_2' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
            'doc_other' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
            'applicant_photo' => ['required', 'file', 'mimes:jpg,jpeg,png', 'max:10240'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $familyBackground = json_decode($request->input('family_background'), true) ?? [];
        $educationalBackground = json_decode($request->input('educational_background'), true) ?? [];

        if (!is_array($familyBackground) || !is_array($educationalBackground)) {
            return response()->json([
                'errors' => ['family_background' => ['family_background and educational_background must be valid JSON arrays.']],
            ], 422);
        }

        $application = DB::transaction(function () use ($request, $data, $familyBackground, $educationalBackground, $reqDocs) {
            $requested = $request->input('reference_id');
            $applicationId = (is_string($requested)
                && preg_match('/^AP-\d{4}-\d{5}$/', $requested)
                && ! Applicant::where('application_id', $requested)->exists())
                ? $requested
                : ReferenceNumberGenerator::next('AP');

            $applicant = Applicant::create([
                'application_id' => $applicationId,
                'application_type' => 'access-pass',
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'last_name' => $data['last_name'],
                'suffix' => $data['suffix'] ?? null,
                'date_of_birth' => $data['date_of_birth'],
                'place_of_birth' => $data['place_of_birth'] ?? null,
                'sex' => $data['sex'] ?? null,
                'civil_status' => $data['civil_status'] ?? null,
                'address' => $data['address'] ?? null,
                'contact_number' => $data['contact_number'],
                'email' => $data['email'],
                'applicant_type' => $data['applicant_type'],
            ]);

            $photoPath = $this->storeUploadedFile($request->file('applicant_photo'), 'access-pass/photos');

            $application = AccessPassApplication::create([
                'application_id' => $applicationId,
                'applicant_id' => $applicant->id,
                'status' => 'Submitted',
                'date_submitted' => now(),
                'photo_path' => $photoPath,
                'declaration_name' => $data['declaration_name'],
                'declaration_date' => $data['declaration_date'],
                'declaration_signature_path' => $this->storeSignature($data['declaration_signature'], $applicationId),
            ]);

            foreach ($familyBackground as $member) {
                if (empty($member['relation']) && empty($member['name'])) {
                    continue;
                }
                FamilyBackground::create([
                    'applicant_id' => $applicant->id,
                    'relationship' => $member['relation'] ?? 'Father',
                    'name' => $member['name'] ?? '',
                    'occupation' => $member['occupation'] ?? null,
                    'other_information' => $member['contactNumber'] ?? null,
                ]);
            }

            foreach ($educationalBackground as $record) {
                if (empty($record['schoolName']) && empty($record['level'])) {
                    continue;
                }
                EducationalBackground::create([
                    'applicant_id' => $applicant->id,
                    'school' => $record['schoolName'] ?? '',
                    'degree' => $record['level'] ?? null,
                    'year_graduated' => $record['yearGraduated'] ?? null,
                    'other_information' => null,
                ]);
            }

            foreach (self::DOCUMENT_FIELDS as $field => $documentType) {
                if (!$request->hasFile($field)) {
                    continue;
                }

                $file = $request->file($field);
                $path = $this->storeUploadedFile($file, 'access-pass/documents');

                DocumentAccessPass::create([
                    'application_id' => $applicationId,
                    'document_type' => $documentType,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'verification_status' => 'Pending',
                ]);
            }

            foreach ($reqDocs as $d) {
                $file = $request->file("req_{$d->doc_code}");
                DocumentAccessPass::create([
                    'application_id' => $applicationId,
                    'document_type' => $d->document_name,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $this->storeUploadedFile($file, 'access-pass/documents'),
                    'verification_status' => 'Pending',
                ]);
            }

            return $application;
        });

        return response()->json([
            'message' => 'Access pass application submitted successfully.',
            'application_id' => $application->application_id,
        ], 201);
    }

    /**
     * Fetch a single access pass application by its human-readable
     * reference number (e.g. AP-2026-00001) — used by routes/api.php:
     * GET /access-pass/{application_id}
     */
    public function show(string $application_id)
    {
        $application = AccessPassApplication::with(['applicant', 'documents'])
            ->where('application_id', $application_id)
            ->first();

        if (!$application) {
            return response()->json(['message' => 'Application not found.'], 404);
        }

        return response()->json($application);
    }

    /**
     * Marks a Draft application as formally Submitted — used by
     * routes/api.php: POST /access-pass/{application_id}/submit
     * NOTE: placeholder implementation. store() above already sets
     * status to 'Submitted' immediately on creation, so this endpoint
     * only matters if you introduce a genuine Draft-save step later.
     */
    public function submit(string $application_id)
    {
        $application = AccessPassApplication::where('application_id', $application_id)->first();

        if (!$application) {
            return response()->json(['message' => 'Application not found.'], 404);
        }

        $application->update([
            'status' => 'Submitted',
            'date_submitted' => now(),
        ]);

        return response()->json(['message' => 'Application submitted.', 'application_id' => $application_id]);
    }

    private function storeUploadedFile($file, string $directory): string
    {
        return $file->store($directory, 'public');
    }

        /** Decodes the PNG data URL from the signature pad and stores it as a file. */
    private function storeSignature(string $dataUrl, string $applicationId): string
    {
        $binary = base64_decode(substr($dataUrl, strpos($dataUrl, ',') + 1), true);

        if ($binary === false || ! str_starts_with($binary, "\x89PNG\r\n\x1a\n")) {
            abort(422, 'The signature image is invalid. Please sign again.');
        }

        $path = "access-pass/signatures/{$applicationId}.png";
        Storage::disk('public')->put($path, $binary);

        return $path;
    }

    /** POST /access-pass/reserve-reference — see App\Support\ReferenceNumberGenerator */
    public function reserveReference()
    {
        return response()->json(['application_id' => ReferenceNumberGenerator::next('AP')]);
    }
}