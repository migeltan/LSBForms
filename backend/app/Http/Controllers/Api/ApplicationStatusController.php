<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccessPassApplication;
use App\Models\VehicleApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ApplicationStatusController extends Controller
{
    /** Same message whether the reference or the second detail is wrong. */
    private const NOT_FOUND = 'No application matches those details. Check the reference number and the last name or email you applied with.';

    /**
     * POST /api/status/lookup
     *
     * The only public status endpoint. Needs the exact reference number AND
     * a second detail (the applicant's last name OR email). POST so the
     * personal detail never ends up in a URL or access log.
     *
     * Returns type, status and dates only. No name, email, phone, sex,
     * photo or internal IDs. Wrong reference and wrong second detail give
     * the identical 404, so a guess never confirms a reference exists.
     */
    public function lookup(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reference' => ['required', 'string', 'max:30'],
            'identifier' => ['required', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Enter both your reference number and your last name or email.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $reference = strtoupper(trim($request->input('reference')));
        $identifier = mb_strtolower(trim($request->input('identifier')));

        $model = match (true) {
            str_starts_with($reference, 'AP-') => AccessPassApplication::class,
            str_starts_with($reference, 'VS-') => VehicleApplication::class,
            default => null,
        };

        $application = $model
            ? $model::with('applicant')->where('application_id', $reference)->first()
            : null;

        $applicant = $application?->applicant;

        $matches = $applicant && $identifier !== '' && (
            mb_strtolower(trim((string) $applicant->last_name)) === $identifier
            || mb_strtolower(trim((string) $applicant->email)) === $identifier
        );

        if (! $matches) {
            return response()->json(['message' => self::NOT_FOUND], 404);
        }

        return response()->json([
            'type' => $model === AccessPassApplication::class ? 'access-pass' : 'vehicle-sticker',
            'application_id' => $application->application_id,
            'status' => $application->status,
            'date_submitted' => $application->date_submitted,
            'date_reviewed' => $application->date_reviewed,
        ]);
    }
}