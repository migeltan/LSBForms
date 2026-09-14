<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Applicant;
use App\Models\DocumentVehicleSticker;
use App\Models\VehicleApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class VehicleStickerController extends Controller
{
    /**
     * Maps the form's file input names to the human-readable
     * document_type label stored alongside each upload.
     */
    private const DOCUMENT_FIELDS = [
        'doc_or_cr' => 'OR/CR',
        'doc_deed_of_sale' => 'Deed of Sale',
        'doc_hrep_id' => 'HRep ID',
        'doc_chattel_mortgage' => 'Chattel Mortgage',
        'doc_company_certificate' => "Company/Secretary's Certificate",
    ];

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'hrep_id_number' => ['nullable', 'string', 'max:50'],
            'contact_number' => ['required', 'string', 'max:30'],
            'email' => ['required', 'email', 'max:150'],

            'plate_number' => ['required', 'string', 'max:20'],
            'vehicle_type' => ['nullable', 'in:Sedan,SUV,Van,Motorcycle,Other'],
            'color' => ['nullable', 'string', 'max:40'],
            'make' => ['required', 'string', 'max:80'],
            'model' => ['required', 'string', 'max:80'],
            'year' => ['nullable', 'string', 'max:10'],
            'registration_information' => ['nullable', 'string', 'max:255'],
            'ownership' => ['required', 'in:Registered to Applicant,Not Registered to Applicant'],

            'doc_or_cr' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
            'doc_deed_of_sale' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
            'doc_hrep_id' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
            'doc_chattel_mortgage' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
            'doc_company_certificate' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Deed of Sale is only shown/required client-side when the vehicle
        // isn't registered to the applicant — re-checked here server-side.
        if ($data['ownership'] === 'Not Registered to Applicant' && !$request->hasFile('doc_deed_of_sale')) {
            return response()->json([
                'errors' => ['doc_deed_of_sale' => ['Deed of Sale is required when the vehicle is not registered to the applicant.']],
            ], 422);
        }

        $application = DB::transaction(function () use ($request, $data) {
            $applicationId = $this->generateApplicationId();

            $applicant = Applicant::create([
                'application_id' => $applicationId,
                'application_type' => 'vehicle-sticker',
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'last_name' => $data['last_name'],
                'contact_number' => $data['contact_number'],
                'email' => $data['email'],
                // The vehicle sticker form has no employment-category field,
                // but `applicants.applicant_type` is NOT NULL in the schema.
                // Defaulting to 'Other' as a placeholder — consider making
                // this column nullable if it's genuinely inapplicable here.
                'applicant_type' => 'Other',
            ]);

            $vehicleApplication = VehicleApplication::create([
                'application_id' => $applicationId,
                'applicant_id' => $applicant->id,
                'plate_number' => $data['plate_number'],
                'vehicle_type' => $data['vehicle_type'] ?? null,
                'make' => $data['make'],
                'model' => $data['model'],
                'color' => $data['color'] ?? null,
                'year' => $data['year'] ?? null,
                'registration_information' => $data['registration_information'] ?? null,
                'ownership' => $data['ownership'],
                'status' => 'Submitted',
                'date_submitted' => now(),
            ]);

            foreach (self::DOCUMENT_FIELDS as $field => $documentType) {
                if (!$request->hasFile($field)) {
                    continue;
                }

                $file = $request->file($field);
                $path = $file->store('vehicle-sticker/documents', 'public');

                DocumentVehicleSticker::create([
                    'application_id' => $applicationId,
                    'document_type' => $documentType,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'verification_status' => 'Pending',
                ]);
            }

            return $vehicleApplication;
        });

        return response()->json([
            'message' => 'Vehicle sticker application submitted successfully.',
            'application_id' => $application->application_id,
        ], 201);
    }

    /**
     * Fetch a single vehicle sticker application by its human-readable
     * reference number (e.g. VS-2026-00001) — used by routes/api.php:
     * GET /vehicle-sticker/{application_id}
     */
    public function show(string $application_id)
    {
        $application = VehicleApplication::with(['applicant', 'documents'])
            ->where('application_id', $application_id)
            ->first();

        if (!$application) {
            return response()->json(['message' => 'Application not found.'], 404);
        }

        return response()->json($application);
    }

    /**
     * Marks a Draft application as formally Submitted — used by
     * routes/api.php: POST /vehicle-sticker/{application_id}/submit
     * NOTE: placeholder implementation. store() above already sets
     * status to 'Submitted' immediately on creation, so this endpoint
     * only matters if you introduce a genuine Draft-save step later.
     */
    public function submit(string $application_id)
    {
        $application = VehicleApplication::where('application_id', $application_id)->first();

        if (!$application) {
            return response()->json(['message' => 'Application not found.'], 404);
        }

        $application->update([
            'status' => 'Submitted',
            'date_submitted' => now(),
        ]);

        return response()->json(['message' => 'Application submitted.', 'application_id' => $application_id]);
    }

    /**
     * Generates a human-readable ref number like VS-2026-00001.
     * NOTE: same simple count-based approach as AccessPassController —
     * see that class's generateApplicationId() for caveats.
     */
    private function generateApplicationId(): string
    {
        $year = date('Y');
        $count = Applicant::where('application_type', 'vehicle-sticker')
            ->whereYear('created_at', $year)
            ->count();

        return sprintf('VS-%s-%05d', $year, $count + 1);
    }
}