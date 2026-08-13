'use client';

import { useEffect, useState } from 'react';

const employerSessionKey = 'jobfinder-employer-session';

type DashboardStats = {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  newApplications: number;
  shortlisted: number;
  hired: number;
};

type RecentJob = {
  id: string;
  title: string;
  location: string;
  openings: number;
  applicationCount: number;
  status: string;
  createdAt: string;
};

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number | string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="dash-stat-card" style={{ borderTopColor: color }}>
      <span className="dash-stat-label">{label}</span>
      <strong className="dash-stat-value">{value}</strong>
      {sub ? <span className="dash-stat-sub">{sub}</span> : null}
    </div>
  );
}

export default function EmployerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const session = window.localStorage.getItem(employerSessionKey);
    if (!session) {
      window.location.href = '/employer/signin';
      return;
    }
    setHasSession(true);

    async function loadDashboard() {
      try {
        const res = await fetch('/api/employer/dashboard');
        if (res.ok) {
          const data = (await res.json()) as { stats: DashboardStats; recentJobs: RecentJob[] };
          setStats(data.stats);
          setRecentJobs(data.recentJobs);
        }
      } catch {
        // silently fail — show empty state
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  if (!hasSession) return null;

  return (
    <main className="employer-dash-page">
      {/* Sidebar */}
      <aside className="employer-dash-sidebar">
        <div className="dash-sidebar-brand">
          <span className="dash-brand-text">JobFinder</span>
          <span className="dash-brand-sub">for employers</span>
        </div>

        <nav className="dash-sidebar-nav" aria-label="Employer dashboard navigation">
          <a className="dash-nav-item is-active" href="/employer/dashboard">
            <span className="dash-nav-icon">📊</span>
            Dashboard
          </a>
          <a className="dash-nav-item" href="/employer/jobs/new">
            <span className="dash-nav-icon">➕</span>
            Post a Job
          </a>
          <a className="dash-nav-item" href="/employer/dashboard/applications">
            <span className="dash-nav-icon">📋</span>
            Applications
          </a>
          <a className="dash-nav-item" href="/employer/dashboard/candidates">
            <span className="dash-nav-icon">🔍</span>
            Find Candidates
          </a>
          <a className="dash-nav-item" href="/employer/dashboard/analytics">
            <span className="dash-nav-icon">📈</span>
            Analytics
          </a>
          <a className="dash-nav-item" href="/employer/onboarding">
            <span className="dash-nav-icon">🏢</span>
            Company Profile
          </a>
        </nav>

        <div className="dash-sidebar-footer">
          <a className="dash-nav-item" href="/employer">
            <span className="dash-nav-icon">←</span>
            Back to home
          </a>
        </div>
      </aside>

      {/* Main content */}
      <div className="employer-dash-main">
        <header className="dash-topbar">
          <div>
            <h1 className="dash-page-title">Dashboard</h1>
            <p className="dash-page-sub">Overview of your hiring activity</p>
          </div>
          <div className="dash-topbar-actions">
            <a className="secondary-button" href="/employer/dashboard/candidates">
              Find candidates
            </a>
            <a className="primary-button" href="/employer/jobs/new">
              + Post a job
            </a>
          </div>
        </header>

        {isLoading ? (
          <div className="dash-loading">Loading dashboard…</div>
        ) : (
          <>
            {/* Stats row */}
            <section className="dash-stats-grid" aria-label="Hiring stats">
              <StatCard
                label="Total jobs posted"
                value={stats?.totalJobs ?? 0}
                sub={`${stats?.activeJobs ?? 0} active`}
                color="#1f8268"
              />
              <StatCard
                label="Total applications"
                value={stats?.totalApplications ?? 0}
                sub={`${stats?.newApplications ?? 0} new`}
                color="#3b82f6"
              />
              <StatCard
                label="Shortlisted"
                value={stats?.shortlisted ?? 0}
                color="#f59e0b"
              />
              <StatCard
                label="Hired"
                value={stats?.hired ?? 0}
                color="#10b981"
              />
            </section>

            {/* Quick actions */}
            <section className="dash-quick-actions">
              <h2>Quick actions</h2>
              <div className="dash-action-grid">
                <a className="dash-action-card" href="/employer/jobs/new">
                  <span className="dash-action-icon">📝</span>
                  <strong>Post a new job</strong>
                  <span>Reach thousands of candidates</span>
                </a>
                <a className="dash-action-card" href="/employer/dashboard/applications">
                  <span className="dash-action-icon">📋</span>
                  <strong>Review applications</strong>
                  <span>Shortlist and schedule interviews</span>
                </a>
                <a className="dash-action-card" href="/employer/dashboard/candidates">
                  <span className="dash-action-icon">🔍</span>
                  <strong>Search candidates</strong>
                  <span>Browse our candidate database</span>
                </a>
                <a className="dash-action-card" href="/employer/dashboard/analytics">
                  <span className="dash-action-icon">📈</span>
                  <strong>View analytics</strong>
                  <span>Track hiring performance</span>
                </a>
              </div>
            </section>

            {/* Recent jobs */}
            <section className="dash-recent-jobs">
              <div className="dash-section-header">
                <h2>Recent job postings</h2>
                <a className="dash-section-link" href="/employer/jobs/new">
                  + New job
                </a>
              </div>

              {recentJobs.length === 0 ? (
                <div className="dash-empty-state">
                  <span className="dash-empty-icon">📭</span>
                  <strong>No jobs posted yet</strong>
                  <p>Post your first job to start receiving applications.</p>
                  <a className="primary-button" href="/employer/jobs/new">
                    Post a job
                  </a>
                </div>
              ) : (
                <div className="dash-jobs-table">
                  <div className="dash-table-header">
                    <span>Job title</span>
                    <span>Location</span>
                    <span>Openings</span>
                    <span>Applications</span>
                    <span>Status</span>
                    <span>Actions</span>
                  </div>
                  {recentJobs.map((job) => (
                    <div className="dash-table-row" key={job.id}>
                      <span className="dash-job-title">{job.title}</span>
                      <span className="dash-job-meta">{job.location}</span>
                      <span className="dash-job-meta">{job.openings}</span>
                      <span className="dash-job-meta">
                        <strong>{job.applicationCount}</strong>
                      </span>
                      <span>
                        <span
                          className={`dash-status-badge ${job.status === 'PUBLISHED' ? 'is-active' : 'is-closed'}`}
                        >
                          {job.status === 'PUBLISHED' ? 'Active' : job.status}
                        </span>
                      </span>
                      <span className="dash-job-actions">
                        <a
                          className="dash-action-link"
                          href={`/employer/dashboard/applications?jobId=${job.id}`}
                        >
                          View applicants
                        </a>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
