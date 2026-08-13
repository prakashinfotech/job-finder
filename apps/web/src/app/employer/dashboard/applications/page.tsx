'use client';

import { useEffect, useState, useCallback } from 'react';

const employerSessionKey = 'jobfinder-employer-session';

type AtsStage =
  | 'ALL'
  | 'APPLIED'
  | 'VIEWED'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'OFFER'
  | 'HIRED'
  | 'REJECTED';

type Applicant = {
  id: string;
  candidateName: string;
  candidatePhone: string;
  jobTitle: string;
  jobId: string;
  status: AtsStage;
  appliedAt: string;
  experience?: string;
  location?: string;
};

const STAGES: { key: AtsStage; label: string; color: string }[] = [
  { key: 'ALL', label: 'All', color: '#6b7280' },
  { key: 'APPLIED', label: 'New', color: '#3b82f6' },
  { key: 'VIEWED', label: 'Viewed', color: '#8b5cf6' },
  { key: 'SHORTLISTED', label: 'Shortlisted', color: '#f59e0b' },
  { key: 'INTERVIEW_SCHEDULED', label: 'Interview', color: '#06b6d4' },
  { key: 'OFFER', label: 'Offer', color: '#10b981' },
  { key: 'HIRED', label: 'Hired', color: '#1f8268' },
  { key: 'REJECTED', label: 'Rejected', color: '#ef4444' },
];

const NEXT_STAGE: Partial<Record<AtsStage, AtsStage>> = {
  APPLIED: 'SHORTLISTED',
  VIEWED: 'SHORTLISTED',
  SHORTLISTED: 'INTERVIEW_SCHEDULED',
  INTERVIEW_SCHEDULED: 'OFFER',
  OFFER: 'HIRED',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ApplicationsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [activeStage, setActiveStage] = useState<AtsStage>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadApplicants = useCallback(async () => {
    try {
      const res = await fetch('/api/employer/applications');
      if (res.ok) {
        const data = (await res.json()) as { applicants: Applicant[] };
        setApplicants(data.applicants);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const session = window.localStorage.getItem(employerSessionKey);
    if (!session) {
      window.location.href = '/employer/signin';
      return;
    }
    void loadApplicants();
  }, [loadApplicants]);

  async function updateStatus(applicationId: string, newStatus: AtsStage) {
    setUpdatingId(applicationId);
    try {
      const res = await fetch('/api/employer/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, status: newStatus }),
      });
      if (res.ok) {
        setApplicants((prev) =>
          prev.map((a) => (a.id === applicationId ? { ...a, status: newStatus } : a)),
        );
      }
    } catch {
      // silently fail
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = applicants.filter((a) => {
    const matchesStage = activeStage === 'ALL' || a.status === activeStage;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      a.candidateName.toLowerCase().includes(q) ||
      a.jobTitle.toLowerCase().includes(q) ||
      (a.location ?? '').toLowerCase().includes(q);
    return matchesStage && matchesSearch;
  });

  const stageCounts = STAGES.reduce<Record<string, number>>((acc, s) => {
    acc[s.key] = s.key === 'ALL' ? applicants.length : applicants.filter((a) => a.status === s.key).length;
    return acc;
  }, {});

  return (
    <main className="employer-dash-page">
      {/* Sidebar */}
      <aside className="employer-dash-sidebar">
        <div className="dash-sidebar-brand">
          <span className="dash-brand-text">JobFinder</span>
          <span className="dash-brand-sub">for employers</span>
        </div>
        <nav className="dash-sidebar-nav" aria-label="Employer dashboard navigation">
          <a className="dash-nav-item" href="/employer/dashboard">
            <span className="dash-nav-icon">📊</span>Dashboard
          </a>
          <a className="dash-nav-item" href="/employer/jobs/new">
            <span className="dash-nav-icon">➕</span>Post a Job
          </a>
          <a className="dash-nav-item is-active" href="/employer/dashboard/applications">
            <span className="dash-nav-icon">📋</span>Applications
          </a>
          <a className="dash-nav-item" href="/employer/dashboard/candidates">
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
            <h1 className="dash-page-title">Applications</h1>
            <p className="dash-page-sub">Manage your hiring pipeline</p>
          </div>
        </header>

        {/* ATS Stage tabs */}
        <div className="ats-stage-tabs" role="tablist" aria-label="Application stages">
          {STAGES.map((stage) => (
            <button
              aria-selected={activeStage === stage.key}
              className={`ats-stage-tab ${activeStage === stage.key ? 'is-active' : ''}`}
              key={stage.key}
              role="tab"
              style={activeStage === stage.key ? { borderBottomColor: stage.color, color: stage.color } : {}}
              type="button"
              onClick={() => setActiveStage(stage.key)}
            >
              {stage.label}
              <span className="ats-stage-count">{stageCounts[stage.key] ?? 0}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="ats-search-row">
          <input
            className="ats-search-input"
            placeholder="Search by candidate name, job title, or location…"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="dash-loading">Loading applications…</div>
        ) : filtered.length === 0 ? (
          <div className="dash-empty-state">
            <span className="dash-empty-icon">📭</span>
            <strong>No applications found</strong>
            <p>
              {activeStage === 'ALL'
                ? 'Post a job to start receiving applications.'
                : `No candidates in the "${STAGES.find((s) => s.key === activeStage)?.label}" stage.`}
            </p>
            {activeStage === 'ALL' && (
              <a className="primary-button" href="/employer/jobs/new">
                Post a job
              </a>
            )}
          </div>
        ) : (
          <div className="ats-applicant-list">
            {filtered.map((applicant) => {
              const nextStage = NEXT_STAGE[applicant.status];
              const nextStageLabel = nextStage
                ? STAGES.find((s) => s.key === nextStage)?.label
                : null;

              return (
                <div className="ats-applicant-card" key={applicant.id}>
                  <div className="ats-applicant-avatar" aria-hidden="true">
                    {applicant.candidateName.charAt(0).toUpperCase()}
                  </div>

                  <div className="ats-applicant-info">
                    <strong className="ats-applicant-name">{applicant.candidateName}</strong>
                    <span className="ats-applicant-meta">
                      {applicant.jobTitle}
                      {applicant.location ? ` · ${applicant.location}` : ''}
                      {applicant.experience ? ` · ${applicant.experience}` : ''}
                    </span>
                    <span className="ats-applicant-date">Applied {formatDate(applicant.appliedAt)}</span>
                  </div>

                  <div className="ats-applicant-stage">
                    <span
                      className="ats-stage-badge"
                      style={{
                        background: `${STAGES.find((s) => s.key === applicant.status)?.color}18`,
                        color: STAGES.find((s) => s.key === applicant.status)?.color,
                      }}
                    >
                      {STAGES.find((s) => s.key === applicant.status)?.label ?? applicant.status}
                    </span>
                  </div>

                  <div className="ats-applicant-actions">
                    {nextStageLabel && (
                      <button
                        className="ats-advance-btn"
                        disabled={updatingId === applicant.id}
                        type="button"
                        onClick={() => void updateStatus(applicant.id, nextStage!)}
                      >
                        {updatingId === applicant.id ? '…' : `Move to ${nextStageLabel}`}
                      </button>
                    )}
                    {applicant.status !== 'REJECTED' && applicant.status !== 'HIRED' && (
                      <button
                        className="ats-reject-btn"
                        disabled={updatingId === applicant.id}
                        type="button"
                        onClick={() => void updateStatus(applicant.id, 'REJECTED')}
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
