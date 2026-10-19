<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>New {{ $formType }} application</title>
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

                    <tr>
                        <td style="background:#e8f5ee;border-bottom:1px solid #1e8f5f;padding:22px 28px;">
                            <table role="presentation" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td valign="middle" style="padding-right:14px;">
                                        <div
                                            style="width:44px;height:44px;line-height:44px;border-radius:22px;background:#1e8f5f;color:#ffffff;text-align:center;font-size:24px;font-weight:700;">
                                            &#10003;</div>
                                    </td>
                                    <td valign="middle">
                                        <div
                                            style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#146341;">
                                            New Application</div>
                                        <div
                                            style="font-family:'Source Serif 4',Georgia,serif;font-size:20px;font-weight:700;color:#1c1f26;margin-top:2px;">
                                            A {{ $formType }} application was submitted</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:26px 28px 8px;font-size:15px;line-height:1.6;">
                            <p style="margin:0;">A new <strong>{{ $formType }}</strong> application is waiting for
                                review.</p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:16px 28px 8px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                                style="border:1px solid #d9dce1;border-left:5px solid #1e8f5f;border-radius:8px;background:#f7f7f5;">
                                <tr>
                                    <td style="padding:14px 18px;">
                                        <div
                                            style="font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#5b6270;">
                                            Reference No.</div>
                                        <div
                                            style="font-family:'Source Serif 4',Georgia,serif;font-size:24px;font-weight:700;letter-spacing:1px;color:#146341;margin:2px 0 10px;">
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
                                            @if ($applicantType)
                                                <tr>
                                                    <td style="padding:2px 18px 2px 0;color:#5b6270;">Classification
                                                    </td>
                                                    <td style="padding:2px 0;font-weight:600;">{{ $applicantType }}</td>
                                                </tr>
                                            @endif
                                            @if ($applicantEmail)
                                                <tr>
                                                    <td style="padding:2px 18px 2px 0;color:#5b6270;">Email</td>
                                                    <td style="padding:2px 0;font-weight:600;">{{ $applicantEmail }}
                                                    </td>
                                                </tr>
                                            @endif
                                            @if ($contactNumber)
                                                <tr>
                                                    <td style="padding:2px 18px 2px 0;color:#5b6270;">Contact No.</td>
                                                    <td style="padding:2px 0;font-weight:600;">{{ $contactNumber }}</td>
                                                </tr>
                                            @endif
                                            <tr>
                                                <td style="padding:2px 18px 2px 0;color:#5b6270;">Submitted</td>
                                                <td style="padding:2px 0;font-weight:600;">
                                                    {{ now()->format('M d, Y h:i A') }}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:20px 28px 26px;">
                            <div
                                style="border-top:1px solid #d9dce1;padding-top:14px;font-size:12px;line-height:1.5;color:#5b6270;">
                                This is an automated message. Log in to the admin panel to review the application.
                            </div>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>

</html>
