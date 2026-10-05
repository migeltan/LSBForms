// src/components/ContactSection.tsx
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const CONTACT_TILES = [
  {
    icon: MapPin,
    label: "Office Address",
    value:
      "Legislative Security Building, Clearance Branch, House of Representatives Complex, Constitution Hills, Batasan Hills, Quezon City",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "Trunkline: 8931-5001, Local: 7544, 7448",
  },
  {
    icon: Mail,
    label: "Email",
    value: "isgclearance@gmail.com",
  },
  {
    icon: Clock,
    label: "Office Hours",
    value: "Monday to Thursday, 8:00 AM to 7:00 PM",
  },
];

export function ContactSection() {
  return (
    <div className="contact-section form-section-card landing-card corner-accent-yellow">
      <div className="section-label">Need Help?</div>
      <h2>Contact / Inquiries</h2>
      <p className="mb-0 text-[var(--smart-muted)]">
        Reach the Internal Security Group directly for questions about your
        application.
      </p>

      <div className="contact-grid">
        {CONTACT_TILES.map(({ icon: Icon, label, value }) => (
          <div className="contact-tile" key={label}>
            <span className="contact-tile-icon" aria-hidden="true">
              <Icon size={18} />
            </span>
            <div>
              <div className="contact-tile-label">{label}</div>
              <div className="contact-tile-value">{value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
