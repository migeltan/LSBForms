<?php

namespace App\Support;

/**
 * Single source of truth for where each variable field sits on the
 * Access Pass / PVC ID card. Boxes are percentages of the card
 * (x/y = top-left corner, w/h = size), so the same artwork fits any size.
 * Text fields also carry a font size in mm (scaled with the card width).
 *
 * Both the Blade views (preview + PDF) and the admin layout editor read
 * from here. Per-application tweaks are stored as partial JSON on the
 * application (layout_overrides), keyed per size, and merged on top by
 * resolve().
 */
class AccessPassLayout
{
    public const CARD_WIDTH_MM = 74;

    public const CARD_HEIGHT_MM = 105;

    public const SIZE_ACCESS_PASS = 'access-pass';

    public const SIZE_PVC_ID = 'pvc-id';

    /** Supported card sizes (mm). */
    public const SIZES = [
        self::SIZE_ACCESS_PASS => ['w' => 74, 'h' => 105],
        self::SIZE_PVC_ID => ['w' => 54, 'h' => 85.6],
    ];

    /** Fields that carry text (and therefore a font size). */
    public const TEXT_FIELDS = ['cn', 'name', 'department'];

    /** Unknown / missing size falls back to the Access Pass. */
    public static function normalizeSize(?string $size): string
    {
        return isset(self::SIZES[$size]) ? $size : self::SIZE_ACCESS_PASS;
    }

    /** ['w' => mm, 'h' => mm] for a size. */
    public static function dimensions(?string $size): array
    {
        return self::SIZES[self::normalizeSize($size)];
    }

    /** Width ratio vs. the 74mm Access Pass (used to scale mm font sizes). */
    public static function scale(?string $size): float
    {
        return self::dimensions($size)['w'] / self::CARD_WIDTH_MM;
    }

    public static function defaults(?string $size = null): array
    {
        $layout = self::baseDefaults();
        $scale = self::scale($size);

        // Boxes are percentages, so the same artwork fits any size. Only the
        // mm font sizes need scaling with the card width.
        if ($scale !== 1.0) {
            foreach (self::TEXT_FIELDS as $field) {
                $layout[$field]['font'] = round($layout[$field]['font'] * $scale, 2);
            }
        }

        return $layout;
    }

    private static function baseDefaults(): array
    {
        return [
            'photo' => ['x' => 33.72, 'y' => 35.29, 'w' => 32.55, 'h' => 24.33],
                        'cn' => ['x' => 6.74, 'y' => 54.45, 'w' => 26.00, 'h' => 7.00, 'font' => 6.4],
            'name' => ['x' => 17.99, 'y' => 63.60, 'w' => 64.52, 'h' => 6.48, 'font' => 6.4],
            'department' => ['x' => 19.94, 'y' => 70.60, 'w' => 60.12, 'h' => 4.69, 'font' => 3.6],
            'signature' => ['x' => 30.00, 'y' => 76.20, 'w' => 40.00, 'h' => 8.00],
        ];
    }

    /**
     * layout_overrides is stored per size: {"access-pass": {...}, "pvc-id": {...}}.
     * Older rows hold a flat field map (photo/cn/...) — that is the Access Pass
     * layout, so it is still honoured without a migration.
     */
    public static function overridesFor(?array $raw, ?string $size = null): array
    {
        $size = self::normalizeSize($size);
        $raw = $raw ?? [];

        if (self::isKeyedBySize($raw)) {
            return is_array($raw[$size] ?? null) ? $raw[$size] : [];
        }

        return $size === self::SIZE_ACCESS_PASS ? $raw : [];
    }

    /** Returns $raw with the given size's overrides replaced (null/empty = cleared). */
    public static function withOverrides(?array $raw, ?string $size, ?array $overrides): ?array
    {
        $size = self::normalizeSize($size);
        $raw = $raw ?? [];

        $all = self::isKeyedBySize($raw)
            ? $raw
            : (empty($raw) ? [] : [self::SIZE_ACCESS_PASS => $raw]);

        if (empty($overrides)) {
            unset($all[$size]);
        } else {
            $all[$size] = $overrides;
        }

        return empty($all) ? null : $all;
    }

    public static function isCustomized(?array $raw, ?string $size = null): bool
    {
        return ! empty(self::overridesFor($raw, $size));
    }

    private static function isKeyedBySize(array $raw): bool
    {
        foreach (array_keys(self::SIZES) as $key) {
            if (array_key_exists($key, $raw)) {
                return true;
            }
        }

        return false;
    }

    /** Defaults for the size with that size's saved overrides merged on top. */
    public static function resolve(?array $raw, ?string $size = null): array
    {
        $layout = self::defaults($size);

        foreach (self::sanitize(self::overridesFor($raw, $size)) as $field => $box) {
            $layout[$field] = array_merge($layout[$field], $box);
        }

        return $layout;
    }

    /**
     * Whitelists fields/keys and clamps values so a bad payload can never
     * push a field off the card or blow up the font size.
     */
    public static function sanitize(array $input): array
    {
        $defaults = self::baseDefaults();
        $clean = [];

        foreach ($defaults as $field => $default) {
            $box = $input[$field] ?? null;
            if (! is_array($box)) {
                continue;
            }

            foreach (['x', 'y', 'w', 'h'] as $key) {
                if (isset($box[$key]) && is_numeric($box[$key])) {
                    $clean[$field][$key] = round(max(0, min(100, (float) $box[$key])), 2);
                }
            }

            if (in_array($field, self::TEXT_FIELDS, true) && isset($box['font']) && is_numeric($box['font'])) {
                $clean[$field]['font'] = round(max(1.5, min(15, (float) $box['font'])), 2);
            }
        }

        return $clean;
    }
}