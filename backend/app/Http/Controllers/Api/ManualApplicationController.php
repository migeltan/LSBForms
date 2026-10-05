<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccessPassApplication;
use App\Models\Applicant;
use App\Models\ApplicationLog;
use App\Models\VehicleApplication;
use App\Service\ControlNumberService;
use App\Support\ReferenceNumberGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ManualApplicationController extends Controller
{
    /** POST /api/admin/manual-applications */
    public function store(Request $request)
    {
        return match ($request->input('type')) {
            'access-pass' => $this->storeAccessPass($request),
            'vehicle-sticker' => $this->storeVehicleSticker($request),
            default => response()->json([
                'message' => 'Choose Access Pass or Vehicle Sticker.',
                'errors' => ['type' => ['Choose Access Pass or Vehicle Sticker.']],
            ], 422),
        };
    }

    private function storeAccessPass(Request $request)
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'suffix' => ['nullable', 'string', 'max:20'],
'applicant_type' => ['required', 'string', \Illuminate\Validation\Rule::exists('applicant_access_position', 'application_position')],
            'contact_number' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:10240'],
            'mark_approved' => ['nullable', 'boolean'],
        ]);

        $application = DB::transaction(function () use ($request, $data) {
            $approved = $request->boolean('mark_approved');
            $applicationId = ReferenceNumberGenerator::next('AP');

            $applicant = Applicant::create([
                'application_id' => $applicationId,
                'application_type' => 'access-pass',
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'last_name' => $data['last_name'],
                'suffix' => $data['suffix'] ?? null,
                'contact_number' => $data['contact_number'] ?? null,
                'email' => $data['email'] ?? null,
                'applicant_type' => $data['applicant_type'],
            ]);

            $application = AccessPassApplication::create([
                'application_id' => $applicationId,
                'applicant_id' => $applicant->id,
                'status' => $approved ? 'Approved' : 'Submitted',
                'date_submitted' => now(),
                'date_reviewed' => $approved ? now() : null,
                'reviewed_by' => $approved ? $request->user()->id : null,
                'remarks' => 'Encoded manually from a paper application.',
                'photo_path' => $request->file('photo')->store('access-pass/photos', 'public'),
            ]);

            if ($approved) {
                app(ControlNumberService::class)->ensureAccessPass($application);
            }

            ApplicationLog::create([
                'application_id' => $applicationId,
                'user_id' => $request->user()->id,
                'action' => 'Manual application encoded',
                'remarks' => $approved ? 'Marked as approved on entry' : null,
            ]);

            return $application;
        });

        return response()->json([
            'message' => 'Access pass application encoded.',
            'application_id' => $application->application_id,
        ], 201);
    }

    private function storeVehicleSticker(Request $request)
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'contact_number' => ['nullable', 'string', 'max:30'],
            'plate_number' => ['required', 'string', 'max:20'],
            'vehicle_type' => ['nullable', 'string', 'max:50'],
            'make' => ['required', 'string', 'max:80'],
            'model' => ['required', 'string', 'max:80'],
            'color' => ['nullable', 'string', 'max:40'],
            'year' => ['nullable', 'string', 'max:10'],
            'ownership' => ['required', 'in:Registered to Applicant,Not Registered to Applicant'],
            'mark_approved' => ['nullable', 'boolean'],
        ]);

        $application = DB::transaction(function () use ($request, $data) {
            $approved = $request->boolean('mark_approved');
            $applicationId = ReferenceNumberGenerator::next('VS');

            $applicant = Applicant::create([
                'application_id' => $applicationId,
                'application_type' => 'vehicle-sticker',
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'last_name' => $data['last_name'],
                'contact_number' => $data['contact_number'] ?? null,
                'applicant_type' => 'Other',
            ]);

            $application = VehicleApplication::create([
                'application_id' => $applicationId,
                'applicant_id' => $applicant->id,
                'plate_number' => $data['plate_number'],
                'vehicle_type' => $data['vehicle_type'] ?? null,
                'make' => $data['make'],
                'model' => $data['model'],
                'color' => $data['color'] ?? null,
                'year' => $data['year'] ?? null,
                'ownership' => $data['ownership'],
                'status' => $approved ? 'Approved' : 'Submitted',
                'date_submitted' => now(),
                'date_reviewed' => $approved ? now() : null,
                'reviewed_by' => $approved ? $request->user()->id : null,
                'remarks' => 'Encoded manually from a paper application.',
            ]);

            if ($approved) {
                app(ControlNumberService::class)->ensureVehicle($application);
            }

            ApplicationLog::create([
                'application_id' => $applicationId,
                'user_id' => $request->user()->id,
                'action' => 'Manual application encoded',
                'remarks' => $approved ? 'Marked as approved on entry' : null,
            ]);

            return $application;
        });

        return response()->json([
            'message' => 'Vehicle sticker application encoded.',
            'application_id' => $application->application_id,
        ], 201);
    }
}