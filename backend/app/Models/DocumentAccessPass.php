<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentAccessPass extends Model
{
    use HasFactory;

    /**
     * Table has a hyphen in its name, so it must be set explicitly —
     * see 2026_01_01_000007_create_documents_access-pass_table.php.
     */
    protected $table = 'document_access-pass';

    /** Has uploaded_at instead of created_at/updated_at — see schema.sql. */
    public $timestamps = false;

    protected $fillable = [
        'application_id',
        'document_type',
        'file_name',
        'file_path',
        'verification_status',
    ];

    protected function casts(): array
    {
        return [
            'uploaded_at' => 'datetime',
        ];
    }
}
