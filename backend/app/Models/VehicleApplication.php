<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VehicleApplication extends Model
{
    use HasFactory;

    /**
     * Table was renamed from `vehicle_applications` (Laravel's default
     * guess from this class name) to `applications_for_vehicle-sticker` —
     * see 2026_01_01_000004_create_applications_for_vehicle-sticker_table.php.
     * NOTE: the hyphen in this table name means it must always be
     * explicitly quoted; Eloquent handles this automatically as long as
     * $table is set here, but avoid referencing this table in raw SQL
     * without backticks.
     */
    protected $table = 'applications_for_vehicle-sticker';

    public $timestamps = false;

    protected $fillable = [
        'application_id',
        'applicant_id',
        'plate_number',
        'vehicle_type',
        'make',
        'model',
        'color',
        'year',
        'registration_information',
        'ownership',
        'status',
        'remarks',
        'date_submitted',
        'reviewed_by',
        'date_reviewed',
        'clearance_status',
        'approval_date',
        'sticker_number',
    ];

    protected function casts(): array
    {
        return [
            'date_submitted' => 'datetime',
            'date_reviewed' => 'datetime',
            'approval_date' => 'date',
        ];
    }

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Documents live in their own `document_vechicel-sticker` table
     * [sic — matches the actual migration/table spelling] and are
     * matched by the human-readable application_id, not a FK.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(DocumentVehicleSticker::class, 'application_id', 'application_id');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(ApplicationLog::class, 'application_id', 'application_id');
    }
}