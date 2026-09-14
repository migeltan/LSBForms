<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentVehicleSticker extends Model
{
    use HasFactory;

    /**
     * Table has a hyphen AND a typo ("vechicel" instead of "vehicle") in
     * its name, so it must be set explicitly — see
     * 2026_01_01_000008_create_document_vehicle-sticker_table.php.
     * The class name here uses correct spelling; only the underlying
     * table identifier matches the typo.
     */
    protected $table = 'document_vehicle-sticker';

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