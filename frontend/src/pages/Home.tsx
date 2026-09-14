// Home.tsx
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function Home() {
  return (
    <>
      <div className="hero-govt">
        <span className="hero-corner-shape" aria-hidden="true" />
        <div className="hero-govt-inner">
          <div className="hero-logo-badge" aria-hidden="true">
            <img
              src={`${API_URL}/images/House_of_Representatives_Logo.png`}
              alt=""
              className="hero-logo-img"
            />
          </div>
          <div className="hero-govt-text">
            <div className="eyebrow">
              Internal Security Group &middot; Prototype Portal
            </div>
            <h1>Digital Access Pass and Vehicle Sticker Application Portal</h1>
            <p className="lead">
              Apply for an access pass or vehicle sticker online, upload your
              supporting documents, and track your application status &mdash;
              without needing to queue in person for every step.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-10 sm:grid-cols-2">
        <div className="app-choice-card corner-accent-blue">
          <div className="card-index">01&nbsp;&nbsp;APPLICATION TYPE</div>
          <h3>Access Pass Application</h3>
          <p>
            For personnel &mdash; plantilla, non-plantilla, or consultant
            &mdash; applying for an internal access pass / ID.
          </p>
          <Link
            to="/access-pass"
            className="block btn btn-govt-primary sm:inline-block"
          >
            Start Access Pass Application
          </Link>
        </div>

        <div className="app-choice-card corner-accent-red">
          <div className="card-index">02&nbsp;&nbsp;APPLICATION TYPE</div>
          <h3>Vehicle Sticker Application</h3>
          <p>
            For personnel applying for a vehicle sticker to bring a private
            vehicle onto the premises.
          </p>
          <Link
            to="/vehicle-sticker"
            className="block btn btn-govt-primary sm:inline-block"
          >
            Start Vehicle Sticker Application
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-full form-section-card corner-accent-yellow">
          <div className="section-label">Already Applied?</div>
          <h2 style={{ fontSize: "1.1rem" }}>Check Application Status</h2>
          <p className="text-sm text-[var(--smart-muted)]">
            Enter your application reference number to see where your
            application stands.
          </p>
          <Link
            to="/status"
            className="block btn btn-govt-outline btn-sm sm:inline-block"
          >
            Check Status
          </Link>
        </div>

        <div className="h-full form-section-card corner-accent-blue">
          <div className="section-label">Before You Begin</div>
          <h2 style={{ fontSize: "1.1rem" }}>Instructions</h2>
          <ul className="mb-0 list-disc space-y-1 pl-4 text-sm text-[var(--smart-muted)]">
            <li>
              Prepare clear scans or photos of your documents (JPG, PNG, or
              PDF).
            </li>
            <li>
              Have a recent 2x2 photo ready for the access pass application.
            </li>
            <li>
              Applications are reviewed by Internal Security Group personnel
              &mdash; submitting does not mean automatic approval.
            </li>
            <li>[OFFICIAL PROCESSING TIME TO BE CONFIRMED]</li>
          </ul>
        </div>

        <div className="h-full form-section-card corner-accent-red">
          <div className="section-label">Required Documents</div>
          <h2 style={{ fontSize: "1.1rem" }}>Typical Requirements</h2>
          <ul className="mb-0 list-disc space-y-1 pl-4 text-sm text-[var(--smart-muted)]">
            <li>Letter request addressed to the Sergeant-at-Arms</li>
            <li>Two (2) copies of a valid ID</li>
            <li>NBI Clearance (non-plantilla applicants)</li>
            <li>Contract of Consultancy (consultant applicants)</li>
            <li>OR/CR, and Deed of Sale if applicable (vehicle sticker)</li>
          </ul>
          <p className="mb-0 mt-2 text-sm text-[var(--smart-muted)]">
            [OFFICIAL DOCUMENT REQUIREMENT LIST TO BE CONFIRMED]
          </p>
        </div>
      </div>

      <div className="mt-4 form-section-card corner-accent-yellow">
        <div className="section-label">Need Help?</div>
        <h2 style={{ fontSize: "1.1rem" }}>Contact / Inquiries</h2>
        <p className="mb-0 text-sm text-[var(--smart-muted)]">
          [OFFICIAL CONTACT INFORMATION TO BE PROVIDED BY THE INTERNAL SECURITY
          GROUP]
        </p>
      </div>
    </>
  );
}
