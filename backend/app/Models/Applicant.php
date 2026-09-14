<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Applicant extends Model
{
    use HasFactory;

    /** applicants table has no `updated_at` column — see schema.sql. */
    public $timestamps = false;

    protected $fillable = [
        'application_id',
        'application_type',
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'date_of_birth',
        'place_of_birth',
        'sex',
        'civil_status',
        'address',
        'contact_number',
        'email',
        'applicant_type',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'created_at' => 'datetime',
        ];
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->middle_name} {$this->last_name} {$this->suffix}");
    }

    public function accessPassApplication(): HasOne
    {
        return $this->hasOne(AccessPassApplication::class);
    }

    public function vehicleApplication(): HasOne
    {
        return $this->hasOne(VehicleApplication::class);
    }

    public function familyBackground(): HasMany
    {
        return $this->hasMany(FamilyBackground::class);
    }

    public function educationalBackground(): HasMany
    {
        return $this->hasMany(EducationalBackground::class);
    }
} 