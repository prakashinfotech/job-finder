'use client';

import { useEffect, useState } from 'react';

const employerSessionKey = 'jobfinder-employer-session';

type AnalyticsData = {
  totalApplications: number;
  totalHired: number;
  totalRejected: number;
  totalShortlisted: number;
  totalInterviews: number;
  avgTimeToHireDays: number | null;
  applicationsByJob: { jobTitle: string; count: number }[];
  funnelStages: { stage: string; count: number; pct: number }[];
  applicationsByDay: { date: string; count: number }[];
};

function MetricCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
}) {
  return (
    <div className="analytics-metric-card">
      <span className="analytics-metric-icon" aria-hidden="true">
        {icon}
      </span>
      <div className="analytics-metric-body">
        <span className="analytics-metric-label">{label}</span>
        <strong className="analytics-metric-value">{value}</strong>
        {sub ? <span className="analytics-metric-sub">{sub}</span> : null}
      </div>
    </div>
  );
}

function FunnelBar({
  stage,
  count,
  pct,
  color,
}: {
  stage: string;
  count: number;
  pct: number;
  color: string;
}) {
  return (
    <div className="funnel-row">
      <span className="funnel-stage-label">{stage}</span>
      <div className="funnel-bar-track">
        <div
          className="funnel-bar-fill"
          style={{ width: `${Math.max(pct, 2)}%`, background: color }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <span className="funnel-count">{count}</span>
      <span className="funnel-pct">{pct.toFixed(0)}%</span>
    </div>
  );
}

const FUNNEL_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4', '#10b981', '#1f8268', '#ef4444'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = window.localStorage.getItem(employerSessionKey);
    if (!session) {
      window.location.href = '/employer/signin';
      return;
    }

    async function load() {
      try {
        const res = await fetch('/api/employer/analytics');
        if (res.ok) {
          const json = (await res.json()) as AnalyticsData;
          setData(json);
        }
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, []);

  const conversionRate =
    data && data.totalApplications > 0
      ? ((data.totalHired / data.totalApplications) * 100).toFixed(1)
      : '0';

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
          <a className="dash-nav-item" href="/employer/dashboard/candidates">
            <span className="dash-nav-icon">🔍</span>Find Candidates
          </a>
          <a className="dash-nav-item is-active" href="/employer/dashboard/analytics">
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
            <h1 className="dash-page-title">Analytics</h1>
            <p className="dash-page-sub">Track your hiring performance</p>
          </div>
        </header>

        {isLoading ? (
          <div className="dash-loading">Loading analytics…</div>
        ) : !data ? (
          <div className="dash-empty-state">
            <span className="dash-empty-icon">📊</span>
            <strong>No data yet</strong>
            <p>Post a job and receive applications to see analytics.</p>
            <a className="primary-button" href="/employer/jobs/new">
              Post a job
            </a>
          </div>
        ) : (
          <>
            {/* Key metrics */}
            <section className="analytics-metrics-grid" aria-label="Key hiring metrics">
              <MetricCard
                icon="📥"
                label="Total applications"
                value={data.totalApplications}
                sub="All time"
              />
              <MetricCard
                icon="✅"
                label="Hired"
                value={data.totalHired}
                sub={`${conversionRate}% conversion`}
              />
              <MetricCard
                icon="⏱️"
                label="Avg. time to hire"
                value={data.avgTimeToHireDays !== null ? `${data.avgTimeToHireDays} days` : 'N/A'}
                sub="From application to hire"
              />
              <MetricCard
                icon="🎯"
                label="Shortlisted"
                value={data.totalShortlisted}
                sub={
                  data.totalApplications > 0
                    ? `${((data.totalShortlisted / data.totalApplications) * 100).toFixed(0)}% of applicants`
                    : undefined
                }
              />
              <MetricCard
                icon="📅"
                label="Interviews scheduled"
                value={data.totalInterviews}
              />
              <MetricCard
                icon="❌"
                label="Rejected"
                value={data.totalRejected}
              />
            </section>

            {/* Conversion funnel */}
            <section className="analytics-section">
              <h2 className="analytics-section-title">Conversion funnel</h2>
              <div className="analytics-funnel-card">
                {data.funnelStages.length === 0 ? (
                  <p className="analytics-empty-note">No application data yet.</p>
                ) : (
                  data.funnelStages.map((stage, i) => (
                    <FunnelBar
                      color={FUNNEL_COLORS[i % FUNNEL_COLORS.length]!}
                      count={stage.count}
                      key={stage.stage}
                      pct={stage.pct}
                      stage={stage.stage}
                    />
                  ))
                )}
              </div>
            </section>

            {/* Applications by job */}
            <section className="analytics-section">
              <h2 className="analytics-section-title">Applications by job</h2>
              <div className="analytics-jobs-card">
                {data.applicationsByJob.length === 0 ? (
                  <p className="analytics-empty-note">No jobs with applications yet.</p>
                ) : (
                  <div className="analytics-jobs-list">
                    {data.applicationsByJob.map((item) => {
                      const maxCount = Math.max(...data.applicationsByJob.map((j) => j.count), 1);
                      const pct = (item.count / maxCount) * 100;
                      return (
                        <div className="analytics-job-row" key={item.jobTitle}>
                          <span className="analytics-job-title">{item.jobTitle}</span>
                          <div className="analytics-job-bar-track">
                            <div
                              className="analytics-job-bar-fill"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="analytics-job-count">{item.count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Recent activity */}
            {data.applicationsByDay.length > 0 && (
              <section className="analytics-section">
                <h2 className="analytics-section-title">Application volume (last 14 days)</h2>
                <div className="analytics-activity-card">
                  <div className="analytics-sparkline" aria-label="Application volume chart">
                    {data.applicationsByDay.map((day) => {
                      const maxCount = Math.max(...data.applicationsByDay.map((d) => d.count), 1);
                      const height = Math.max((day.count / maxCount) * 100, 4);
                      return (
                        <div className="sparkline-col" key={day.date} title={`${day.date}: ${day.count}`}>
                          <div
                            className="sparkline-bar"
                            style={{ height: `${height}%` }}
                            aria-label={`${day.count} applications on ${day.date}`}
                          />
                          <span className="sparkline-label">
                            {new Date(day.date).getDate()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
