import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="form-section-card corner-accent-red text-center">
      <h2>Page not found</h2>
      <p className="text-[var(--smart-muted)]">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-govt-primary">
        Back to Home
      </Link>
    </div>
  );
}
