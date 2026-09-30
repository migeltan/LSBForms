<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Applicant;
use App\Support\StickerLayout;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehicleStickerLayoutController extends Controller
{
    /** GET /admin/vehicle-sticker/{applicantId}/layout */
    public function show(int $applicantId): JsonResponse
    {
        return response()->json($this->payload($applicantId));
    }

    /** PUT /admin/vehicle-sticker/{applicantId}/layout */
    public function update(Request $request, int $applicantId): JsonResponse
    {
        $request->validate(['layout' => ['required', 'array']]);

        $application = $this->application($applicantId);
        $clean = StickerLayout::sanitize($request->input('layout'));
        $application->layout_overrides = empty($clean) ? null : $clean;
        $application->save();

        return response()->json($this->payload($applicantId));
    }

    /** DELETE /admin/vehicle-sticker/{applicantId}/layout — back to defaults */
    public function reset(int $applicantId): JsonResponse
    {
        $application = $this->application($applicantId);
        $application->layout_overrides = null;
        $application->save();

        return response()->json($this->payload($applicantId));
    }

    private function application(int $applicantId)
    {
        $applicant = Applicant::with('vehicleApplication')->findOrFail($applicantId);
        abort_if(! $applicant->vehicleApplication, 404, 'No vehicle sticker application found for this applicant.');

        return $applicant->vehicleApplication;
    }

    private function payload(int $applicantId): array
    {
        $application = $this->application($applicantId);

        return [
            'card' => ['widthMm' => StickerLayout::WIDTH_MM, 'heightMm' => StickerLayout::HEIGHT_MM],
            'defaults' => StickerLayout::defaults(),
            'layout' => StickerLayout::resolve($application->layout_overrides),
            'isCustomized' => StickerLayout::isCustomized($application->layout_overrides),
            'templateUrl' => asset('images/id-templates/vehicle-sticker-blank.png'),
            'fontDataUri' => null,
            'content' => [
                'controlNumber' => app(\App\Service\ControlNumberService::class)->peekVehicle($application),
            ],
        ];
    }
}