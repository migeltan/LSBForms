<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccessPassApplication;
use App\Models\VehicleApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ApplicationStatusController extends Controller
{
    /**
     * GET /api/status/{reference}
     * Looks the reference number up against both application types
     * (AP-... -> access pass, VS-... -> vehicle sticker). Kept for any
     * other callers that still hit an exact reference number directly;
     * the Status page itself now goes through search() below.
     */
    public function show(Request $request, string $reference)
    {
        $prefix = strtoupper(substr($reference, 0, 2));

        $application = match ($prefix) {
            'AP' => AccessPassApplication::with('applicant')->where('application_id', $reference)->first(),
            'VS' => VehicleApplication::with('applicant')->where('application_id', $reference)->first(),
            default => null,
        };

        if (! $application) {
            return response()->json(['message' => 'No application found for that reference number.'], 404);
        }

        return response()->json([
            'type' => $prefix === 'AP' ? 'access-pass' : 'vehicle-sticker',
            'application_id' => $application->application_id,
            'status' => $application->status,
            'date_submitted' => $application->date_submitted,
            'date_reviewed' => $application->date_reviewed,
            'remarks' => $application->remarks,
            'applicant_name' => $application->applicant?->full_name,
        ]);
    }

    /**
     * GET /api/applications/search
     * Every filter here is optional and independently combinable —
     * name and/or application_id (partial match), plus type, date, and
     * status. Any subset can be present: filters alone with no search
     * text still narrow the result set, and vice versa. Backs the
     * search bar + filters + table on the Status page
     * (src/modules/feat4-check-status/StatusSearch.tsx).
     */
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['nullable', 'string', 'max:255'],
            'application_id' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'in:access-pass,vehicle-sticker'],
            'date' => ['nullable', 'date'],
            'status' => ['nullable', 'string', 'max:50'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid input.', 'errors' => $validator->errors()], 422);
        }

        $name = $request->input('name');
        $applicationId = $request->input('application_id');
        $type = $request->input('type');
        $date = $request->input('date');
        $status = $request->input('status');

        $results = collect();

        if (! $type || $type === 'access-pass') {
            $results = $results->concat($this->searchAccessPass($name, $applicationId, $date, $status));
        }

        if (! $type || $type === 'vehicle-sticker') {
            $results = $results->concat($this->searchVehicle($name, $applicationId, $date, $status));
        }

        return response()->json($results->sortByDesc('date_submitted')->values());
    }

    /**
     * GET /api/status/applicant/{applicantId}?type=access-pass|vehicle-sticker
     * Lean, public-safe profile for the Status page's row-click modal
     * (StatusModalProfile.tsx). Deliberately returns far less than the
     * admin detail endpoints — no family/education/documents, just what
     * the modal displays.
     *
     * NOTE: adjust the applicant field names below (photo_path, sex,
     * full_name, etc.) to match your actual Applicant model if they
     * differ — these mirror the field names already used in
     * PersonalInformation / ApplicantProfile in types.ts.
     */
    public function profile(Request $request, string $applicantId)
    {
        $validator = Validator::make($request->all(), [
            'type' => ['required', 'in:access-pass,vehicle-sticker'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid input.', 'errors' => $validator->errors()], 422);
        }

        $type = $request->input('type');

        if ($type === 'access-pass') {
            $application = AccessPassApplication::with('applicant')
                ->whereHas('applicant', fn ($a) => $a->where('id', $applicantId))
                ->first();

            if (! $application) {
                return response()->json(['message' => 'Applicant not found.'], 404);
            }

            return response()->json([
                'photo_path' => $application->applicant?->photo_path,
                'application_id' => $application->application_id,
                'status' => $application->status,
                'date_submitted' => $application->date_submitted,
                'date_reviewed' => $application->date_reviewed,
                'full_name' => $application->applicant?->full_name,
                'sex' => $application->applicant?->sex,
                'email' => $application->applicant?->email,
                'contact_number' => $application->applicant?->contact_number,
                'application_type' => 'access-pass',
                'applicant_type' => $application->applicant?->applicant_type,
                'plate_number' => null,
            ]);
        }

        $application = VehicleApplication::with('applicant')
            ->whereHas('applicant', fn ($a) => $a->where('id', $applicantId))
            ->first();

        if (! $application) {
            return response()->json(['message' => 'Applicant not found.'], 404);
        }

        return response()->json([
            'photo_path' => $application->applicant?->photo_path,
            'application_id' => $application->application_id,
            'status' => $application->status,
            'date_submitted' => $application->date_submitted,
            'date_reviewed' => $application->date_reviewed,
            'full_name' => $application->applicant?->full_name,
            'sex' => $application->applicant?->sex,
            'email' => $application->applicant?->email,
            'contact_number' => $application->applicant?->contact_number,
            'application_type' => 'vehicle-sticker',
            'applicant_type' => null,
            'plate_number' => $application->plate_number,
        ]);
    }

    private function searchAccessPass(?string $name, ?string $applicationId, ?string $date, ?string $status)
    {
        return AccessPassApplication::with('applicant')
            ->when($applicationId, fn ($q) => $q->where('application_id', 'like', "%{$applicationId}%"))
            ->when($name, fn ($q) => $q->whereHas('applicant', fn ($a) => $a
                ->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$name}%"])
                ->orWhere('first_name', 'like', "%{$name}%")
                ->orWhere('last_name', 'like', "%{$name}%")))
            ->when($date, fn ($q) => $q->whereDate('date_submitted', $date))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->latest('date_submitted')
            ->get()
            ->map(fn (AccessPassApplication $a) => [
                'applicant_id' => $a->applicant?->id,
                'application_id' => $a->application_id,
                'application_type' => 'Access Pass',
                'name' => $a->applicant?->full_name,
                'date_submitted' => $a->date_submitted,
                'status' => $a->status,
            ]);
    }

    private function searchVehicle(?string $name, ?string $applicationId, ?string $date, ?string $status)
    {
        return VehicleApplication::with('applicant')
            ->when($applicationId, fn ($q) => $q->where('application_id', 'like', "%{$applicationId}%"))
            ->when($name, fn ($q) => $q->whereHas('applicant', fn ($a) => $a
                ->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$name}%"])
                ->orWhere('first_name', 'like', "%{$name}%")
                ->orWhere('last_name', 'like', "%{$name}%")))
            ->when($date, fn ($q) => $q->whereDate('date_submitted', $date))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->latest('date_submitted')
            ->get()
            ->map(fn (VehicleApplication $a) => [
                'applicant_id' => $a->applicant?->id,
                'application_id' => $a->application_id,
                'application_type' => 'Vehicle Sticker',
                'name' => $a->applicant?->full_name,
                'date_submitted' => $a->date_submitted,
                'status' => $a->status,
            ]);
    }
}