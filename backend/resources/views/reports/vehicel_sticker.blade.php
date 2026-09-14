<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Vehicle Sticker — {{ $applicant->full_name }}</title>
    <script src="https://cdn.tailwindcss.com"></script>

    @if ($forPdf)
        <style>
            {!! $assets['compiledCss'] !!}
        </style>
    @else
        <link rel="stylesheet" href="{{ asset('css/id-cards-compiled.css') }}">
    @endif

    <style>
        /* Physical PDF page size: portrait rectangle sticker, 3in x 4in @
           96dpi = 288x384px. Must match
           PdfGeneratorService::STICKER_WIDTH_PX / STICKER_HEIGHT_PX. */
        @page {
            size: 288px 384px;
            margin: 0;
        }

        .chevron-trim {
            background-color: transparent;
            background-image:
                linear-gradient(45deg, transparent 40%, var(--c) 40%, var(--c) 48%, transparent 48%, transparent 52%, var(--c) 52%, var(--c) 60%, transparent 60%),
                linear-gradient(-45deg, transparent 40%, var(--c) 40%, var(--c) 48%, transparent 48%, transparent 52%, var(--c) 52%, var(--c) 60%, transparent 60%);
            background-size: 24px 24px;
            background-position: 0 0;
            background-repeat: repeat-y;
        }

        .chevron-trim--left {
            --c: #0038a8;
            /* PH flag blue */
        }

        .chevron-trim--right {
            --c: #ce1126;
            /* PH flag red */
        }
    </style>
</head>

<body class="p-0 m-0 font-sans bg-slate-300">

    @php
        // Signatory block — authobizing officer (Sergeant-at-Arms), not
        // the applicant, so not pulled from $applicant.
        $signatoryName = 'BGEN FERDINAND MELChob C DELA CRUZ AFP (RET) MNSA';
        $signatoryTitle = 'Sergeant-at-Arms';
    @endphp

    @php
        $congressLogoSrc = $forPdf ? $assets['vehicle_congressLogo'] : asset('images/20_Congress_Logo2.png');
        $hrLogoSrc = $forPdf ? $assets['hrLogo'] : asset('images/House_of_Representatives_Logo.svg');

        $designWidth = 300;
        $designHeight = 400;
        $pageWidth = 288;
        $pageHeight = 384;
        $scaleX = $pageWidth / $designWidth;
        $scaleY = $pageHeight / $designHeight;

        $stickerNo = $applicant->application_id ?? '0000';
        $plateNo = $application->plate_number ?? '—';
    @endphp

    @php
        // ---------------------------------------------------------------
        // SUNBURST / SEAL GEOMETRY — edit these to reshape the petals,
        // ring, and spacing. Everything below is computed FROM these
        // values, so you only ever need to touch this block.
        // ---------------------------------------------------------------
        $sunburst = [
            // Number of petals/rays around the seal (PH flag sun = 8).
            'ray_count' => 8,

            // Diameter of the blue-bordered white ring holding the seal
            // artwork. Ring's outer radius is half of this.
    'ring_diameter' => 100,

    // Diameter of the seal artwork image inside the ring.
    'logo_diameter' => 86,

    // Ring border thickness (px) + color.
    'ring_border_width' => 3,
    'ring_border_color' => '#fcd116',

    // Gap (px) between the ring's outer edge and where the petal
            // base starts. Increase this for more breathing room.
            'petal_gap' => 3,

            // Ray length (px) — how far the petal tip extends PAST its
            // base. Increase for longer/spikier rays.
            'ray_length' => 22,

            // Petal width (px) at its widest point.
            'petal_width' => 38,

            // Petal fill color (flat, no gradient — PH flag sun yellow).
            'petal_color' => '#fcd116',

            // Petal shape as a clip-path polygon (percentages within its
            // own box). Default is a pentagon: flat top (tip, pointing
            // outward), two angled shoulders, flat bottom (base, toward
            // center). Tweak the shoulder points (currently 92%/8% at
            // 30% down) to make the pentagon more/less angular.
            'petal_clip_path' => 'polygon(50% 0%, 92% 30%, 78% 100%, 22% 100%, 8% 30%)',

            // Drop shadow under each petal, CSS filter syntax.
            'petal_shadow' => '0 1px 1px rgba(0,0,0,0.35)',

            // Top offset (px, on the 300x400 design canvas) of the whole
            // sunburst block.
            'block_top' => 104,
        ];

        // --- Derived values (don't edit — computed from the above) -----
$ringRadius = $sunburst['ring_diameter'] / 2;
$petalBaseRadius = $ringRadius + $sunburst['petal_gap'];
$petalTipRadius = $petalBaseRadius + $sunburst['ray_length'];
$petalHalfWidth = $sunburst['petal_width'] / 2;
// Container must be at least 2x the tip radius so rays aren't
        // clipped; +10px padding for the drop shadow.
        $sunburstBoxSize = $petalTipRadius * 2 + 10;
    @endphp

    {{-- True physical render canvas — 288x384px (3in x 4in), matching
         PdfGeneratorService::STICKER_WIDTH_PX / STICKER_HEIGHT_PX. --}}
    <div class="relative mx-auto overflow-hidden" style="width:{{ $pageWidth }}px;height:{{ $pageHeight }}px;">

        {{-- Original 300x400 design canvas, scaled down to fit the
             288x384 physical page. transform-origin stays top-left so the
             scale maps (0,0)-(300,400) onto (0,0)-(288,384) directly. --}}
        <div class="absolute top-0 left-0 origin-top-left"
            style="width:{{ $designWidth }}px;height:{{ $designHeight }}px;transform:scale({{ $scaleX }}, {{ $scaleY }});">

            {{-- No rounded corners on the card itself, header, plate
                 badge, or app-no chip — the sunburst ring is the one
                 deliberate exception (round, per the flag-sun design). --}}
            <div class="relative w-[300px] h-[400px] mx-auto overflow-hidden bg-[#fbfaf6]">

                {{--  SECTION 0B - CHEVRON TRIM (left/right edges)  --}}
                <div class="chevron-trim chevron-trim--left absolute top-[5px] left-0 bottom-0 w-[22px]"></div>
                <div class="chevron-trim chevron-trim--right absolute top-[5px] right-0 bottom-0 w-[22px]"></div>

                {{--  SECTION 1 - HEADER: CONGRESS LOGO + WORDMARK  --}}
                <div class="absolute top-[3px] left-0 right-0 text-center px-[34px]">
                    <img src="{{ $congressLogoSrc }}" alt="20th Congress Logo"
                        class="mx-auto h-[82px] w-auto object-contain">
                    <div class="text-[9.5px] font-extrabold uppercase tracking-[1.5px] text-[#ce1126] mt-[1px]">
                        House of Representatives
                    </div>
                </div>

                {{--  SECTION 2 - CENTER SEAL, 8-petal sunburst frame
                     (Philippine-flag-sun motif, pentagon rays). All
                     sizing driven by the $sunburst config above — edit
                     that block to reshape/resize instead of touching the
                     markup here. --}}
                <div class="absolute -translate-x-1/2 left-1/2"
                    style="top:{{ $sunburst['block_top'] }}px;width:{{ $sunburstBoxSize }}px;height:{{ $sunburstBoxSize }}px;">

                    @for ($i = 0; $i < $sunburst['ray_count']; $i++)
                        <div class="absolute top-1/2 left-1/2"
                            style="width:{{ $sunburst['petal_width'] }}px;height:{{ $sunburst['ray_length'] }}px;
                                   margin-left:-{{ $petalHalfWidth }}px;margin-top:-{{ $petalTipRadius }}px;
                                   transform-origin: {{ $petalHalfWidth }}px {{ $petalTipRadius }}px;
                                   transform: rotate({{ $i * (360 / $sunburst['ray_count']) }}deg);
                                   background: {{ $sunburst['petal_color'] }};
                                   clip-path: {{ $sunburst['petal_clip_path'] }};
                                   filter: drop-shadow({{ $sunburst['petal_shadow'] }});">
                        </div>
                    @endfor

                    {{-- Center ring + seal artwork, layered on top of the petals --}}
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_8px_rgba(15,35,65,0.3)] flex items-center justify-center overflow-hidden"
                        style="width:{{ $sunburst['ring_diameter'] }}px;height:{{ $sunburst['ring_diameter'] }}px;
                               border:{{ $sunburst['ring_border_width'] }}px solid {{ $sunburst['ring_border_color'] }};">
                        <img src="{{ $hrLogoSrc }}" alt="House of Representatives Seal"
                            style="width:{{ $sunburst['logo_diameter'] }}px;height:{{ $sunburst['logo_diameter'] }}px;"
                            class="object-contain">
                    </div>
                </div>

                {{--  SECTION 3 - GOLD STAR DIVIDER  --}}
                <div class="absolute top-[260px] left-0 right-0 text-center text-[#ffd400] text-[15px] tracking-[6px]">
                    ★ ★ ★
                </div>

                {{--  SECTION 4 - PLATE NUMBER, the focal point of the
                     sticker: navy label, gold badge with thick navy
                     border and drop shadow, large font. --}}
                <div class="absolute top-[284px] left-0 right-0 flex flex-col items-center">
                    <div class="text-[7px] font-black uppercase tracking-[3px] text-[#0038a8] mb-[3px]">
                        Plate No.
                    </div>
                    <div class="relative w-full flex justify-center py-[4px]">
                        <div
                            class="inline-flex items-center bg-gradient-to-b from-[#fff6c9] via-[#ffd400] to-[#f0b400] border-[3px] border-[#101c2e] px-5 py-[2px] shadow-[0_3px_10px_rgba(0,0,0,0.45)]">
                            <span class="text-[26px] font-black tracking-[1px] text-[#101c2e] whitespace-nowrap">
                                {{ $plateNo }}
                            </span>
                        </div>
                    </div>
                </div>

                {{--  SECTION 5 - APPLICATION NUMBER (small, subdued —
                     secondary to the plate number). Currently disabled
                     per earlier direction; re-enable by uncommenting if
                     you want it back on the sticker. --}}
                {{--  <div class="absolute top-[323px] left-0 right-0 text-center">
                    <div class="text-[5.5px] font-bold uppercase tracking-[2px] text-[#6b7688] mb-[1px]">
                        Application No.
                    </div>
                    <div class="inline-block border border-[#c7d0dc] px-2 py-[1px] bg-white">
                        <span class="text-[10px] font-semibold tracking-[1px] text-[#3a4453] whitespace-nowrap">
                            {{ $stickerNo }}
                        </span>
                    </div>
                </div>  --}}

                {{--  SECTION 6 - SIGNATURE BLOCK  --}}
                <div class="absolute top-[368px] left-0 right-0 text-center px-8">
                    <div class="w-[150px] mx-auto mb-[3px]">
                        <div class="h-[1.5px] bg-[#0038a8]"></div>
                        <div class="h-[1px] bg-[#ce1126] mt-[1px]"></div>
                    </div>
                    <div class="text-[6.5px] font-bold uppercase tracking-[0.5px] text-[#101c2e] leading-[1.2]">
                        {{ $signatoryName }}
                    </div>
                    <div class="text-[7px] font-semibold uppercase tracking-[1px] text-[#a52d22] mt-[1px]">
                        {{ $signatoryTitle }}
                    </div>
                </div>

            </div>
        </div>
    </div>
</body>

</html>
