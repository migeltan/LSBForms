<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentAccessPass;
use App\Models\DocumentVehicleSticker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class DocumentController extends Controller
{
    /**
     * POST /api/documents
     * Stores a single uploaded access pass document (letter request,
     * valid ID, NBI clearance, OR/CR, etc.) against a reference number.
     *
     * NOTE: this was previously wired to a generic `App\Models\Document`
     * model that doesn't exist in this codebase — only DocumentAccessPass
     * and DocumentVehicleSticker do. Pointed at DocumentAccessPass here
     * since we're scoping to access-pass for now. Vehicle sticker document
     * uploads for the public flow can follow the same pattern once needed
     * — mirror this into a storeVehicleSticker() method against
     * DocumentVehicleSticker.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'application_id' => ['required', 'string', 'max:20'],
            'document_type' => ['required', 'string', 'max:100'],
            'file' => ['required', 'file', 'max:10240', 'mimes:jpg,jpeg,png,pdf'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid input.', 'errors' => $validator->errors()], 422);
        }

        $file = $request->file('file');
        $path = $file->store("documents/{$request->input('application_id')}", 'public');

        $document = DocumentAccessPass::create([
            'application_id' => $request->input('application_id'),
            'document_type' => $request->input('document_type'),
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'verification_status' => 'Pending',
        ]);

        return response()->json($document, 201);
    }

    /**
     * GET /api/documents/{application_id}
     */
    public function index(string $applicationId)
    {
        return response()->json(
            DocumentAccessPass::where('application_id', $applicationId)->get()
        );
    }

    /**
     * GET /api/admin/access-pass/documents/{documentId}
     * View a single access pass document's metadata.
     */
    public function showAccessPass(int $documentId)
    {
        $document = DocumentAccessPass::findOrFail($documentId);

        return response()->json($document);
    }

    /**
     * POST /api/admin/access-pass/documents/{documentId}/update
     *
     * Updates an access pass document. All fields are optional and
     * independent:
     *   - send `file` to replace the uploaded file (old file is deleted
     *     from storage first)
     *   - send `document_type` and/or `verification_status` to edit
     *     metadata, with or without a file
     *
     * POST (not PATCH) because file uploads need multipart/form-data,
     * which PHP does not parse on PATCH requests without method
     * spoofing.
     */
    public function updateAccessPass(Request $request, int $documentId)
    {
        $document = DocumentAccessPass::findOrFail($documentId);

        $validator = Validator::make($request->all(), [
            'file' => ['nullable', 'file', 'max:10240', 'mimes:jpg,jpeg,png,pdf'],
            'document_type' => ['nullable', 'string', 'max:100'],
            'verification_status' => ['nullable', 'string', 'max:50'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid input.', 'errors' => $validator->errors()], 422);
        }

        $updates = [];

        if ($request->hasFile('file')) {
            if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
                Storage::disk('public')->delete($document->file_path);
            }

            $file = $request->file('file');
            $updates['file_path'] = $file->store("documents/{$document->application_id}", 'public');
            $updates['file_name'] = $file->getClientOriginalName();
        }

        if ($request->filled('document_type')) {
            $updates['document_type'] = $request->input('document_type');
        }

        if ($request->filled('verification_status')) {
            $updates['verification_status'] = $request->input('verification_status');
        }

        if (! empty($updates)) {
            $document->update($updates);
        }

        return response()->json($document);
    }

    /**
     * GET /api/admin/vehicle-sticker/documents/{documentId}
     * View a single vehicle sticker document's metadata. Mirrors
     * showAccessPass() above, against DocumentVehicleSticker.
     */
    public function showVehicle(int $documentId)
    {
        $document = DocumentVehicleSticker::findOrFail($documentId);

        return response()->json($document);
    }

    /**
     * POST /api/admin/vehicle-sticker/documents/{documentId}/update
     *
     * Updates a vehicle sticker document. Mirrors updateAccessPass()
     * above exactly, against DocumentVehicleSticker instead of
     * DocumentAccessPass:
     *   - send `file` to replace the uploaded file (old file is deleted
     *     from storage first)
     *   - send `document_type` and/or `verification_status` to edit
     *     metadata, with or without a file
     *
     * POST (not PATCH) for the same multipart/form-data reason noted
     * above.
     */
    public function updateVehicle(Request $request, int $documentId)
    {
        $document = DocumentVehicleSticker::findOrFail($documentId);

        $validator = Validator::make($request->all(), [
            'file' => ['nullable', 'file', 'max:10240', 'mimes:jpg,jpeg,png,pdf'],
            'document_type' => ['nullable', 'string', 'max:100'],
            'verification_status' => ['nullable', 'string', 'max:50'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid input.', 'errors' => $validator->errors()], 422);
        }

        $updates = [];

        if ($request->hasFile('file')) {
            if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
                Storage::disk('public')->delete($document->file_path);
            }

            $file = $request->file('file');
            $updates['file_path'] = $file->store("documents/{$document->application_id}", 'public');
            $updates['file_name'] = $file->getClientOriginalName();
        }

        if ($request->filled('document_type')) {
            $updates['document_type'] = $request->input('document_type');
        }

        if ($request->filled('verification_status')) {
            $updates['verification_status'] = $request->input('verification_status');
        }

        if (! empty($updates)) {
            $document->update($updates);
        }

        return response()->json($document);
    }

    /**
     * GET /api/access-pass/documents/{documentId}/download
     *
     * Forces a browser download rather than an inline open. Needed
     * because the frontend and this API run on different origins
     * (e.g. localhost:5173 vs localhost:8000) — the HTML `download`
     * attribute on an <a> tag is silently ignored by browsers for
     * cross-origin links, so a plain link to the public storage URL
     * just opens the file instead of downloading it. Sending an
     * explicit Content-Disposition: attachment header here forces the
     * download regardless of origin. Not behind auth middleware since
     * the underlying file is already served unauthenticated via the
     * public storage disk — this endpoint doesn't expose anything
     * that direct storage access didn't already.
     */
    public function downloadAccessPass(int $documentId)
    {
        $document = DocumentAccessPass::findOrFail($documentId);

        if (! Storage::disk('public')->exists($document->file_path)) {
            abort(404);
        }

        return response()->download(
            Storage::disk('public')->path($document->file_path),
            $document->file_name
        );
    }

    /**
     * GET /api/vehicle-sticker/documents/{documentId}/download
     * Mirrors downloadAccessPass() above, against DocumentVehicleSticker.
     */
    public function downloadVehicle(int $documentId)
    {
        $document = DocumentVehicleSticker::findOrFail($documentId);

        if (! Storage::disk('public')->exists($document->file_path)) {
            abort(404);
        }

        return response()->download(
            Storage::disk('public')->path($document->file_path),
            $document->file_name
        );
    }
}