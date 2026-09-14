<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Creates a default admin account for local development.
     *
     * Username: admin
     * Password: ChangeMe123!
     *
     * IMPORTANT: change this password (or delete/replace this seeder)
     * before deploying anywhere beyond local dev.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['username' => 'admin'],
            [
                'password_hash' => Hash::make('Password123'),
                'full_name' => 'System Administrator',
                'role' => 'admin',
                'is_active' => true,
            ]
        );
    }
}