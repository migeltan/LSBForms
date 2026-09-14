<?php

namespace App\Service;

use App\Models\Applicant;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\View;

class PdfGeneratorService
{
    // ---------------------------------------------------------------------
    // Physical print page size: standard CR80 / ID-1 card, printed in
    // portrait orientation — 2.125in x 3.375in (54mm x 85.6mm), the exact
    // same physical size as a credit card.
    //
    // Puppeteer's page.pdf({ width, height }) treats bare numeric
    // width/height as CSS px at 96dpi, so:
    //   2.125in * 96dpi = 204px
    //   3.375in * 96dpi = 324px
    // Sending 204x324 here means the PDF page itself measures exactly
    // 2.125in x 3.375in when printed at 100% / "actual size" — no
    // "fit to page" scaling needed on the printer's end.
    //
    // The card's visual design (logos, photo boxes, text) is authobed in
    // the Blade view at a larger 380x600 reference canvas for easier
    // editing/preview, then scaled down to this exact physical page size
    // via a CSS transform in the view itself — see reports.access_pass.
    // ---------------------------------------------------------------------
    private const PAGE_WIDTH_PX = 204;  // 2.125in * 96dpi
    private const PAGE_HEIGHT_PX = 324; // 3.375in * 96dpi

    // ---------------------------------------------------------------------
    // Physical print page size: vehicle sticker, portrait rectangle, 3in x
    // 4in @ 96dpi = 288x384px. Authobed in the Blade view at a 300x400
    // reference canvas, scaled down the same way as the access pass — see
    // reports.vehicel_sticker.
    //
    // Was previously a 288x288 square (circular badge design); the view is
    // now a portrait rectangle, so STICKER_HEIGHT_PX changed from 288 to 384.
    // ---------------------------------------------------------------------
    private const STICKER_WIDTH_PX = 288;  // 3in * 96dpi
    private const STICKER_HEIGHT_PX = 384; // 4in * 96dpi

    // Base URL of the local background PDF-render service (node-windows
    // service "PdfRenderService", server.js listening on 127.0.0.1:4488).
    private const PDF_SERVICE_URL = 'http://127.0.0.1:4488/render-pdf';

    // Pixel size the QR is generated at. Rendered fairly large here and
    // scaled down by the CSS/Tailwind class in the Blade view — sharper
    // than generating at the final display size, since it also has to
    // survive being scaled down again by the page transform in the PDF
    // path.
    private const QR_SIZE_PX = 500;

    // Size (px, at QR_SIZE_PX scale) of the HR seal composited into the
    // center of the QR code. Change this to resize the logo.
    private const QR_LOGO_WIDTH_PX = 130;

    // Gap (px, at QR_SIZE_PX scale) between the edge of the logo and the
    // surrounding QR modules. Change this to adjust the spacing/white
    // ring around the logo.
    private const QR_LOGO_PADDING_PX = 25;

    public function __construct(
        private readonly QrCodeService $qrCodeService,
    ) {}

    public function previewAccessPass(int $applicantId): Response
    {
        $applicant = Applicant::with('accessPassApplication')->findOrFail($applicantId);
        $application = $applicant->accessPassApplication;

        abort_if(! $application, 404, 'No access pass application found for this applicant.');

        $html = $this->renderHtml('reports.access_pass', $applicant, $application, false);

        return response($html, 200)->header('Content-Type', 'text/html; charset=UTF-8');
    }

    public function downloadAccessPass(int $applicantId): Response
    {
        $applicant = Applicant::with('accessPassApplication')->findOrFail($applicantId);
        $application = $applicant->accessPassApplication;

        abort_if(! $application, 404, 'No access pass application found for this applicant.');

        return $this->generatePdf(
            'reports.access_pass',
            $applicant,
            $application,
            'AccessPassID',
            self::PAGE_WIDTH_PX,
            self::PAGE_HEIGHT_PX,
        );
    }

    public function previewVehicleSticker(int $applicantId): Response
    {
        $applicant = Applicant::with('vehicleApplication')->findOrFail($applicantId);
        $application = $applicant->vehicleApplication;

        abort_if(! $application, 404, 'No vehicle sticker application found for this applicant.');

        $html = $this->renderHtml('reports.vehicel_sticker', $applicant, $application, false);

        return response($html, 200)->header('Content-Type', 'text/html; charset=UTF-8');
    }

    public function downloadVehicleSticker(int $applicantId): Response
    {
        $applicant = Applicant::with('vehicleApplication')->findOrFail($applicantId);
        $application = $applicant->vehicleApplication;

        abort_if(! $application, 404, 'No vehicle sticker application found for this applicant.');

        return $this->generatePdf(
            'reports.vehicel_sticker',
            $applicant,
            $application,
            'VehicleStickerID',
            self::STICKER_WIDTH_PX,
            self::STICKER_HEIGHT_PX,
        );
    }

    /**
     * Shared HTML render for any ID/sticker view.
     *
     * $forPdf = false: served straight to the browser (preview), normal
     * asset() URLs, Tailwind loaded via the linked compiled stylesheet.
     *
     * $forPdf = true: sent to the PdfRenderService (Chromium via Puppeteer).
     * Assets are embedded as base64 data: URIs rather than file:// paths —
     * the Node service's Chromium instance has no knowledge of this app's
     * public_path()/storage_path() filesystem, so file:// URLs would
     * simply 404 inside that process. Data URIs sidestep that entirely
     * and also avoid path-escaping headaches across OSes.
     *
     * The QR code is generated fresh every render (see QrCodeService) and
     * passed as a data URI regardless of $forPdf — unlike the logos,
     * there's no static file for the browser-preview path to point
     * asset() at either, since it's derived from the applicant's
     * application_id rather than something sitting in public/.
     *
     * The QR carries the HR seal centered on it, loaded from a real
     * filesystem path (not $hrLogoSrc, which is an asset() URL or data
     * URI depending on $forPdf) — see QrCodeService::generateDataUri()
     * doc block for why the logo needs a plain PNG on disk rather than
     * either of those. This means the logo overlay renders identically
     * whether this is a preview or a PDF.
     */
    private function renderHtml(string $view, $applicant, $application, bool $forPdf): string
    {
        $assets = $forPdf ? $this->buildInlineAssets($application) : [];

        $qrCode = $this->qrCodeService->generateDataUri(
            (string) $applicant->application_id,
            self::QR_SIZE_PX,
            logoPath: public_path('images/House_of_Representatives_Logo.png'),
            logoWidth: self::QR_LOGO_WIDTH_PX,
            logoPadding: self::QR_LOGO_PADDING_PX,
        );

        return View::make($view, [
            'applicant' => $applicant,
            'application' => $application,
            'forPdf' => $forPdf,
            'assets' => $assets,
            'qrCode' => $qrCode,
        ])->render();
    }

    private function buildInlineAssets($application): array
    {
        $photoPath = $application->photo_path ?? null;

        return [
            'philippineLogo' => $this->toDataUri(public_path('images/Philippine_Logo.webp')),
            'access_congressLogo' => $this->toDataUri(public_path('images/20_Congress_Logo3.png')),
            'vehicle_congressLogo' => $this->toDataUri(public_path('images/20_Congress_Logo2.png')),
            'sunflag' => $this->toDataUri(public_path('images/sun-flag.png')),
            'hrLogo' => $this->toDataUri(public_path('images/House_of_Representatives_Logo.svg')),
            'applicantPhoto' => $photoPath
                ? $this->toDataUri(storage_path('app/public/'.$photoPath))
                : null,
            'compiledCss' => is_file(public_path('css/id-cards-compiled.css'))
                ? file_get_contents(public_path('css/id-cards-compiled.css'))
                : '',
        ];
    }

    private function toDataUri(string $absolutePath): ?string
    {
        if (! is_file($absolutePath)) {
            logger()->warning('PDF asset missing, image will render blank', ['path' => $absolutePath]);

            return null;
        }

        $mimeType = mime_content_type($absolutePath) ?: 'application/octet-stream';
        $data = base64_encode(file_get_contents($absolutePath));

        return "data:{$mimeType};base64,{$data}";
    }

    /**
     * Generates the PDF by POSTing rendered HTML to the local
     * PdfRenderService (node-windows background service running
     * server.js / Express + Puppeteer on 127.0.0.1:4488).
     *
     * Page size is now passed in per-call ($pageWidth / $pageHeight)
     * rather than assumed fixed, since different report types use
     * different physical page sizes (portrait CR80 card for the access
     * pass vs. a square sticker for the vehicle sticker). Both the
     * viewport and the PDF page the Node service uses match whatever is
     * passed here — mirroring what ->windowSize() and ->paperSize() did
     * under Browsershot, just handled service-side now (see server.js:
     * page.setViewport + page.pdf({ width, height })).
     *
     * IMPORTANT: whatever $pageWidth/$pageHeight you pass here MUST match
     * the `@page { size: ... }` rule declared in that view's <style>
     * block, or the PDF page and the rendered content will disagree on
     * physical size.
     *
     * No sandbox/node-binary/chrome-path config needed here anymore —
     * that's all owned by the Node service process itself, not this PHP
     * request. If the service isn't running, this will fail fast with a
     * connection-refused rather than silently launching a new Chromium.
     */
    private function generatePdf(
        string $view,
        $applicant,
        $application,
        string $fileNamePrefix,
        int $pageWidth = self::PAGE_WIDTH_PX,
        int $pageHeight = self::PAGE_HEIGHT_PX,
    ): Response {
        set_time_limit(120);

        $html = $this->renderHtml($view, $applicant, $application, true);

        try {
            $response = Http::timeout(60)
                ->connectTimeout(5)
                ->post(self::PDF_SERVICE_URL, [
                    'html' => $html,
                    'width' => $pageWidth,
                    'height' => $pageHeight,
                ]);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            logger()->error('PdfRenderService unreachable', ['error' => $e->getMessage()]);

            abort(503, 'PDF render service is not running. Please contact IT.');
        }

        if (! $response->successful()) {
            logger()->error('PdfRenderService returned an error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            abort(500, 'PDF render service failed: '.$response->body());
        }

        $pdfContent = $response->body();

        $fileName = $fileNamePrefix.'-'.($applicant->application_id ?? $applicant->id).'.pdf';

        return response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$fileName.'"',
        ]);
    }
}