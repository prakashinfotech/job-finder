'use client';

import { useEffect, useState, useCallback } from 'react';

const employerSessionKey = 'jobfinder-employer-session';

type Candidate = {
  id: string;
  name: string;
  phone: string;
  location?: string;
  experienceYears?: number;
  skills: string[];
  salaryExpectation?: number;
  resumeUrl?: string;
  profileCompletion: number;
};

type Filters = {
  query: string;
  location: string;
  experienceMin: string;
  experienceMax: string;
  salaryMax: string;
};

const initialFilters: Filters = {
  query: '',
  location: '',
  experienceMin: '',
  experienceMax: '',
  salaryMax: '',
};

function CandidateCard({
  candidate,
  onOutreach,
}: {
  candidate: Candidate;
  onOutreach: (id: string) => void;
}) {
  return (
    <div className="candidate-card">
      <div className="candidate-card-avatar" aria-hidden="true">
        {candidate.name.charAt(0).toUpperCase()}
      </div>

      <div className="candidate-card-body">
        <div className="candidate-card-header">
          <div>
            <strong className="candidate-name">{candidate.name}</strong>
            {candidate.location ? (
              <span className="candidate-location">📍 {candidate.location}</span>
            ) : null}
          </div>
          <div className="candidate-completion">
            <span
              className="completion-bar"
              style={{ '--pct': `${candidate.profileCompletion}%` } as React.CSSProperties}
              aria-label={`Profile ${candidate.profileCompletion}% complete`}
            />
            <span className="completion-label">{candidate.profileCompletion}% profile</span>
          </div>
        </div>

        <div className="candidate-meta-row">
          {candidate.experienceYears !== undefined && (
            <span className="candidate-chip">
              {candidate.experienceYears === 0 ? 'Fresher' : `${candidate.experienceYears} yr exp`}
            </span>
          )}
          {candidate.salaryExpectation ? (
            <span className="candidate-chip">
              ₹{(candidate.salaryExpectation / 1000).toFixed(0)}k/mo expected
            </span>
          ) : null}
        </div>

        {candidate.skills.length > 0 && (
          <div className="candidate-skills">
            {candidate.skills.slice(0, 5).map((skill) => (
              <span className="candidate-skill-tag" key={skill}>
                {skill}
              </span>
            ))}
            {candidate.skills.length > 5 && (
              <span className="candidate-skill-more">+{candidate.skills.length - 5} more</span>
            )}
          </div>
        )}
      </div>

      <div className="candidate-card-actions">
        {candidate.resumeUrl ? (
          <a
            className="secondary-button candidate-resume-btn"
            href={candidate.resumeUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            View resume
          </a>
        ) : null}
        <button
          className="primary-button candidate-outreach-btn"
          type="button"
          onClick={() => onOutreach(candidate.id)}
        >
          Reach out
        </button>
      </div>
    </div>
  );
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [outreachId, setOutreachId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const session = window.localStorage.getItem(employerSessionKey);
    if (!session) {
      window.location.href = '/employer/signin';
    }
  }, []);

  const search = useCallback(async () => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (filters.query) params.set('q', filters.query);
      if (filters.location) params.set('location', filters.location);
      if (filters.experienceMin) params.set('expMin', filters.experienceMin);
      if (filters.experienceMax) params.set('expMax', filters.experienceMax);
      if (filters.salaryMax) params.set('salaryMax', filters.salaryMax);

      const res = await fetch(`/api/employer/candidates?${params.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as { candidates: Candidate[] };
        setCandidates(data.candidates);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  function handleOutreach(candidateId: string) {
    setOutreachId(candidateId);
    // In a real app this would open a messaging modal or trigger WhatsApp/email
    setTimeout(() => setOutreachId(null), 2000);
  }

  function updateFilter(key: keyof Filters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <main className="employer-dash-page">
      {/* Sidebar */}
      <aside className="employer-dash-sidebar">
        <div className="dash-sidebar-brand">
          <span className="dash-brand-text">jobfinder</span>
          <span className="dash-brand-sub">for employers</span>
        </div>
        <nav className="dash-sidebar-nav" aria-label="Employer dashboard navigation">
          <a className="dash-nav-item" href="/employer/dashboard">
            <span className="dash-nav-icon">📊</span>Dashboard
          </a>
          <a className="dash-nav-item" href="/employer/jobs/new">
            <span className="dash-nav-icon">➕</span>Post a Job
          </a>
          <a className="dash-nav-item" href="/employer/dashboard/applications">
            <span className="dash-nav-icon">📋</span>Applications
          </a>
          <a className="dash-nav-item is-active" href="/employer/dashboard/candidates">
            <span className="dash-nav-icon">🔍</span>Find Candidates
          </a>
          <a className="dash-nav-item" href="/employer/dashboard/analytics">
            <span className="dash-nav-icon">📈</span>Analytics
          </a>
          <a className="dash-nav-item" href="/employer/onboarding">
            <span className="dash-nav-icon">🏢</span>Company Profile
          </a>
        </nav>
        <div className="dash-sidebar-footer">
          <a className="dash-nav-item" href="/employer">
            <span className="dash-nav-icon">←</span>Back to home
          </a>
        </div>
      </aside>

      <div className="employer-dash-main">
        <header className="dash-topbar">
          <div>
            <h1 className="dash-page-title">Find Candidates</h1>
            <p className="dash-page-sub">Search our database of job seekers</p>
          </div>
        </header>

        {/* Search & Filters */}
        <div className="candidate-search-panel">
          <div className="candidate-search-row">
            <input
              className="candidate-search-input"
              placeholder="Search by name, skill, or role…"
              type="search"
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void search()}
            />
            <button
              className="primary-button candidate-search-btn"
              disabled={isLoading}
              type="button"
              onClick={() => void search()}
            >
              {isLoading ? 'Searching…' : 'Search'}
            </button>
          </div>

          <div className="candidate-filter-row">
            <label>
              City / Location
              <input
                placeholder="e.g. Bengaluru"
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
              />
            </label>
            <label>
              Min experience (yrs)
              <input
                min={0}
                placeholder="0"
                type="number"
                value={filters.experienceMin}
                onChange={(e) => updateFilter('experienceMin', e.target.value)}
              />
            </label>
            <label>
              Max experience (yrs)
              <input
                min={0}
                placeholder="10"
                type="number"
                value={filters.experienceMax}
                onChange={(e) => updateFilter('experienceMax', e.target.value)}
              />
            </label>
            <label>
              Max salary (₹/mo)
              <input
                min={0}
                placeholder="50000"
                type="number"
                value={filters.salaryMax}
                onChange={(e) => updateFilter('salaryMax', e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* Results */}
        {!hasSearched ? (
          <div className="candidate-search-prompt">
            <span className="candidate-search-prompt-icon">🔍</span>
            <strong>Search our candidate database</strong>
            <p>
              Use the filters above to find candidates matching your requirements. You can search by
              skills, location, experience, and salary expectations.
            </p>
            <div className="candidate-search-tips">
              <span>💡 Try searching for "Sales", "Customer Support", or "Delivery"</span>
            </div>
          </div>
        ) : isLoading ? (
          <div className="dash-loading">Searching candidates…</div>
        ) : candidates.length === 0 ? (
          <div className="dash-empty-state">
            <span className="dash-empty-icon">🔍</span>
            <strong>No candidates found</strong>
            <p>Try adjusting your filters or broadening your search.</p>
          </div>
        ) : (
          <>
            <p className="candidate-results-count">
              Found <strong>{candidates.length}</strong> candidate{candidates.length !== 1 ? 's' : ''}
            </p>
            <div className="candidate-results-list">
              {candidates.map((candidate) => (
                <CandidateCard
                  candidate={candidate}
                  key={candidate.id}
                  onOutreach={handleOutreach}
                />
              ))}
            </div>
          </>
        )}

        {outreachId ? (
          <div className="outreach-toast" role="status">
            ✅ Outreach initiated — candidate will be notified via WhatsApp & email.
          </div>
        ) : null}
      </div>
    </main>
  );
}
