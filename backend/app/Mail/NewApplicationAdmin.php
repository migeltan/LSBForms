<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class NewApplicationAdmin extends Mailable
{
    public function __construct(
        public string $applicantName,
        public string $referenceNumber,
        public string $formType,      // 'Access Pass' | 'Vehicle Sticker'
        public ?string $applicantType = null,
        public ?string $applicantEmail = null,
        public ?string $contactNumber = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "New {$this->formType} application ({$this->referenceNumber})",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.new-application-admin');
    }
}