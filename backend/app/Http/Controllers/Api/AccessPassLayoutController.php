<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Applicant;
use App\Support\AccessPassLayout;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccessPassLayoutController extends Controller
{
    /** GET /admin/access-pass/{applicantId}/layout */
    public function show(int $applicantId): JsonResponse
    {
        return response()->json($this->payload($applicantId));
    }

    /** PUT /admin/access-pass/{applicantId}/layout */
    public function update(Request $request, int $applicantId): JsonResponse
    {
        $request->validate(['layout' => ['required', 'array']]);

        $application = $this->application($applicantId);

        // Store only what was sanitized; anything unknown is dropped.
        $application->layout_overrides = AccessPassLayout::sanitize($request->input('layout'));
        $application->save();

        return response()->json($this->payload($applicantId));
    }

    /** DELETE /admin/access-pass/{applicantId}/layout — back to defaults */
    public function reset(int $applicantId): JsonResponse
    {
        $application = $this->application($applicantId);
        $application->layout_overrides = null;
        $application->save();

        return response()->json($this->payload($applicantId));
    }

    private function application(int $applicantId)
    {
        $applicant = Applicant::with('accessPassApplication')->findOrFail($applicantId);
        abort_if(! $applicant->accessPassApplication, 404, 'No access pass application found for this applicant.');

        return $applicant->accessPassApplication;
    }

    private function payload(int $applicantId): array
    {
        $applicant = Applicant::with('accessPassApplication')->findOrFail($applicantId);
        $application = $this->application($applicantId);

        $fontPath = public_path('fonts/BebasNeue-Regular.ttf');

        return [
            'card' => [
                'widthMm' => AccessPassLayout::CARD_WIDTH_MM,
                'heightMm' => AccessPassLayout::CARD_HEIGHT_MM,
            ],
            'defaults' => AccessPassLayout::defaults(),
            'layout' => AccessPassLayout::resolve($application->layout_overrides),
            'isCustomized' => ! empty($application->layout_overrides),
            'templateUrl' => asset('images/id-templates/access-pass-blank.png'),
            // Embedded as a data URI (cross-origin @font-face is blocked by CORS).
            'fontDataUri' => is_file($fontPath)
                ? 'data:font/ttf;base64,'.base64_encode(file_get_contents($fontPath))
                : null,
            'content' => [
                'name' => strtoupper($applicant->full_name),
                'department' => 'Legislative Security Bureau',
                'controlNumber' => $application->control_number ?? '1AA-1000',
                'photoUrl' => $application->photo_path ? asset('storage/'.$application->photo_path) : null,
                // TODO: point at wherever the signature image actually lives.
                'signatureUrl' => null,
            ],
        ];
    }
}