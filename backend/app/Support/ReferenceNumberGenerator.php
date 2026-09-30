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

        return DB::transaction(function () use ($prefix, $year) {
            $row = DB::table('reference_sequences')
                ->where(['prefix' => $prefix, 'year' => $year])
                ->lockForUpdate()->first();

            if (! $row) {
                // First use this year: continue after any existing applicants.
                $n = Applicant::where('application_id', 'like', "{$prefix}-{$year}-%")->count() + 1;
                DB::table('reference_sequences')->insert(['prefix' => $prefix, 'year' => $year, 'last_number' => $n]);
            } else {
                $n = $row->last_number + 1;
                DB::table('reference_sequences')->where('id', $row->id)->update(['last_number' => $n]);
            }

            return sprintf('%s-%d-%05d', $prefix, $year, $n);
        });
    }
}
