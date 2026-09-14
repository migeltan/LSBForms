<?php

namespace App\Support;

use App\Models\Applicant;
use Illuminate\Support\Facades\DB;

/**
 * Generates human-readable reference numbers like AP-2026-00001 and
 * VS-2026-00001, referenced throughout schema.sql's application_id
 * columns and used as the applicants.application_id primary reference.
 */
class ReferenceNumberGenerator
{
    public static function next(string $prefix): string
    {
        $year = now()->year;

        $count = Applicant::where('application_id', 'like', "{$prefix}-{$year}-%")->count();

        $next = str_pad((string) ($count + 1), 5, '0', STR_PAD_LEFT);

        return "{$prefix}-{$year}-{$next}";
    }
}
