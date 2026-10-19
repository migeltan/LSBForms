@php
    // Theme: SMART portal (navy header + gold rule). Green = submitted/approved, red = rejected, gold = returned.
    $theme = match ($event) {
        'submitted' => [
            'accent' => '#1e8f5f',
            'dark' => '#146341',
            'light' => '#e8f5ee',
            'icon' => '&#10003;',
            'label' => 'Application Submitted',
            'headline' => 'We received your application',
        ],
        'Approved' => [
            'accent' => '#1e8f5f',
            'dark' => '#146341',
            'light' => '#e8f5ee',
            'icon' => '&#10003;',
            'label' => 'Approved',
            'headline' => 'Your application was approved',
        ],
        'Rejected' => [
            'accent' => '#ef3b4c',
            'dark' => '#a4212d',
            'light' => '#fdecee',
            'icon' => '&#10005;',
            'label' => 'Not Approved',
            'headline' => 'Your application was not approved',
        ],
        default => [
            'accent' => '#f5b400',
            'dark' => '#8a6d1d',
            'light' => '#fff8e1',
            'icon' => '!',
            'label' => 'Action Needed',
            'headline' => 'Your application needs corrections',
        ],
    };
@endphp
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $theme['headline'] }}</title>
    <link
        href="https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=Source+Serif+4:wght@600;700&family=Source+Sans+3:wght@400;600;700&display=swap"
        rel="stylesheet">
</head>

<body style="margin:0;padding:0;background:#f7f7f5;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
        style="background:#f7f7f5;padding:24px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0"
                    style="width:100%;max-width:600px;background:#ffffff;border:1px solid #d9dce1;border-radius:10px;overflow:hidden;font-family:'Source Sans 3',Arial,Helvetica,sans-serif;color:#1c1f26;">

                    {{-- Header: navy with gold rule, like the portal --}}
                    <tr>
                        <td style="background:#15304f;padding:22px 28px;border-bottom:4px solid #f5b400;">
                            <div
                                style="font-family:'UnifrakturMaguntia','Old English Text MT',Georgia,serif;font-size:26px;line-height:1.1;color:#ffffff;">
                                House of Representatives</div>
                            <div
                                style="font-family:'Source Serif 4',Georgia,serif;font-size:15px;font-weight:700;color:#ffffff;margin-top:6px;">
                                Legislative Security Bureau</div>
                            <div style="font-size:12px;color:#c9d6e8;margin-top:2px;">Internal Security Group</div>
                        </td>
                    </tr>

                    {{-- Status banner --}}
                    <tr>
                        <td
                            style="background:{{ $theme['light'] }};border-bottom:1px solid {{ $theme['accent'] }};padding:22px 28px;">
                            <table role="presentation" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td valign="middle" style="padding-right:14px;">
                                        <div
                                            style="width:44px;height:44px;line-height:44px;border-radius:22px;background:{{ $theme['accent'] }};color:#ffffff;text-align:center;font-size:24px;font-weight:700;">
                                            {!! $theme['icon'] !!}</div>
                                    </td>
                                    <td valign="middle">
                                        <div
                                            style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:{{ $theme['dark'] }};">
                                            {{ $theme['label'] }}</div>
                                        <div
                                            style="font-family:'Source Serif 4',Georgia,serif;font-size:20px;font-weight:700;color:#1c1f26;margin-top:2px;">
                                            {{ $theme['headline'] }}</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- Body --}}
                    <tr>
                        <td style="padding:26px 28px 8px;font-size:15px;line-height:1.6;">
                            <p style="margin:0 0 14px;">Hello <strong>{{ $applicantName }}</strong>,</p>

                            @if ($event === 'submitted')
                                <p style="margin:0;">We received your <strong>{{ $formType }}</strong> application.
                                    Keep your reference number below, you will need it to check your application status.
                                </p>
                            @elseif ($event === 'Approved')
                                <p style="margin:0;">Good news. Your <strong>{{ $formType }}</strong> application
                                    has been <strong style="color:{{ $theme['dark'] }};">approved</strong>.</p>
                            @elseif ($event === 'Rejected')
                                <p style="margin:0;">We reviewed your <strong>{{ $formType }}</strong> application
                                    and it was <strong style="color:{{ $theme['dark'] }};">not approved</strong>.</p>
                            @else
                                <p style="margin:0;">Your <strong>{{ $formType }}</strong> application needs
                                    <strong style="color:{{ $theme['dark'] }};">corrections or a retake</strong> before
                                    we can continue. Please see the notes below.</p>
                            @endif
                        </td>
                    </tr>

                    {{-- Details card --}}
                    <tr>
                        <td style="padding:16px 28px 8px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                                style="border:1px solid #d9dce1;border-left:5px solid {{ $theme['accent'] }};border-radius:8px;background:#f7f7f5;">
                                <tr>
                                    <td style="padding:14px 18px;">
                                        <div
                                            style="font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#5b6270;">
                                            Reference No.</div>
                                        <div
                                            style="font-family:'Source Serif 4',Georgia,serif;font-size:24px;font-weight:700;letter-spacing:1px;color:{{ $theme['dark'] }};margin:2px 0 10px;">
                                            {{ $referenceNumber }}</div>

                                        <table role="presentation" cellpadding="0" cellspacing="0"
                                            style="font-size:14px;">
                                            <tr>
                                                <td style="padding:2px 18px 2px 0;color:#5b6270;">Application</td>
                                                <td style="padding:2px 0;font-weight:600;">{{ $formType }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:2px 18px 2px 0;color:#5b6270;">Applicant</td>
                                                <td style="padding:2px 0;font-weight:600;">{{ $applicantName }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:2px 18px 2px 0;color:#5b6270;">Status</td>
                                                <td style="padding:2px 0;">
                                                    <span
                                                        style="display:inline-block;background:{{ $theme['accent'] }};color:#ffffff;font-size:12px;font-weight:700;padding:2px 10px;border-radius:999px;">{{ $theme['label'] }}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- Reviewer remarks --}}
                    @if ($remarks && $event !== 'submitted')
                        <tr>
                            <td style="padding:8px 28px 8px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                                    style="background:{{ $theme['light'] }};border:1px solid {{ $theme['accent'] }};border-radius:8px;">
                                    <tr>
                                        <td style="padding:12px 16px;font-size:14px;line-height:1.55;">
                                            <div
                                                style="font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:{{ $theme['dark'] }};margin-bottom:4px;">
                                                Reviewer remarks</div>
                                            {!! nl2br(e($remarks)) !!}
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    @endif

                    {{-- Footer --}}
                    <tr>
                        <td style="padding:20px 28px 26px;">
                            <div
                                style="border-top:1px solid #d9dce1;padding-top:14px;font-size:12px;line-height:1.5;color:#5b6270;">
                                This is an automated message from the Legislative Security Bureau. Please do not reply
                                to this email.
                            </div>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>

</html>
