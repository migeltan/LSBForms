<!DOCTYPE html>
<html lang="en">

@php
    $size = $size ?? \App\Support\AccessPassLayout::SIZE_ACCESS_PASS;
    $dim = \App\Support\AccessPassLayout::dimensions($size);
    $cardW = $dim['w'];
    $cardH = $dim['h'];
    $sizeScale = \App\Support\AccessPassLayout::scale($size);
    // Back-page content is authored at 74mm wide; it is scaled to the card
    // width and its box is made taller so the footer stays at the bottom.
    $backH = round($cardH / $sizeScale, 2);
@endphp
<head>
    <meta charset="UTF-8">
    <title>Access Pass — {{ $applicant->full_name }}</title>

    <style>
        /*
         * The real downloadable Access Pass PDF: page 1 is the front card,
         * page 2 is the back. Puppeteer's page.pdf({width, height}) (see
         * server.js) overrides @page size with whatever px values
         * PdfGeneratorService::ACCESS_PASS_WIDTH_PX / HEIGHT_PX send, so
         * those two MUST stay in sync with the 74mm x 105mm here.
         */
        @page {
            size: {{ $cardW }}mm {{ $cardH }}mm;
            margin: 0;
        }

        @font-face {
            font-family: 'Bebas Neue';
            src: url('{{ $assets['bebasFont'] }}') format('truetype');
            font-weight: normal;
            font-style: normal;
        }

        * {
            box-sizing: border-box;
        }

        html,
        body {
            margin: 0;
            padding: 0;
        }

        .card {
            position: relative;
            width: {{ $cardW }}mm;
            height: {{ $cardH }}mm;
            overflow: hidden;
        }

        .card.front {
            page-break-after: always;
            background-image: url('{{ $assets['template'] }}');
            background-size: 100% 100%;
            background-repeat: no-repeat;
        }

        .field {
            position: absolute;
            display: flex;
            align-items: center;
            overflow: hidden;
        }

        .photo {
            background-color: #eef1f5;
            background-size: cover;
            background-position: center;
            justify-content: center;
            font-size: 2.2mm;
            color: #98a4b3;
            text-align: center;
            border-radius: 1mm;
            border: 0.3mm solid #1a1a1a;
        }

        .cn-value {
            font-family: Georgia, 'Times New Roman', serif;
            font-weight: bold;
            color: #1a1a1a;
            white-space: nowrap;
            line-height: 1;
        }

        .name {
            font-family: 'Bebas Neue', Arial, sans-serif;
            line-height: 1;
            color: #1a1a1a;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            white-space: nowrap;
        }

        .department {
            font-family: 'Bebas Neue', Arial, sans-serif;
            line-height: 1;
            color: #1a1a1a;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            white-space: nowrap;
        }

        .bar-text {
            left: 0;
            top: 89.59%;
            width: 100%;
            height: 6.89%;
            justify-content: center;
            font-family: 'Bebas Neue', Arial, sans-serif;
            font-size: {{ round(5.2 * $sizeScale, 2) }}mm;
            letter-spacing: 3px;
            white-space: nowrap;
            color: #ffffff;
            text-transform: uppercase;
        }

        .signature-img {
            justify-content: center;
        }

        .signature-img img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        /* --- back --- */
        .back {
            background: #ffffff;
        }

        .back-inner {
            position: relative;
            width: 74mm;
            height: {{ $backH }}mm;
            transform: scale({{ $sizeScale }});
            transform-origin: top left;
            font-family: Georgia, 'Times New Roman', serif;
            color: #1a1a1a;
            padding: 5mm 5.5mm;
        }

        .seal {
            display: block;
            width: 11mm;
            height: 11mm;
            margin: 0 auto 2mm;
        }

        .heading {
            text-align: center;
            font-size: 2.6mm;
            font-weight: bold;
            letter-spacing: 0.6px;
            text-transform: uppercase;
            color: #a52d22;
        }

        .subheading {
            text-align: center;
            font-size: 2.1mm;
            color: #4a4a4a;
            margin-top: 0.6mm;
            margin-bottom: 4mm;
        }

        .rule {
            border: none;
            border-top: 0.3mm solid #a52d22;
            margin: 3mm 0;
        }

        .notice {
            font-size: 2.35mm;
            line-height: 1.55;
            text-align: justify;
        }

        .notice + .notice {
            margin-top: 2.5mm;
        }

        .notice strong {
            color: #a52d22;
        }

        .return-block {
            margin-top: 4mm;
            font-size: 2.2mm;
            line-height: 1.5;
            text-align: center;
        }

        .return-block .label {
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 2mm;
            color: #6a6a6a;
        }

        .sign-block {
            position: absolute;
            left: 5.5mm;
            right: 5.5mm;
            bottom: 8mm;
            text-align: center;
        }

        .sign-line {
            border-top: 0.25mm solid #1a1a1a;
            width: 44mm;
            margin: 0 auto;
        }

        .sign-caption {
            font-size: 1.9mm;
            letter-spacing: 0.6px;
            text-transform: uppercase;
            color: #6a6a6a;
            margin-top: 1mm;
        }

        .footer-strip {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 4mm;
            background: #a52d22;
        }
    </style>
</head>

<body>

    @php
        $photoStyle = $assets['photo'] ? "background-image:url('{$assets['photo']}');" : '';

        // Same layout source as the preview (defaults for this size + saved tweaks).
        $L = \App\Support\AccessPassLayout::resolve($application->layout_overrides, $size);
        $box = function (string $field) use ($L) {
            $b = $L[$field];
            $css = "left:{$b['x']}%;top:{$b['y']}%;width:{$b['w']}%;height:{$b['h']}%;";
            if (isset($b['font'])) {
                $css .= "font-size:{$b['font']}mm;";
            }

            return $css;
        };
    @endphp

    @if (($only ?? null) !== 'back')
    <div class="card front">
        <div class="field bar-text" data-fit>{{ $applicant->applicant_type }}</div>
        <div class="field photo" style="{{ $box('photo') }}{{ $photoStyle }}">
            @unless ($assets['photo'])
                NO PHOTO
            @endunless
        </div>
        <div class="field cn-value" data-fit style="{{ $box('cn') }}">{{ $application->control_number ?? '—' }}</div>
        <div class="field name" style="{{ $box('name') }}">{{ strtoupper($applicant->full_name) }}</div>
        <div class="field department" style="{{ $box('department') }}">Legislative Security Bureau</div>
        <div class="field signature-img" style="{{ $box('signature') }}">
            @if (! empty($assets['signature']))
                <img src="{{ $assets['signature'] }}" alt="Signature">
            @endif
        </div>
    </div>

  @endif

  <div class="card back">
      <div class="back-inner">
        <img class="seal" src="{{ $sealSrc }}" alt="">
        <div class="heading">House of Representatives</div>
        <div class="subheading">Legislative Security Bureau</div>

        <hr class="rule">

        <div class="notice">
            <strong>This pass is the property of the House of Representatives</strong> and is
            non-transferable. It must be worn, face-out, above the waist at all times while
            inside House premises.
        </div>
        <div class="notice">
            The bearer agrees to comply with all security procedures of the Legislative Security
            Bureau. This pass may be confiscated and access revoked for misuse, tampering, or
            failure to present valid identification upon request.
        </div>

        <div class="return-block">
            <div class="label">If found, please return to</div>
            Legislative Security Bureau<br>
            House of Representatives, Batasan Complex<br>
            Constitution Hills, Quezon City
        </div>

        <div class="sign-block">
            <div class="sign-line"></div>
            <div class="sign-caption">Issuing Officer</div>
        </div>

          <div class="footer-strip"></div>
      </div>
      </div>

          <script>
        (function () {
            function fit() {
                document.querySelectorAll('[data-fit]').forEach(function (el) {
                    var size = parseFloat(getComputedStyle(el).fontSize);
                    while (el.scrollWidth > el.clientWidth + 0.5 && size > 6) {
                        size -= 0.25;
                        el.style.fontSize = size + 'px';
                    }
                });
            }
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(fit);
            } else {
                window.addEventListener('load', fit);
            }
        })();
    </script>

  </body>

</html>