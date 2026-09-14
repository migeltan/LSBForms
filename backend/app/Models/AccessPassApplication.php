<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AccessPassApplication extends Model
{
    use HasFactory;

    /**
     * Table was renamed from `access_pass_applications` (Laravel's default
     * guess from this class name) to `applications_for_access_pass` — see
     * 2026_01_01_000003_create_applications_for_access_pass_table.php.
     */
    protected $table = 'applications_for_access_pass';

    /** No timestamps columns beyond the explicit date_submitted/date_reviewed — see schema.sql. */
    public $timestamps = false;

    protected $fillable = [
        'application_id',
        'applicant_id',
        'status',
        'date_submitted',
        'date_reviewed',
        'reviewed_by',
        'remarks',
        'photo_path',
        'declaration_name',
        'declaration_date',
    ];

    protected function casts(): array
    {
        return [
            'date_submitted' => 'datetime',
            'date_reviewed' => 'datetime',
            'declaration_date' => 'date',
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
     * Documents live in their own `document_access-pass` table and are
     * matched by the human-readable application_id, not a FK.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(DocumentAccessPass::class, 'application_id', 'application_id');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(ApplicationLog::class, 'application_id', 'application_id');
    }
}
