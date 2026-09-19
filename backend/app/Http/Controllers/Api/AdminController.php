<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccessPassApplication;
use App\Models\Applicant;
use App\Models\ApplicationLog;
use App\Models\VehicleApplication;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/**
 * NOTE: the ID/sticker PDF preview + download endpoints
 * (previewAccessPassId, downloadAccessPassId, previewVehicleStickerId,
 * downloadVehicleStickerId) no longer live here. They're wired directly
 * from routes/api.php to App\Service\PdfGeneratorService — see that
 * class for all rendering/Browsershot logic.
 */
class AdminController extends Controller
{
    /**
     * GET /api/admin/applications
     * Combined review queue for the admin dashboard.
     */
    public function index(Request $request)
    {
        $accessPass = AccessPassApplication::with('applicant')
            ->latest('id')
            ->get()
            ->map(fn ($a) => [
                'type' => 'access-pass',
                'application_id' => $a->application_id,
                'applicant_name' => $a->applicant?->full_name,
                'status' => $a->status,
                'date_submitted' => $a->date_submitted,
            ]);

        $vehicle = VehicleApplication::with('applicant')
            ->latest('id')
            ->get()
            ->map(fn ($a) => [
                'type' => 'vehicle-sticker',
                'application_id' => $a->application_id,
                'applicant_name' => $a->applicant?->full_name,
                'status' => $a->status,
                'date_submitted' => $a->date_submitted,
            ]);

        return response()->json(
            $accessPass->concat($vehicle)->sortByDesc('date_submitted')->values()
        );
    }

    /**
     * GET /api/admin/access-pass
     */
    public function accessPassList(Request $request)
    {
        $rows = AccessPassApplication::with('applicant')
            ->latest('date_submitted')
            ->get()
            ->map(fn (AccessPassApplication $a) => [
                'applicant_id' => $a->applicant?->id,
                'application_id' => $a->application_id,
                'full_name' => $a->applicant?->full_name,
                'applicant_type' => $a->applicant?->applicant_type,
                'date_submitted' => $a->date_submitted,
                'status' => $a->status,
            ]);

        return response()->json($rows);
    }

    /**
     * GET /api/admin/access-pass/{applicantId}
     */
    public function accessPassShow(int $applicantId)
    {
        $applicant = Applicant::with([
            'accessPassApplication.documents',
            'accessPassApplication.reviewer',
            'familyBackground',
            'educationalBackground',
        ])->findOrFail($applicantId);

        return response()->json($this->formatAccessPassDetail($applicant));
    }

    /**
     * PATCH /api/admin/access-pass/{applicantId}/update
     */
    public function updateAccessPass(Request $request, int $applicantId)
    {
        $applicant = Applicant::with([
            'accessPassApplication',
            'familyBackground',
            'educationalBackground',
        ])->findOrFail($applicantId);

        $validator = Validator::make($request->all(), [
            'personal_information' => ['required', 'array'],
            'personal_information.first_name' => ['required', 'string', 'max:255'],
            'personal_information.middle_name' => ['nullable', 'string', 'max:255'],
            'personal_information.last_name' => ['required', 'string', 'max:255'],
            'personal_information.suffix' => ['nullable', 'string', 'max:20'],
            'personal_information.date_of_birth' => ['nullable', 'date'],
            'personal_information.place_of_birth' => ['nullable', 'string', 'max:255'],
            'personal_information.sex' => ['nullable', 'string', 'max:20'],
            'personal_information.civil_status' => ['nullable', 'string', 'max:30'],
            'personal_information.address' => ['nullable', 'string', 'max:500'],
            'personal_information.contact_number' => ['nullable', 'string', 'max:30'],
            'personal_information.email' => ['nullable', 'email', 'max:255'],
            'personal_information.applicant_type' => ['nullable', 'string', 'max:50'],
            'personal_information.remarks' => ['nullable', 'string'],
            'personal_information.declaration_name' => ['nullable', 'string', 'max:255'],
            'personal_information.declaration_date' => ['nullable', 'date'],

            'family_background' => ['array'],
            'family_background.*.id' => ['nullable', 'integer'],
            'family_background.*.relationship' => ['required_with:family_background', 'string', 'max:100'],
            'family_background.*.name' => ['required_with:family_background', 'string', 'max:255'],
            'family_background.*.occupation' => ['nullable', 'string', 'max:255'],
            'family_background.*.other_information' => ['nullable', 'string'],

            'educational_background' => ['array'],
            'educational_background.*.id' => ['nullable', 'integer'],
            'educational_background.*.school' => ['required_with:educational_background', 'string', 'max:255'],
            'educational_background.*.degree' => ['nullable', 'string', 'max:255'],
            'educational_background.*.year_graduated' => ['nullable', 'string', 'max:20'],
            'educational_background.*.other_information' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid input.', 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        DB::transaction(function () use ($applicant, $data, $request) {
            $p = $data['personal_information'];

            $applicant->update([
                'first_name' => $p['first_name'],
                'middle_name' => $p['middle_name'] ?? null,
                'last_name' => $p['last_name'],
                'suffix' => $p['suffix'] ?? null,
                'date_of_birth' => $p['date_of_birth'] ?? null,
                'place_of_birth' => $p['place_of_birth'] ?? null,
                'sex' => $p['sex'] ?? null,
                'civil_status' => $p['civil_status'] ?? null,
                'address' => $p['address'] ?? null,
                'contact_number' => $p['contact_number'] ?? null,
                'email' => $p['email'] ?? null,
                'applicant_type' => $p['applicant_type'] ?? null,
            ]);

            if ($applicant->accessPassApplication) {
                $applicant->accessPassApplication->update([
                    'remarks' => $p['remarks'] ?? null,
                    'declaration_name' => $p['declaration_name'] ?? null,
                    'declaration_date' => $p['declaration_date'] ?? null,
                ]);
            }

            $this->syncRows(
                $applicant->familyBackground(),
                $data['family_background'] ?? [],
                ['relationship', 'name', 'occupation', 'other_information']
            );

            $this->syncRows(
                $applicant->educationalBackground(),
                $data['educational_background'] ?? [],
                ['school', 'degree', 'year_graduated', 'other_information']
            );

            ApplicationLog::create([
                'application_id' => $applicant->application_id,
                'user_id' => $request->user()->id,
                'action' => 'Applicant details updated',
            ]);
        });

        $applicant = $applicant->fresh([
            'accessPassApplication.documents',
            'accessPassApplication.reviewer',
            'familyBackground',
            'educationalBackground',
        ]);

        return response()->json($this->formatAccessPassDetail($applicant));
    }

    /**
     * DELETE /api/admin/access-pass/{applicantId}
     */
    public function destroyAccessPass(Request $request, int $applicantId)
    {
        $applicant = Applicant::with([
            'accessPassApplication.documents',
            'familyBackground',
            'educationalBackground',
        ])->findOrFail($applicantId);

        DB::transaction(function () use ($applicant, $request) {
            ApplicationLog::create([
                'application_id' => $applicant->application_id,
                'user_id' => $request->user()->id,
                'action' => 'Application deleted',
            ]);

            $applicant->familyBackground()->delete();
            $applicant->educationalBackground()->delete();

            if ($applicant->accessPassApplication) {
                $applicant->accessPassApplication->documents()->delete();
                $applicant->accessPassApplication->delete();
            }

            $applicant->delete();
        });

        return response()->json(['message' => 'Application deleted.']);
    }

    private function formatAccessPassDetail(Applicant $applicant): array
    {
        $application = $applicant->accessPassApplication;

        return [
            'profile' => [
                'photo_path' => $application?->photo_path,
                'application_id' => $applicant->application_id,
                'applicant_id' => $applicant->id,
                'application_type' => $applicant->application_type,
                'full_name' => $applicant->full_name,
            ],
            'personal_information' => [
                'first_name' => $applicant->first_name,
                'middle_name' => $applicant->middle_name,
                'last_name' => $applicant->last_name,
                'suffix' => $applicant->suffix,
                'date_of_birth' => $applicant->date_of_birth?->format('Y-m-d'),
                'place_of_birth' => $applicant->place_of_birth,
                'sex' => $applicant->sex,
                'civil_status' => $applicant->civil_status,
                'address' => $applicant->address,
                'contact_number' => $applicant->contact_number,
                'email' => $applicant->email,
                'applicant_type' => $applicant->applicant_type,
                'status' => $application?->status,
                'date_submitted' => $application?->date_submitted?->format('Y-m-d H:i:s'),
                'date_reviewed' => $application?->date_reviewed?->format('Y-m-d H:i:s'),
                'reviewed_by' => $application?->reviewer?->full_name,
                'remarks' => $application?->remarks,
                'declaration_name' => $application?->declaration_name,
                'declaration_date' => $application?->declaration_date?->format('Y-m-d'),
            ],
            'family_background' => $applicant->familyBackground,
            'educational_background' => $applicant->educationalBackground,
            'documents' => $application?->documents ?? [],
        ];
    }

    private function syncRows(HasMany $relation, array $incoming, array $fillableColumns): void
    {
        $existingIds = $relation->pluck('id')->all();
        $incomingIds = collect($incoming)->pluck('id')->filter()->all();

        $toDelete = array_diff($existingIds, $incomingIds);
        if (! empty($toDelete)) {
            $relation->whereIn('id', $toDelete)->delete();
        }

        foreach ($incoming as $row) {
            $payload = array_intersect_key($row, array_flip($fillableColumns));

            if (! empty($row['id'])) {
                $relation->where('id', $row['id'])->update($payload);
            } else {
                $relation->create($payload);
            }
        }
    }

    /**
     * GET /api/admin/vehicle-sticker
     */
    public function vehicleList(Request $request)
    {
        $rows = VehicleApplication::with('applicant')
            ->latest('date_submitted')
            ->get()
            ->map(fn (VehicleApplication $a) => [
                'applicant_id' => $a->applicant?->id,
                'application_id' => $a->application_id,
                'full_name' => $a->applicant?->full_name,
                'applicant_type' => $a->applicant?->applicant_type,
                'plate_number' => $a->plate_number,
                'date_submitted' => $a->date_submitted,
                'status' => $a->status,
            ]);

        return response()->json($rows);
    }

    /**
     * GET /api/admin/vehicle-sticker/{applicantId}
     */
    public function vehicleShow(int $applicantId)
    {
        $applicant = Applicant::with([
            'vehicleApplication.documents',
            'vehicleApplication.reviewer',
        ])->findOrFail($applicantId);

        return response()->json($this->formatVehicleDetail($applicant));
    }

    /**
     * PATCH /api/admin/vehicle-sticker/{applicantId}/update
     */
    public function updateVehicle(Request $request, int $applicantId)
    {
        $applicant = Applicant::with([
            'vehicleApplication',
        ])->findOrFail($applicantId);

        $validator = Validator::make($request->all(), [
            'personal_information' => ['required', 'array'],
            'personal_information.first_name' => ['required', 'string', 'max:255'],
            'personal_information.middle_name' => ['nullable', 'string', 'max:255'],
            'personal_information.last_name' => ['required', 'string', 'max:255'],
            'personal_information.suffix' => ['nullable', 'string', 'max:20'],
            'personal_information.date_of_birth' => ['nullable', 'date'],
            'personal_information.place_of_birth' => ['nullable', 'string', 'max:255'],
            'personal_information.sex' => ['nullable', 'string', 'max:20'],
            'personal_information.civil_status' => ['nullable', 'string', 'max:30'],
            'personal_information.address' => ['nullable', 'string', 'max:500'],
            'personal_information.contact_number' => ['nullable', 'string', 'max:30'],
            'personal_information.email' => ['nullable', 'email', 'max:255'],
            'personal_information.applicant_type' => ['nullable', 'string', 'max:50'],
            'personal_information.remarks' => ['nullable', 'string'],

            'vehicle_information' => ['required', 'array'],
            'vehicle_information.plate_number' => ['nullable', 'string', 'max:50'],
            'vehicle_information.vehicle_type' => ['nullable', 'string', 'max:100'],
            'vehicle_information.make' => ['nullable', 'string', 'max:100'],
            'vehicle_information.model' => ['nullable', 'string', 'max:100'],
            'vehicle_information.color' => ['nullable', 'string', 'max:50'],
            'vehicle_information.year' => ['nullable', 'string', 'max:10'],
            'vehicle_information.registration_information' => ['nullable', 'string'],
            'vehicle_information.ownership' => ['nullable', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid input.', 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        DB::transaction(function () use ($applicant, $data, $request) {
            $p = $data['personal_information'];
            $v = $data['vehicle_information'];

            $applicant->update([
                'first_name' => $p['first_name'],
                'middle_name' => $p['middle_name'] ?? null,
                'last_name' => $p['last_name'],
                'suffix' => $p['suffix'] ?? null,
                'date_of_birth' => $p['date_of_birth'] ?? null,
                'place_of_birth' => $p['place_of_birth'] ?? null,
                'sex' => $p['sex'] ?? null,
                'civil_status' => $p['civil_status'] ?? null,
                'address' => $p['address'] ?? null,
                'contact_number' => $p['contact_number'] ?? null,
                'email' => $p['email'] ?? null,
                'applicant_type' => $p['applicant_type'] ?? null,
            ]);

            if ($applicant->vehicleApplication) {
                $applicant->vehicleApplication->update([
                    'remarks' => $p['remarks'] ?? null,
                    'plate_number' => $v['plate_number'] ?? null,
                    'vehicle_type' => $v['vehicle_type'] ?? null,
                    'make' => $v['make'] ?? null,
                    'model' => $v['model'] ?? null,
                    'color' => $v['color'] ?? null,
                    'year' => $v['year'] ?? null,
                    'registration_information' => $v['registration_information'] ?? null,
                    'ownership' => $v['ownership'] ?? null,
                ]);
            }

            ApplicationLog::create([
                'application_id' => $applicant->application_id,
                'user_id' => $request->user()->id,
                'action' => 'Applicant details updated',
            ]);
        });

        $applicant = $applicant->fresh([
            'vehicleApplication.documents',
            'vehicleApplication.reviewer',
        ]);

        return response()->json($this->formatVehicleDetail($applicant));
    }

    /**
     * DELETE /api/admin/vehicle-sticker/{applicantId}
     */
    public function destroyVehicle(Request $request, int $applicantId)
    {
        $applicant = Applicant::with([
            'vehicleApplication.documents',
        ])->findOrFail($applicantId);

        DB::transaction(function () use ($applicant, $request) {
            ApplicationLog::create([
                'application_id' => $applicant->application_id,
                'user_id' => $request->user()->id,
                'action' => 'Application deleted',
            ]);

            if ($applicant->vehicleApplication) {
                $applicant->vehicleApplication->documents()->delete();
                $applicant->vehicleApplication->delete();
            }

            $applicant->delete();
        });

        return response()->json(['message' => 'Application deleted.']);
    }

    private function formatVehicleDetail(Applicant $applicant): array
    {
        $application = $applicant->vehicleApplication;

        return [
            'profile' => [
                'application_id' => $applicant->application_id,
                'applicant_id' => $applicant->id,
                'application_type' => $applicant->application_type,
                'full_name' => $applicant->full_name,
            ],
            'personal_information' => [
                'first_name' => $applicant->first_name,
                'middle_name' => $applicant->middle_name,
                'last_name' => $applicant->last_name,
                'suffix' => $applicant->suffix,
                'date_of_birth' => $applicant->date_of_birth?->format('Y-m-d'),
                'place_of_birth' => $applicant->place_of_birth,
                'sex' => $applicant->sex,
                'civil_status' => $applicant->civil_status,
                'address' => $applicant->address,
                'contact_number' => $applicant->contact_number,
                'email' => $applicant->email,
                'applicant_type' => $applicant->applicant_type,
                'status' => $application?->status,
                'date_submitted' => $application?->date_submitted?->format('Y-m-d H:i:s'),
                'date_reviewed' => $application?->date_reviewed?->format('Y-m-d H:i:s'),
                'reviewed_by' => $application?->reviewer?->full_name,
                'remarks' => $application?->remarks,
            ],
            'vehicle_information' => [
                'plate_number' => $application?->plate_number,
                'vehicle_type' => $application?->vehicle_type,
                'make' => $application?->make,
                'model' => $application?->model,
                'color' => $application?->color,
                'year' => $application?->year,
                'registration_information' => $application?->registration_information,
                'ownership' => $application?->ownership,
                'clearance_status' => $application?->clearance_status,
                'sticker_number' => $application?->sticker_number,
                'approval_date' => $application?->approval_date?->format('Y-m-d'),
            ],
            'documents' => $application?->documents ?? [],
        ];
    }

    /**
     * PATCH /api/admin/access-pass/{application_id}/review
     */
    public function reviewAccessPass(Request $request, string $applicationId)
    {
        $validator = Validator::make($request->all(), [
            'status' => ['required', 'in:Submitted,Incomplete/Returned,Approved,Rejected'],
            'remarks' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid input.', 'errors' => $validator->errors()], 422);
        }

        $application = AccessPassApplication::where('application_id', $applicationId)->firstOrFail();

        $application->update([
            'status' => $request->input('status'),
            'remarks' => $request->input('remarks'),
            'reviewed_by' => $request->user()->id,
            'date_reviewed' => now(),
        ]);

        ApplicationLog::create([
            'application_id' => $applicationId,
            'user_id' => $request->user()->id,
            'action' => "Status changed to {$request->input('status')}",
            'remarks' => $request->input('remarks'),
        ]);

        return response()->json($application);
    }

    /**
     * PATCH /api/admin/vehicle-sticker/{application_id}/review
     */
    public function reviewVehicle(Request $request, string $applicationId)
    {
        $validator = Validator::make($request->all(), [
            'status' => ['required', 'in:Under Review,Incomplete/Returned,Approved,Rejected,Completed'],
            'remarks' => ['nullable', 'string'],
            'clearance_status' => ['nullable', 'string', 'max:50'],
            'sticker_number' => ['nullable', 'string', 'max:30'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid input.', 'errors' => $validator->errors()], 422);
        }

        $application = VehicleApplication::where('application_id', $applicationId)->firstOrFail();

        $application->update([
            'status' => $request->input('status'),
            'remarks' => $request->input('remarks'),
            'reviewed_by' => $request->user()->id,
            'date_reviewed' => now(),
            'clearance_status' => $request->input('clearance_status'),
            'sticker_number' => $request->input('sticker_number'),
            'approval_date' => $request->input('status') === 'Approved' ? now()->toDateString() : null,
        ]);

        ApplicationLog::create([
            'application_id' => $applicationId,
            'user_id' => $request->user()->id,
            'action' => "Status changed to {$request->input('status')}",
            'remarks' => $request->input('remarks'),
        ]);

        return response()->json($application);
    }
}