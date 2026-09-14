<?php

namespace App\Service;

use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Color\Color;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\PngWriter;

/**
 * Generates QR codes as inline base64 PNG data URIs.
 *
 * A data URI (rather than saving a file and pointing at it with
 * asset()) is used deliberately so this works identically in both
 * render paths used by PdfGeneratorService:
 *
 *  - Browser preview: no extra HTTP round-trip or leftover file to
 *    clean up for what is effectively a throwaway image.
 *  - PDF generation (Chromium via the local PdfRenderService, see
 *    PdfGeneratorService::PDF_SERVICE_URL): that Node process has no
 *    knowledge of this app's public_path()/storage_path() filesystem,
 *    so a saved-file + asset() URL would simply 404 inside it — same
 *    reasoning as PdfGeneratorService::toDataUri() for the logos and
 *    applicant photo.
 *
 * Requires: composer require endroid/qr-code
 * Requires: ext-gd (for the manual logo compositing below)
 *
 * NOTE: Locked to ^6.0 (6.0.9) because this project is on PHP < 8.4.
 * v6.1+ adds the fluent Builder::create() factory, which is NOT
 * available on 6.0.x — hence the constructor-based instantiation
 * below instead of Builder::create()->....
 *
 * LOGO OVERLAY
 * ------------
 * endroid 6.0.x's own logoPath/logoResizeToWidth/logoPunchoutBackground
 * builder params punch out QR modules at exactly the logo's size, with
 * no gap between the logo and the surrounding QR pattern. To get a
 * visible "breathing room" ring around the logo, this class instead:
 *
 *   1. Builds the plain QR (no logo) via endroid, as PNG bytes.
 *   2. Loads that PNG into GD.
 *   3. Draws a solid white circular backing plate, sized to
 *      logoWidth + (2 * logoPadding), centered on the QR.
 *   4. Resizes the logo onto that plate, centered.
 *   5. Re-encodes the composited image back to PNG.
 *
 * This only works reliably with ErrorCorrectionLevel::High (already the
 * default below) — High gives ~30% error-correction budget. Keep
 * (logoWidth + 2*logoPadding) comfortably under ~30% of $size, or scans
 * will start failing.
 *
 * IMPORTANT: $logoPath must point to a raster image (PNG/JPEG/WebP) that
 * GD can decode. It CANNOT be an .svg file.
 */
class QrCodeService
{
    // Default logo width as a fraction of the QR's total size. Change
    // this single number to resize the logo across every QR generated
    // without a logoWidth override, without touching any call sites.
    private const DEFAULT_LOGO_WIDTH_RATIO = 0.22;

    // Default gap (in px, at $size scale) between the edge of the logo
    // and the surrounding QR modules — this is the "space" around the
    // logo. Change this to make the white ring thicker/thinner.
    private const DEFAULT_LOGO_PADDING_RATIO = 0.05;

    /**
     * @param  string  $data  The value to encode (e.g. an application_id).
     * @param  int  $size  Output image size in px (square).
     * @param  int  $margin  Quiet-zone margin in px.
     * @param  string|null  $logoPath  Absolute filesystem path to a PNG/JPEG
     *                                 logo to render in the center of the QR.
     *                                 Null or a missing file = no logo,
     *                                 falls back to a plain QR.
     * @param  int|null  $logoWidth  Logo width in px, at $size scale.
     *                               Defaults to DEFAULT_LOGO_WIDTH_RATIO
     *                               of $size when a logo is provided.
     *                               *** Change the size of the middle
     *                               logo by passing this. ***
     * @param  int|null  $logoPadding  Gap in px, at $size scale, between
     *                                 the logo and the QR modules around
     *                                 it. Defaults to
     *                                 DEFAULT_LOGO_PADDING_RATIO of
     *                                 $size. *** Change the space around
     *                                 the logo by passing this. ***
     */
    public function generateDataUri(
        string $data,
        int $size = 300,
        int $margin = 0,
        ?string $logoPath = null,
        ?int $logoWidth = null,
        ?int $logoPadding = null,
    ): string {
        $hasLogo = $logoPath !== null && is_file($logoPath);

        if ($logoPath !== null && ! $hasLogo) {
            logger()->warning('QR logo asset missing, rendering QR without logo', ['path' => $logoPath]);
        }

        $builder = new Builder(
            writer: new PngWriter(),
            data: $data,
            encoding: new Encoding('UTF-8'),
            errorCorrectionLevel: ErrorCorrectionLevel::High,
            size: $size,
            margin: $margin,
            roundBlockSizeMode: RoundBlockSizeMode::Margin,
            foregroundColor: new Color(16, 28, 46), // matches card ink color #101c2e
            backgroundColor: new Color(255, 255, 255),
        );

        $result = $builder->build();
        $pngBytes = $result->getString();

        if (! $hasLogo) {
            return 'data:image/png;base64,'.base64_encode($pngBytes);
        }

        $resolvedLogoWidth = $logoWidth ?? (int) round($size * self::DEFAULT_LOGO_WIDTH_RATIO);
        $resolvedLogoPadding = $logoPadding ?? (int) round($size * self::DEFAULT_LOGO_PADDING_RATIO);

        $composited = $this->compositeLogo($pngBytes, $logoPath, $resolvedLogoWidth, $resolvedLogoPadding);

        return 'data:image/png;base64,'.base64_encode($composited);
    }

    /**
     * Draws a white circular backing plate (logoWidth + 2*logoPadding
     * across) centered on the QR, then places the resized logo centered
     * on top of that plate. Returns raw PNG bytes.
     */
    private function compositeLogo(
        string $qrPngBytes,
        string $logoPath,
        int $logoWidth,
        int $logoPadding,
    ): string {
        $qrImage = imagecreatefromstring($qrPngBytes);
        $qrSize = imagesx($qrImage);
        $center = (int) round($qrSize / 2);

        // Total white plate diameter = logo + padding on each side.
        $plateDiameter = $logoWidth + ($logoPadding * 2);

        imagesavealpha($qrImage, true);
        $white = imagecolorallocate($qrImage, 255, 255, 255);

        imagefilledellipse($qrImage, $center, $center, $plateDiameter, $plateDiameter, $white);

        $logoImage = $this->loadImage($logoPath);

        if ($logoImage !== null) {
            $logoOriginalWidth = imagesx($logoImage);
            $logoOriginalHeight = imagesy($logoImage);
            $logoHeight = (int) round($logoOriginalHeight * ($logoWidth / $logoOriginalWidth));

            $destX = $center - (int) round($logoWidth / 2);
            $destY = $center - (int) round($logoHeight / 2);

            imagesavealpha($logoImage, true);
            imagealphablending($qrImage, true);

            imagecopyresampled(
                $qrImage, $logoImage,
                $destX, $destY, 0, 0,
                $logoWidth, $logoHeight,
                $logoOriginalWidth, $logoOriginalHeight,
            );

            imagedestroy($logoImage);
        }

        ob_start();
        imagepng($qrImage);
        $output = ob_get_clean();

        imagedestroy($qrImage);

        return $output;
    }

    private function loadImage(string $path): \GdImage|false|null
    {
        $mimeType = mime_content_type($path);

        $image = match ($mimeType) {
            'image/png' => imagecreatefrompng($path),
            'image/jpeg' => imagecreatefromjpeg($path),
            'image/webp' => imagecreatefromwebp($path),
            default => null,
        };

        if ($image === null) {
            logger()->warning('QR logo has an unsupported image type, skipping overlay', [
                'path' => $path,
                'mime' => $mimeType,
            ]);
        }

        return $image ?: null;
    }
}