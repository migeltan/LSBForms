<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * POST /api/auth/login
     * Used by the React Admin page (src/pages/Admin.tsx -> AuthProvider.login).
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'hrep_id' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid input.', 'errors' => $validator->errors()], 422);
        }

        $user = User::where('hrep_id', $request->input('hrep_id'))->first();

        if (! $user || ! $user->is_active || ! Hash::check($request->input('password'), $user->password_hash)) {
            return response()->json(['message' => 'Invalid HREP ID or password.'], 401);
        }

        $token = $user->createToken('smart-portal-admin')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'hrep_id' => $user->hrep_id,
                'full_name' => $user->full_name,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    /**
     * GET /api/auth/me
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}