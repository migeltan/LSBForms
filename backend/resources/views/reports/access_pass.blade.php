<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Access Pass ID — {{ $applicant->full_name }}</title>
    <script src="https://cdn.tailwindcss.com"></script>

    {{-- Tailwind-driven version. If this is compiled through your normal
         Tailwind build (content-scanned at build time), make sure this
         file's path is included in `content` in tailwind.config.js, and
         that any arbitrary-value classes used below (w-[380px], top-[40px],
         etc.) are either used literally here (so the JIT scanner picks
         them up) or added to a safelist — otherwise they'll silently emit
         no CSS, same failure mode as the note in the previous version. --}}
    @if ($forPdf)
        <style>
            {!! $assets['compiledCss'] !!}
        </style>
    @else
        <link rel="stylesheet" href="{{ asset('css/id-cards-compiled.css') }}">
    @endif

    <style>
        /* Physical PDF page size: standard CR80/ID-1 card, portrait,
           2.125in x 3.375in (54mm x 85.6mm) — same size as a credit
           card. At 96dpi that's 204x324 CSS px, matching
           PdfGeneratorService::PAGE_WIDTH_PX / PAGE_HEIGHT_PX exactly,
           so the PDF page itself is the correct physical size at 100%
           print scale (no "fit to page" needed). */
        @page {
            size: 204px 324px;
            margin: 0;
        }

        .bg-logo-wrap {
            position: absolute;
            top: 190px;
            left: 32px;
            width: 16rem;
            /* matches w-64 */
            height: 16rem;
            /* matches h-64 */
            pointer-events: none;
            user-select: none;
        }

        .bg-logo-shine {
            position: absolute;
            inset: 0;
            -webkit-mask-image: var(--bg-logo-mask);
            mask-image: var(--bg-logo-mask);
            -webkit-mask-size: contain;
            mask-size: contain;
            -webkit-mask-repeat: no-repeat;
            mask-repeat: no-repeat;
            -webkit-mask-position: center;
            mask-position: center;

            background: linear-gradient(100deg,
                    transparent 30%,
                    rgba(255, 255, 255, 0.9) 48%,
                    rgba(255, 255, 255, 0.9) 52%,
                    transparent 70%);
            background-size: 300% 100%;
            background-position: 150% 0;
            mix-blend-mode: screen;
            animation: bgLogoShine 3.5s ease-in-out infinite;
        }

        @keyframes bgLogoShine {
            0% {
                background-position: 150% 0;
            }

            60% {
                background-position: -50% 0;
            }

            100% {
                background-position: -50% 0;
            }
        }
    </style>
</head>

<body class="p-0 m-0 font-sans bg-slate-300">

    @php
        $philippineLogoSrc = $forPdf ? $assets['philippineLogo'] : asset('images/Philippine_Logo.webp');
        $access_congressLogoSrc = $forPdf ? $assets['access_congressLogo'] : asset('images/20_Congress_Logo3.png');
        $hrLogoSrc = $forPdf ? $assets['hrLogo'] : asset('images/House_of_Representatives_Logo.svg');
        $sunflag = $forPdf ? $assets['sunflag'] : asset('images/sunflag.png');
        $photoPath = $application->photo_path ?? null;
        $photoStyle = '';
        $bgLogoOpacity = 0.09;

        if ($photoPath) {
            $photoUrl = $forPdf ? $assets['applicantPhoto'] : asset('storage/' . $photoPath);
            $photoStyle = "background-image:url('{$photoUrl}');";
        }

        $designWidth = 380;
        $designHeight = 600;
        $pageWidth = 204;
        $pageHeight = 324;
        $scaleX = $pageWidth / $designWidth;
        $scaleY = $pageHeight / $designHeight;

        // $qrSize is passed in from PdfGeneratorService — it's the pixel
        // size the QR PNG was actually generated at (see
        // QrCodeService::generateDataUri). The box below is sized to
        // match it directly, at design-canvas scale, so this view stays
        // in sync with whatever size the controller/report requested
        // without a second hardcoded number living here.
        $qrBoxSize = $qrSize ?? 126;
    @endphp

    {{-- True physical render canvas — exactly the CR80 card size
         (204x324px = 2.125in x 3.375in), matching
         PdfGeneratorService::PAGE_WIDTH_PX / PAGE_HEIGHT_PX. --}}
    <div class="relative mx-auto overflow-hidden" style="width:{{ $pageWidth }}px;height:{{ $pageHeight }}px;">

        {{-- Original 380x600 design canvas, scaled down to fit the
             204x324 physical page. transform-origin stays top-left so
             the scale maps (0,0)-(380,600) onto (0,0)-(204,324)
             directly. --}}
        <div class="absolute top-0 left-0 origin-top-left"
            style="width:{{ $designWidth }}px;height:{{ $designHeight }}px;transform:scale({{ $scaleX }}, {{ $scaleY }});">

            <div class="relative w-[380px] h-[600px] mx-auto overflow-hidden">
                <div
                    class="absolute top-[40px] left-[30px] w-[320px] h-[520px] rounded-[10px] overflow-hidden bg-white border border-[#c7d0dc] shadow-[0_10px_26px_rgba(15,35,65,0.28)]">

                    {{--  BACKGROUND LOGO WATERMARK (with shine effect)  --}}
                    <div class="bg-logo-wrap" style="opacity:{{ $bgLogoOpacity }};">
                        <img src="{{ $philippineLogoSrc }}" alt=""
                            class="absolute inset-0 w-full h-full pointer-events-none select-none">
                        <div class="bg-logo-shine" style="--bg-logo-mask: url('{{ $philippineLogoSrc }}');"></div>
                    </div>


                    {{--  SECTION 2 - HEADER    --}}
                    <div
                        class="relative px-[5px] pt-[4px] pb-[1px] text-center bg-gradient-to-br from-[#142a4a] via-[#1e3a5f] to-[#274a73]">
                        <div class="flex items-center justify-center w-full h-[60px]">
                            <img src="{{ $access_congressLogoSrc }}" alt="20th Congress"
                                class="h-[74px] w-auto inline-block object-contain">
                        </div>
                        <div class="text-[9px] font-extrabold uppercase tracking-[1.5px] text-white">
                            Republic of the Philippines
                        </div>
                        <div class="text-[7.5px] font-semibold uppercase tracking-[1.5px] text-[#c9d6e8]">
                            House of Representatives &middot; 20th Congress
                        </div>
                    </div>
                    <div class="relative bg-[#a52d22] text-center py-[5px]">
                        <span class="text-[12px] font-extrabold uppercase tracking-[3px] text-white">Access Pass</span>
                    </div>


                    {{--  SECTION 3 - APPLICANT INFORMATION  --}}
                    <section class="relative px-4 py-3.5">

                        {{-- Container 3.1 Profile and QR --}}
                        <div class="flex items-start justify-between w-auto h-auto gap-3 p-2">
                            {{--  Profile Box  --}}
                            <div class="w-[104px] h-[128px] rounded-md bg-[#eef1f5] border border-[#1e3a5f] bg-cover bg-center bg-no-repeat inline-block align-top overflow-hidden text-center leading-[128px] text-[8px] text-[#9fb0c3]"
                                style="{{ $photoStyle }}">
                                @unless ($photoPath)
                                    NO PHOTO
                                @endunless
                            </div>

                            {{--  QR Box --}}
                            {{--  border-[#1e3a5f]  --}}
                            <div class="flex items-center justify-center overflow-hidden bg-white border-2 border-black rounded-md"
                                style="width:{{ $qrBoxSize }}px;height:{{ $qrBoxSize }}px;">
                                <img src="{{ $qrCode }}" alt="QR code for {{ $applicant->application_id }}"
                                    class="object-contain w-full h-full">
                            </div>
                        </div>

                        {{-- Container 3.2 General Informations --}}
                        <div class="flex w-full ml-3 align-top">
                            {{--  ID NO.  --}}
                            <div class="flex-row w-1/2 h-auto">
                                <div class="text-[6.5px] font-bold uppercase tracking-[1.5px] text-[#8a97a8]">ID No.
                                </div>
                                <div class="text-[13px] font-extrabold tracking-[1px] text-[#a52d22] mb-2">
                                    {{ $applicant->application_id }}
                                </div>
                            </div>

                            {{--  APPLICATION TYPE.  --}}
                            <div class="flex-row w-1/2 h-auto">
                                <div class="text-[6.5px] font-bold uppercase tracking-[1.5px] text-[#8a97a8]">Type</div>
                                <div
                                    class="inline-block text-[7.5px] font-bold uppercase tracking-[1px] text-white bg-[#1e3a5f] px-2 py-0.5 rounded mb-2">
                                    {{ $applicant->applicant_type ?? 'Applicant' }}
                                </div>
                            </div>
                        </div>

                        {{-- Container 3.3 Personal Informations --}}
                        <div class="flex-row w-full ml-3 align-top">
                            {{--  FULL NAME.  --}}
                            <div class="flex-row w-full h-auto pr-6">
                                <div class="text-[6.5px] font-bold uppercase tracking-[1.5px] text-[#8a97a8]">Full Name
                                </div>
                                <div
                                    class="text-[15px] font-extrabold text-[#101c2e] leading-[1.2] pb-1.5 mb-2.5 border-b border-dotted border-[#c7d0dc]">
                                    {{ strtoupper($applicant->full_name) }}
                                </div>
                            </div>

                            {{--  CONTACT NO.  --}}
                            <div class="flex-row w-full h-auto pr-6">
                                <div class="text-[6.5px] font-bold uppercase tracking-[1.5px] text-[#8a97a8]">Contact
                                    No.</div>
                                <div
                                    class="text-[9px] text-[#2b3646] leading-[1.35] pb-1.5 border-b border-dotted border-[#c7d0dc]">
                                    {{ $applicant->contact_number ?? '—' }}
                                </div>
                            </div>
                        </div>

                        {{-- Container 3.4 Applicant Signature --}}
                        <div class="relative px-4 mt-6 text-center">
                            <div class="w-[160px] mx-auto border-t border-[#8a97a8]"></div>
                            <div class="text-[6.5px] font-semibold uppercase tracking-[1.5px] text-[#8a97a8] mt-[3px]">
                                Signature over Printed Name
                            </div>
                        </div>

                    </section>


                    {{--  SECTION 4 - FOOTER INFO  --}}
                    <div class="flex w-auto h-auto">
                        {{--  Container 4.1 = Footer Info  --}}
                        <div
                            class="absolute bottom-[54px] left-3.5 right-3.5 text-center text-[6px] font-semibold uppercase tracking-[1px] text-[#5a6b7d] pb-[3px] border-b border-[#c7d0dc]">
                            Non-transferable &middot; Property of the House of Representatives
                        </div>
                    </div>


                    {{--  <div
                        class="absolute bottom-[22px] left-1/2 -ml-[14px] w-12 h-12 rounded-full bg-white border-2 border-[#d8ae3d] shadow-[0_1px_4px_rgba(16,28,46,0.4)] p-px">
                        <img src="{{ $sunflag }}" alt="" class="block w-full h-full rounded-full">
                    </div>  --}}

                    {{--  SECTION 5 - FOOTER DESIGN  --}}
                    <div
                        class="absolute bottom-0 left-0 right-0 h-[34px] flex items-center justify-center bg-gradient-to-br from-[#142a4a] via-[#1e3a5f] to-[#274a73] border-t-2 border-[#d8ae3d]">
                        @for ($i = 0; $i < 7; $i++)
                            <span
                                class="inline-block w-[7px] h-[7px] mx-[7px] border border-[#d8ae3d] rotate-45"></span>
                        @endfor
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>

</html>
