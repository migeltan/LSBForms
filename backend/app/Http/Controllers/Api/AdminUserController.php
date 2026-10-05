<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApplicationLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    private const COLUMNS = [
        'id', 'hrep_id', 'full_name', 'role', 'email', 'contact_no', 'is_active', 'created_at',
    ];

    private function requireAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403, 'Only administrators can manage admin profiles.');
    }

    /** GET /api/admin/users */
    public function index(Request $request)
    {
        $this->requireAdmin($request);

        return User::orderBy('id')->get(self::COLUMNS);
    }

    /** POST /api/admin/users */
    public function store(Request $request)
    {
        $this->requireAdmin($request);

        $data = $request->validate([
            'full_name' => ['required', 'string', 'max:150'],
            'hrep_id' => ['required', 'string', 'max:50', 'unique:users,hrep_id'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'contact_no' => ['required', 'string', 'max:30'],
            'role' => ['required', 'in:admin,reviewer'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'full_name' => $data['full_name'],
            'hrep_id' => $data['hrep_id'],
            'email' => $data['email'],
            'contact_no' => $data['contact_no'],
            'role' => $data['role'],
            'password_hash' => Hash::make($data['password']),
            'is_active' => true,
        ]);

        ApplicationLog::create([
            'user_id' => $request->user()->id,
            'action' => 'Admin profile added',
            'remarks' => "{$user->full_name} ({$user->hrep_id}) as {$user->role}",
        ]);

        return response()->json($user->only(self::COLUMNS), 201);
    }
}