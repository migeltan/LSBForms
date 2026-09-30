<?php

namespace App\Service;

use App\Models\AccessPassApplication;
use App\Models\VehicleApplication;
use Illuminate\Support\Facades\DB;

/**
 * Hands out incremental control numbers, once per application.
 *
 *   Access Pass:   1AA-1000, 1AA-1001, ...   (applications_for_access_pass.control_number)
 *   Vehicle decal: 1000, 1001, ...           (applications_for_vehicle-sticker.sticker_number)
 *
 * Idempotent: an application that already has a number keeps it, so
 * re-approving or re-printing never changes the number on a printed ID.
 */
class ControlNumberService
{
    private const START = 1000;
    private const ACCESS_PASS_PREFIX = '1AA-';

    public function ensureAccessPass(AccessPassApplication $application): string
    {
        return DB::transaction(function () use ($application) {
            $current = AccessPassApplication::lockForUpdate()->findOrFail($application->id);
            if ($current->control_number) {
                $application->control_number = $current->control_number;

                return $current->control_number;
            }

            $existing = AccessPassApplication::whereNotNull('control_number')
                ->lockForUpdate()
                ->pluck('control_number');

            $number = self::ACCESS_PASS_PREFIX.$this->nextSequence($existing, self::ACCESS_PASS_PREFIX);
            $current->update(['control_number' => $number]);
            $application->control_number = $number;

            return $number;
        });
    }

    public function ensureVehicle(VehicleApplication $application): string
    {
        return DB::transaction(function () use ($application) {
            $current = VehicleApplication::lockForUpdate()->findOrFail($application->id);
            if ($current->sticker_number) {
                $application->sticker_number = $current->sticker_number;

                return $current->sticker_number;
            }

            $existing = VehicleApplication::whereNotNull('sticker_number')
                ->lockForUpdate()
                ->pluck('sticker_number');

            $number = (string) $this->nextSequence($existing, '');
            $current->update(['sticker_number' => $number]);
            $application->sticker_number = $number;

            return $number;
        });
    }

    /**
     * The number this decal shows on previews/downloads: its real number if it
     * has one, otherwise the next one in line. Read-only, nothing is saved, so
     * the number is only locked in once the application is approved.
     */
    public function peekVehicle(VehicleApplication $application): string
    {
        if ($application->sticker_number) {
            return $application->sticker_number;
        }

        $existing = VehicleApplication::whereNotNull('sticker_number')
            ->pluck('sticker_number');

        return (string) $this->nextSequence($existing, '');
    }

    /** Highest existing numeric part + 1, or START if there are none yet. */
    private function nextSequence($existing, string $prefix): int
    {
        $max = $existing
            ->map(fn ($n) => substr((string) $n, strlen($prefix)))
            ->filter(fn ($n) => ctype_digit($n))
            ->map(fn ($n) => (int) $n)
            ->max();

        return $max === null ? self::START : max($max + 1, self::START);
    }
}