<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApplicationLog;
use Illuminate\Http\Request;

class AdminLogController extends Controller
{
    /** GET /api/admin/logs?q=&action=&page= */
    public function index(Request $request)
    {
        abort_unless($request->user()?->isAdmin(), 403, 'Only administrators can view the activity log.');

        $q = trim((string) $request->query('q', ''));
        $action = trim((string) $request->query('action', ''));

        $logs = ApplicationLog::with('user:id,full_name,hrep_id')
            ->when($action !== '', fn ($query) => $query->where('action', 'like', "%{$action}%"))
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($w) use ($q) {
                    $w->where('application_id', 'like', "%{$q}%")
                        ->orWhere('action', 'like', "%{$q}%")
                        ->orWhere('remarks', 'like', "%{$q}%")
                        ->orWhereHas('user', fn ($u) => $u
                            ->where('full_name', 'like', "%{$q}%")
                            ->orWhere('hrep_id', 'like', "%{$q}%"));
                });
            })
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json($logs);
    }
}