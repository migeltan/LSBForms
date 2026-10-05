<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Creates the initial admin account.
     *
     * Reads ADMIN_SEED_HREP_ID and ADMIN_SEED_PASSWORD from .env.
     * In production the password is REQUIRED. Locally, a dev-only
     * fallback is used (with a warning) if it is not set.
     *
     * Run this seeder BEFORE `php artisan config:cache`.
     */
    public function run(): void
    {
        $hrepId = env('ADMIN_SEED_HREP_ID', 'HREP-2024-0001');
        $password = env('ADMIN_SEED_PASSWORD');

        if (empty($password)) {
            if (app()->environment('production')) {
                throw new \RuntimeException(
                    'ADMIN_SEED_PASSWORD must be set in .env before seeding in production.'
                );
            }

            $password = 'Password123';
            $this->command?->warn('ADMIN_SEED_PASSWORD not set: using the dev-only default. Do not use this outside local.');
        }

        User::updateOrCreate(
            ['hrep_id' => $hrepId],
            [
                'password_hash' => Hash::make($password),
                'full_name' => 'System Administrator',
                'role' => 'admin',
                'is_active' => true,
            ]
        );
    }
}