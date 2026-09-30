<?php

namespace App\Service;

use App\Models\Applicant;
use App\Support\AccessPassLayout;
use Illuminate\Http\Request;
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

    // Access Pass v2: 74mm x 105mm. 96dpi px equivalents, since Puppeteer's
    // page.pdf({width,height}) (server.js) overrides the view's own @page
    // rule — these two MUST match the "74mm 105mm" in access_pass_pdf.blade.php.
    private const ACCESS_PASS_WIDTH_PX = 280;  // 74mm / 25.4 * 96
    private const ACCESS_PASS_HEIGHT_PX = 397; // 105mm / 25.4 * 96

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
    public function previewAccessPassFrontV2(int $applicantId): Response
    {
        $applicant = Applicant::with('accessPassApplication')->findOrFail($applicantId);
        $application = $applicant->accessPassApplication;

        abort_if(! $application, 404, 'No access pass application found for this applicant.');

        $html = $this->renderIdView('reports.access_pass_front', $applicant, $application, false);

        return response($html, 200)->header('Content-Type', 'text/html; charset=UTF-8');
    }

    public function previewAccessPassBackV2(int $applicantId): Response
    {
        $applicant = Applicant::with('accessPassApplication')->findOrFail($applicantId);
        $application = $applicant->accessPassApplication;

        abort_if(! $application, 404, 'No access pass application found for this applicant.');

        $html = $this->renderIdBackView($applicant, false);

        return response($html, 200)->header('Content-Type', 'text/html; charset=UTF-8');
    }

    private function renderIdView(string $view, $applicant, $application, bool $forPdf, string $size = AccessPassLayout::SIZE_ACCESS_PASS): string
    {
        $idAssets = $this->buildIdCardAssets($application, $forPdf);

        return View::make($view, [
            'applicant' => $applicant,
            'application' => $application,
            'forPdf' => $forPdf,
            'size' => $size,
            'assets' => $idAssets,
            'templateSrc' => $idAssets['template'],
            'photoSrc' => $idAssets['photo'],
            'controlNumber' => $application->control_number ?? null,
            'department' => 'Legislative Security Bureau',
            'category' => 'Security',
        ])->render();
    }

    private function renderIdBackView($applicant, bool $forPdf): string
    {
        return View::make('reports.access_pass_back', [
            'applicant' => $applicant,
            'forPdf' => $forPdf,
            'sealSrc' => $forPdf
                ? $this->toDataUri(public_path('images/House_of_Representatives_Logo.png'))
                : asset('images/House_of_Representatives_Logo.png'),
        ])->render();
    }

    private function buildIdCardAssets($application, bool $forPdf): array
    {
        $photoPath = $application->photo_path ?? null;

        // Bebas Neue is always embedded as a data: URI, even for the
        // browser preview — that preview is injected via <iframe srcDoc>,
        // which gets an opaque origin, and Chrome blocks cross-origin
        // @font-face loads from that context. A data: URI has no network
        // request at all, so there's nothing for CORS to block. The
        // template/photo images are fine as plain asset() URLs either way
        // — that CORS restriction is specific to fonts (and canvas pixel
        // reads), not <img>/background-image loads.
        $bebasFont = $this->toDataUri(public_path('fonts/BebasNeue-Regular.ttf'));

        if ($forPdf) {
            return [
                'template' => $this->toDataUri(public_path('images/id-templates/access-pass-blank.png')),
                'photo' => $photoPath ? $this->toDataUri(storage_path('app/public/'.$photoPath)) : null,
                'bebasFont' => $bebasFont,
            ];
        }

        return [
            'template' => asset('images/id-templates/access-pass-blank.png'),
            'photo' => $photoPath ? asset('storage/'.$photoPath) : null,
            'bebasFont' => $bebasFont,
        ];
    }
    public function previewVehicleStickerFrontV2(int $applicantId): Response
    {
        $applicant = Applicant::with('vehicleApplication')->findOrFail($applicantId);
        $application = $applicant->vehicleApplication;

        abort_if(! $application, 404, 'No vehicle sticker application found for this applicant.');

        $html = View::make('reports.vehicle_sticker_front', [
            'applicant' => $applicant,
            'templateSrc' => asset('images/id-templates/vehicle-sticker-blank.png'),
            'controlNumber' => $application->sticker_number ?? null,
        ])->render();

        return response($html, 200)->header('Content-Type', 'text/html; charset=UTF-8');
    }

    public function previewAccessPass(Request $request, int $applicantId): Response
    {
        $applicant = Applicant::with('accessPassApplication')->findOrFail($applicantId);
        $application = $applicant->accessPassApplication;

        abort_if(! $application, 404, 'No access pass application found for this applicant.');

        $size = AccessPassLayout::normalizeSize($request->query('size'));
        $html = $this->renderIdView('reports.access_pass_front', $applicant, $application, false, $size);

        return response($html, 200)->header('Content-Type', 'text/html; charset=UTF-8');
    }

    public function downloadAccessPass(Request $request, int $applicantId): Response
    {
        $applicant = Applicant::with('accessPassApplication')->findOrFail($applicantId);
        $application = $applicant->accessPassApplication;

        abort_if(! $application, 404, 'No access pass application found for this applicant.');

        $size = AccessPassLayout::normalizeSize($request->query('size'));
        $idAssets = $this->buildIdCardAssets($application, true);
        $html = View::make('reports.access_pass_pdf', [
            'applicant' => $applicant,
            'application' => $application,
            'size' => $size,
            'assets' => $idAssets,
            'sealSrc' => $this->toDataUri(public_path('images/House_of_Representatives_Logo.png')),
        ])->render();

        // Puppeteer takes px @ 96dpi; these must match the card mm in the view.
        [$pageW, $pageH] = $size === AccessPassLayout::SIZE_PVC_ID
            ? [self::PAGE_WIDTH_PX, self::PAGE_HEIGHT_PX]              // 204 x 324 (54 x 85.6mm)
            : [self::ACCESS_PASS_WIDTH_PX, self::ACCESS_PASS_HEIGHT_PX]; // 280 x 397 (74 x 105mm)

        $prefix = $size === AccessPassLayout::SIZE_PVC_ID ? 'PvcID' : 'AccessPassID';

        return $this->postPdf($html, $pageW, $pageH, $prefix, $applicant);
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
        $html = $this->renderHtml($view, $applicant, $application, true);

        return $this->postPdf($html, $pageWidth, $pageHeight, $fileNamePrefix, $applicant);
    }

    /**
     * Posts already-rendered HTML to the Puppeteer render service and
     * returns the resulting PDF as a download response. Split out of
     * generatePdf() so access-pass v2 (which builds its HTML differently —
     * a combined front+back doc, not the old QR-based renderHtml()) can
     * share the same "talk to the Node service" logic.
     */
    private function postPdf(
        string $html,
        int $pageWidth,
        int $pageHeight,
        string $fileNamePrefix,
        $applicant,
    ): Response {
        set_time_limit(120);

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