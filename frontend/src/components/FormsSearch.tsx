// src/components/FormsSearch.tsx
import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { searchForms } from "../data/forms";

/**
 * Landing-page "search for application" bar. Matches the query against
 * the shared forms registry and redirects to the matching form — either
 * when the user picks a result, or presses Enter with exactly one/first
 * match available.
 */
export function FormsSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();

  const results = searchForms(query);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function goTo(href: string) {
    setIsOpen(false);
    setQuery("");
    navigate(href);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (results.length > 0) {
      goTo(results[0].href);
    }
  }

  return (
    <div className="forms-search" ref={wrapRef}>
      <form className="forms-search-bar" onSubmit={handleSubmit} role="search">
        <Search className="forms-search-icon" size={18} aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query && setIsOpen(true)}
          placeholder="Search for application..."
          aria-label="Search for an application form"
          role="combobox"
          aria-expanded={isOpen && query.length > 0}
          aria-controls={listboxId}
          autoComplete="off"
        />
      </form>

      {isOpen && query.trim().length > 0 && (
        <ul id={listboxId} role="listbox" className="forms-search-results">
          {results.length > 0 ? (
            results.map((form) => (
              <li key={form.id} role="option" aria-selected="false">
                <button
                  type="button"
                  className="forms-search-result"
                  onClick={() => goTo(form.href)}
                >
                  <span className="forms-search-result-title">
                    {form.title}
                  </span>
                  <span className="forms-search-result-summary">
                    {form.summary}
                  </span>
                </button>
              </li>
            ))
          ) : (
            <li className="forms-search-empty">No matching forms found.</li>
          )}
        </ul>
      )}
    </div>
  );
}
