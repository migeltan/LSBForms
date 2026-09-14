<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
| The frontend is a separate React (Vite) SPA — see /frontend. This
| backend is API-only, so the root route just confirms the API is up.
*/

Route::get('/', function () {
    return response()->json([
        'app' => config('app.name'),
        'status' => 'ok',
        'api' => url('/api'),
    ]);
});

/*
 * Serves files from storage/app/public directly. Needed because
 * `php artisan serve` won't follow the public/storage symlink and
 * returns 403 for anything under it. Safe to leave in place even
 * after moving to a real server (Apache/Nginx/Laragon), where the
 * symlink would otherwise handle this — this route just takes
 * priority when it's hit.
 */
Route::get('/storage/{path}', function (string $path) {
    if (! Storage::disk('public')->exists($path)) {
        abort(404);
    }

    return response()->file(Storage::disk('public')->path($path));
})->where('path', '.*');