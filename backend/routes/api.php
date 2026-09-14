<?php

use App\Http\Controllers\Api\AccessPassController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ApplicationStatusController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\VehicleStickerController;
use App\Http\Controllers\Auth\AuthController;
use App\Service\PdfGeneratorService;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — consumed by the React frontend (frontend/src/api/client.ts)
|--------------------------------------------------------------------------
*/

// --- Auth (admin/reviewer login — src/pages/Admin.tsx) ---
Route::post('/auth/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
});

/*
 * Named "login" fallback — required so Sanctum's unauthenticated()
 * handler doesn't blow up with RouteNotFoundException when it tries
 * to redirect() to a route named "login". This API has no such page,
 * so we just return a clean 401 JSON response instead.
 */
Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');

// --- Public application flows ---
Route::post('/access-pass', [AccessPassController::class, 'store']);
Route::get('/access-pass/{application_id}', [AccessPassController::class, 'show']);
Route::post('/access-pass/{application_id}/submit', [AccessPassController::class, 'submit']);

Route::post('/vehicle-sticker', [VehicleStickerController::class, 'store']);
Route::get('/vehicle-sticker/{application_id}', [VehicleStickerController::class, 'show']);
Route::post('/vehicle-sticker/{application_id}/submit', [VehicleStickerController::class, 'submit']);

Route::post('/documents', [DocumentController::class, 'store']);
Route::get('/documents/{application_id}', [DocumentController::class, 'index']);

// --- Force-download endpoints (see DocumentController for why these
// exist instead of just linking straight to public storage) ---
Route::get('/access-pass/documents/{documentId}/download', [DocumentController::class, 'downloadAccessPass']);
Route::get('/vehicle-sticker/documents/{documentId}/download', [DocumentController::class, 'downloadVehicle']);

// --- Check Application Status (src/pages/Status.tsx) ---
// Lean, public-safe applicant profile for the row-click modal on the
// Status page (feat4-check-status/StatusModalProfile.tsx). Two path
// segments, so it never collides with the /status/{reference}
// single-segment wildcard below regardless of declaration order —
// declared first here just for readability.
Route::get('/status/applicant/{applicantId}', [ApplicationStatusController::class, 'profile']);
Route::get('/status/{reference}', [ApplicationStatusController::class, 'show']);

// --- Application search: search bar + type/date filters + results
// table (src/pages/StatusSearch.tsx). Kept under its own /applications
// prefix rather than /status to avoid colliding with the /status/{reference}
// wildcard above.
Route::get('/applications/search', [ApplicationStatusController::class, 'search']);

// --- Admin / reviewer only (src/pages/Admin.tsx) ---
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/applications', [AdminController::class, 'index']);

    Route::get('/access-pass', [AdminController::class, 'accessPassList']);
    Route::get('/access-pass/{applicantId}', [AdminController::class, 'accessPassShow']);
    Route::patch('/access-pass/{applicantId}/update', [AdminController::class, 'updateAccessPass']);
    Route::delete('/access-pass/{applicantId}', [AdminController::class, 'destroyAccessPass']);
    Route::patch('/access-pass/{application_id}/review', [AdminController::class, 'reviewAccessPass']);

    Route::get('/access-pass/{applicantId}/id/preview', [PdfGeneratorService::class, 'previewAccessPass']);
    Route::get('/access-pass/{applicantId}/id/download', [PdfGeneratorService::class, 'downloadAccessPass']);

    Route::get('/vehicle-sticker', [AdminController::class, 'vehicleList']);
    Route::get('/vehicle-sticker/{applicantId}', [AdminController::class, 'vehicleShow']);
    Route::patch('/vehicle-sticker/{applicantId}/update', [AdminController::class, 'updateVehicle']);
    Route::delete('/vehicle-sticker/{applicantId}', [AdminController::class, 'destroyVehicle']);
    Route::patch('/vehicle-sticker/{application_id}/review', [AdminController::class, 'reviewVehicle']);

    Route::get('/vehicle-sticker/{applicantId}/id/preview', [PdfGeneratorService::class, 'previewVehicleSticker']);
    Route::get('/vehicle-sticker/{applicantId}/id/download', [PdfGeneratorService::class, 'downloadVehicleSticker']);

    Route::get('/access-pass/documents/{documentId}', [DocumentController::class, 'showAccessPass']);
    Route::post('/access-pass/documents/{documentId}/update', [DocumentController::class, 'updateAccessPass']);

    Route::get('/vehicle-sticker/documents/{documentId}', [DocumentController::class, 'showVehicle']);
    Route::post('/vehicle-sticker/documents/{documentId}/update', [DocumentController::class, 'updateVehicle']);
});