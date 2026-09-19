<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    /**
     * users table has no `updated_at` column and uses `password_hash`
     * instead of the default `password` column name — see schema.sql.
     */
    public $timestamps = false;

    protected $fillable = [
        'hrep_id',
        'username',
        'password_hash',
        'full_name',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Laravel's auth internals expect getAuthPassword(); point it at
     * our custom `password_hash` column instead of `password`.
     */
    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function reviewedAccessPassApplications()
    {
        return $this->hasMany(AccessPassApplication::class, 'reviewed_by');
    }

    public function reviewedVehicleApplications()
    {
        return $this->hasMany(VehicleApplication::class, 'reviewed_by');
    }
}