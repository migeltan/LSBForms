<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ApplicationLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

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

        ApplicationLog::create([
            'user_id' => $user->id,
            'action' => 'Logged in',
        ]);

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'hrep_id' => $user->hrep_id,
                'full_name' => $user->full_name,
                'role' => $user->role,
                'photo_url' => $user->photoUrl(),
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

        /**
     * PATCH /api/auth/profile
     * Lets the logged-in admin edit their own name / HREP ID / password.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'full_name' => ['required', 'string', 'max:150'],
            'hrep_id' => ['required', 'string', 'max:50', Rule::unique('users', 'hrep_id')->ignore($user->id)],
            'current_password' => ['nullable', 'required_with:new_password', 'string'],
            'new_password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'remove_photo' => ['nullable', 'boolean'],
        ]);

        if (! empty($data['new_password'])) {
            if (! Hash::check($data['current_password'], $user->password_hash)) {
                return response()->json([
                    'message' => 'Current password is incorrect.',
                    'errors' => ['current_password' => ['Current password is incorrect.']],
                ], 422);
            }
            $user->password_hash = Hash::make($data['new_password']);
        }

        if ($request->hasFile('photo')) {
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }
            $user->profile_photo_path = $request->file('photo')->store('admin-photos', 'public');
        } elseif ($request->boolean('remove_photo') && $user->profile_photo_path) {
            Storage::disk('public')->delete($user->profile_photo_path);
            $user->profile_photo_path = null;
        }

        $user->full_name = $data['full_name'];
        $user->hrep_id = $data['hrep_id'];
        $user->save();

        ApplicationLog::create([
            'user_id' => $user->id,
            'action' => 'Admin info updated',
            'remarks' => ! empty($data['new_password']) ? 'Password changed' : null,
        ]);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'hrep_id' => $user->hrep_id,
                'full_name' => $user->full_name,
                'role' => $user->role,
                'photo_url' => $user->photoUrl(),
            ],
        ]);
    }
}