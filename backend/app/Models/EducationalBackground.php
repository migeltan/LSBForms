<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EducationalBackground extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'educational_background';

    protected $fillable = [
        'applicant_id',
        'school',
        'degree',
        'year_graduated',
        'other_information',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }
}