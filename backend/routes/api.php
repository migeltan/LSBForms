<?php

use App\Http\Controllers\Api\AccessPassController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AdminLogController;
use App\Http\Controllers\Api\ManualApplicationController;
use App\Http\Controllers\Api\ApplicantTypeController;
use App\Http\Controllers\Api\ApplicationStatusController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\VehicleStickerController;
use App\Http\Controllers\Auth\AuthController;
use App\Service\PdfGeneratorService;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AccessPassLayoutController;
use App\Http\Controllers\Api\VehicleStickerLayoutController;

/*
|--------------------------------------------------------------------------
| API Routes — consumed by the React frontend (frontend/src/api/client.ts)
|--------------------------------------------------------------------------
*/

// --- Auth (admin/reviewer login — src/pages/Admin.tsx) ---
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/profile', [AuthController::class, 'updateProfile']);
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
Route::get('/applicant-types', [ApplicantTypeController::class, 'index']);

Route::middleware('throttle:10,1')->group(function () {
    Route::post('/access-pass/reserve-reference', [AccessPassController::class, 'reserveReference']);
    Route::post('/access-pass', [AccessPassController::class, 'store']);

    Route::post('/vehicle-sticker/reserve-reference', [VehicleStickerController::class, 'reserveReference']);
    Route::post('/vehicle-sticker', [VehicleStickerController::class, 'store']);
});

// --- Check Application Status (src/pages/Status.tsx) ---
// Reference number + last name or email. Returns status and dates only.
Route::post('/status/lookup', [ApplicationStatusController::class, 'lookup'])
    ->middleware('throttle:10,1');
    
// --- Admin / reviewer only (src/pages/Admin.tsx) ---
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/applications', [AdminController::class, 'index']);

    Route::get('/users', [AdminUserController::class, 'index']);
    Route::post('/users', [AdminUserController::class, 'store']);
    Route::get('/logs', [AdminLogController::class, 'index']);

    Route::post('/manual-applications', [ManualApplicationController::class, 'store']);

    Route::get('/access-pass', [AdminController::class, 'accessPassList']);
    Route::get('/access-pass/{applicantId}', [AdminController::class, 'accessPassShow']);
    Route::patch('/access-pass/{applicantId}/update', [AdminController::class, 'updateAccessPass']);
    Route::delete('/access-pass/{applicantId}', [AdminController::class, 'destroyAccessPass']);
    Route::patch('/access-pass/{application_id}/review', [AdminController::class, 'reviewAccessPass']);

    Route::get('/access-pass/{applicantId}/id/preview', [PdfGeneratorService::class, 'previewAccessPass']);
    Route::get('/access-pass/{applicantId}/id/preview-back', [PdfGeneratorService::class, 'previewAccessPassBack']);
    Route::get('/access-pass/{applicantId}/id/preview-v2/front', [PdfGeneratorService::class, 'previewAccessPassFrontV2']);
    Route::get('/access-pass/{applicantId}/id/preview-v2/back', [PdfGeneratorService::class, 'previewAccessPassBackV2']);
    Route::get('/vehicle-sticker/{applicantId}/id/preview-v2/front', [PdfGeneratorService::class, 'previewVehicleStickerFrontV2']);
    Route::get('/access-pass/{applicantId}/id/download', [PdfGeneratorService::class, 'downloadAccessPass']);
    Route::post('/access-pass/id/batch-download', [PdfGeneratorService::class, 'batchDownloadAccessPass']);

    Route::get('/vehicle-sticker', [AdminController::class, 'vehicleList']);
    Route::get('/vehicle-sticker/{applicantId}', [AdminController::class, 'vehicleShow']);
    Route::patch('/vehicle-sticker/{applicantId}/update', [AdminController::class, 'updateVehicle']);
    Route::delete('/vehicle-sticker/{applicantId}', [AdminController::class, 'destroyVehicle']);
    Route::patch('/vehicle-sticker/{application_id}/review', [AdminController::class, 'reviewVehicle']);

    Route::get('/vehicle-sticker/{applicantId}/id/preview', [PdfGeneratorService::class, 'previewVehicleSticker']);
    Route::get('/vehicle-sticker/{applicantId}/id/download', [PdfGeneratorService::class, 'downloadVehicleSticker']);
    Route::post('/vehicle-sticker/id/batch-print', [PdfGeneratorService::class, 'batchPrintVehicleStickers']);

    Route::get('/access-pass/documents/{documentId}', [DocumentController::class, 'showAccessPass']);
    Route::post('/access-pass/documents/{documentId}/update', [DocumentController::class, 'updateAccessPass']);

    Route::get('/vehicle-sticker/documents/{documentId}', [DocumentController::class, 'showVehicle']);
    Route::post('/vehicle-sticker/documents/{documentId}/update', [DocumentController::class, 'updateVehicle']);
    Route::get('/access-pass/documents/{documentId}/file', [DocumentController::class, 'viewAccessPass']);
    Route::get('/access-pass/documents/{documentId}/download', [DocumentController::class, 'downloadAccessPass']);
    Route::get('/vehicle-sticker/documents/{documentId}/file', [DocumentController::class, 'viewVehicle']);
    Route::get('/vehicle-sticker/documents/{documentId}/download', [DocumentController::class, 'downloadVehicle']);

        Route::get('/access-pass/{applicantId}/layout', [AccessPassLayoutController::class, 'show']);
    Route::put('/access-pass/{applicantId}/layout', [AccessPassLayoutController::class, 'update']);
    Route::delete('/access-pass/{applicantId}/layout', [AccessPassLayoutController::class, 'reset']);

    Route::get('/vehicle-sticker/{applicantId}/layout', [VehicleStickerLayoutController::class, 'show']);
    Route::put('/vehicle-sticker/{applicantId}/layout', [VehicleStickerLayoutController::class, 'update']);
    Route::delete('/vehicle-sticker/{applicantId}/layout', [VehicleStickerLayoutController::class, 'reset']);
    
});