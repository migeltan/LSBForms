<?php

namespace App\Support;

/**
 * Single source of truth for where each variable field sits on the
 * Access Pass card. Boxes are percentages of the 74x105mm card
 * (x/y = top-left corner, w/h = size). Text fields also carry a font
 * size in mm.
 *
 * Both the Blade view (preview + PDF) and the admin layout editor read
 * from here, so tuning the default layout = editing the numbers below.
 * Per-application tweaks are stored as a partial JSON on the application
 * (layout_overrides) and merged on top by resolve().
 */
class AccessPassLayout
{
    public const CARD_WIDTH_MM = 74;

    public const CARD_HEIGHT_MM = 105;

    /** Fields that carry text (and therefore a font size). */
    public const TEXT_FIELDS = ['cn', 'name', 'department'];

    public static function defaults(): array
    {
        return [
            'photo' => ['x' => 33.72, 'y' => 35.29, 'w' => 32.55, 'h' => 24.33],
            'cn' => ['x' => 6.74, 'y' => 56.40, 'w' => 22.97, 'h' => 3.10, 'font' => 4.6],
            'name' => ['x' => 17.99, 'y' => 63.60, 'w' => 64.52, 'h' => 6.48, 'font' => 6.4],
            'department' => ['x' => 19.94, 'y' => 70.60, 'w' => 60.12, 'h' => 4.69, 'font' => 3.6],
            'signature' => ['x' => 30.00, 'y' => 76.20, 'w' => 40.00, 'h' => 8.00],
        ];
    }

    /** Defaults with any saved overrides merged on top. */
    public static function resolve(?array $overrides): array
    {
        $layout = self::defaults();

        foreach (self::sanitize($overrides ?? []) as $field => $box) {
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
        $defaults = self::defaults();
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