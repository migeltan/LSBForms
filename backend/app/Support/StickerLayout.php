<?php

namespace App\Support;

/**
 * Where the sticker number sits on vehicle-sticker-blank.png.
 * Box values are percentages of the sticker (x/y = top-left, w/h = size);
 * font is in mm. Per-application tweaks are stored flat as
 * {"cn": {...}} in layout_overrides and merged over the defaults.
 */
class StickerLayout
{
    public const WIDTH_MM = 76.2;

    public const HEIGHT_MM = 127;

    public static function defaults(): array
    {
        return [
            'cn' => ['x' => 40.43, 'y' => 70.6, 'w' => 24.08, 'h' => 6.88, 'font' => 7.0],
        ];
    }

    public static function resolve(?array $raw): array
    {
        $layout = self::defaults();

        foreach (self::sanitize($raw ?? []) as $field => $box) {
            $layout[$field] = array_merge($layout[$field], $box);
        }

        return $layout;
    }

    public static function isCustomized(?array $raw): bool
    {
        return ! empty(self::sanitize($raw ?? []));
    }

    /** Whitelists keys and clamps values so a bad payload can't break the sticker. */
    public static function sanitize(array $input): array
    {
        $box = $input['cn'] ?? null;
        if (! is_array($box)) {
            return [];
        }

        $clean = [];
        foreach (['x', 'y', 'w', 'h'] as $key) {
            if (isset($box[$key]) && is_numeric($box[$key])) {
                $clean['cn'][$key] = round(max(0, min(100, (float) $box[$key])), 2);
            }
        }
        if (isset($box['font']) && is_numeric($box['font'])) {
            $clean['cn']['font'] = round(max(1.5, min(15, (float) $box['font'])), 2);
        }

        return $clean;
    }
}