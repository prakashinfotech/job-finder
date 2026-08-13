import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CandidateApplyButton, CandidateHeaderActions } from "../../../../components/candidate-login";
import { getJobHref } from "../../../../lib/jobs";
import { getPublishedJobBySlug, getPublishedJobs } from "../../../../lib/db-jobs";

type JobDetailsPageProps = {
  params: Promise<{
    city: string;
    slug: string;
  }>;
};

function JobFinderLogo() {
  return (
    <svg aria-label="jobfinder" className="jobfinder-logo" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 22 C60 22 28 54 28 94 C28 134 60 166 100 166 C120 166 138 158 151 145" stroke="#F5A623" strokeWidth="20" strokeLinecap="round" fill="none"/>
      <line x1="148" y1="148" x2="178" y2="178" stroke="#F5A623" strokeWidth="20" strokeLinecap="round"/>
      <rect x="76" y="38" width="48" height="18" rx="6" fill="#2B5F7E"/>
      <rect x="82" y="44" width="36" height="8" rx="3" fill="white"/>
      <path d="M44 80 L100 112 L156 80 L152 68 Q150 60 142 60 L58 60 Q50 60 48 68 Z" fill="#2B5F7E"/>
      <rect x="44" y="80" width="112" height="58" rx="8" fill="#2B5F7E"/>
      <ellipse cx="100" cy="104" rx="12" ry="8" fill="white"/>
    </svg>
  );
}

export async function generateMetadata({ params }: JobDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug);

  if (!job) {
    return {
      title: "Job not found | jobfinder.co",
    };
  }

  return {
    title: `${job.title} Job in ${job.city} at ${job.company} | jobfinder.co`,
    description: `${job.title} opening at ${job.company}. ${job.salary}, ${job.type}, ${job.mode}.`,
  };
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug);

  if (!job) {
    notFound();
  }

  const allJobs = await getPublishedJobs();
  const similarJobs = allJobs.filter((item) => item.id !== job.id && item.department === job.department).slice(0, 3);

  return (
    <main className="job-details-page">
      <header className="topbar freshers-topbar">
        <div className="container topbar-inner">
          <div className="brand-and-nav">
            <a className="brand" href="/" aria-label="JobFinder home">
              <JobFinderLogo />
            </a>
            <nav className="desktop-nav" aria-label="Jobs navigation">
              <a href="/jobs/freshers-jobs?sourcePage=Home+Page">Jobs</a>
            </nav>
          </div>
          <div className="topbar-actions">
            <CandidateHeaderActions />
          </div>
        </div>
      </header>

      <section className="job-details-hero">
        <div className="container">
          <a className="job-back-link" href="/jobs/freshers-jobs?sourcePage=Home+Page">
            Back to freshers jobs
          </a>
          <div className="job-details-card job-details-summary">
            <div className="job-logo job-details-logo" aria-hidden="true">
              {job.company.slice(0, 1)}
            </div>
            <div>
              <p>{job.tag}</p>
              <h1>{job.title}</h1>
              <span>{job.company}</span>
            </div>
            <CandidateApplyButton jobId={job.id} />
          </div>
        </div>
      </section>

      <section className="job-details-section">
        <div className="container job-details-layout">
          <div className="job-details-main">
            <section className="job-details-card">
              <h2>Job details</h2>
              <div className="job-details-grid">
                <div>
                  <span>Salary</span>
                  <strong>{job.salary}</strong>
                </div>
                <div>
                  <span>Location</span>
                  <strong>{job.location}</strong>
                </div>
                <div>
                  <span>Work mode</span>
                  <strong>{job.mode}</strong>
                </div>
                <div>
                  <span>Work type</span>
                  <strong>{job.type}</strong>
                </div>
                <div>
                  <span>Experience</span>
                  <strong>{job.experience}</strong>
                </div>
                <div>
                  <span>Openings</span>
                  <strong>{job.openings} openings</strong>
                </div>
              </div>
            </section>

            <section className="job-details-card job-copy-section">
              <h2>Job description</h2>
              <p>{job.description}</p>
            </section>

            <section className="job-details-card job-copy-section">
              <h2>Role and responsibilities</h2>
              <ul>
                {job.responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="job-details-card job-copy-section">
              <h2>Requirements</h2>
              <ul>
                {job.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="job-details-card job-copy-section">
              <h2>Perks and benefits</h2>
              <div className="job-benefit-list">
                {job.benefits.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </section>
          </div>

          <aside className="job-details-sidebar">
            <div className="job-details-card apply-panel">
              <h2>Apply for this job</h2>
              <p>Complete your profile to connect directly with HR and track your application.</p>
              <CandidateApplyButton jobId={job.id} />
            </div>

            <div className="job-details-card company-panel">
              <h2>Company details</h2>
              <div className="company-mini-profile">
                <div className="job-logo" aria-hidden="true">
                  {job.company.slice(0, 1)}
                </div>
                <div>
                  <strong>{job.company}</strong>
                  <span>{job.department}</span>
                </div>
              </div>
              <dl>
                <div>
                  <dt>Interview address</dt>
                  <dd>{job.interviewAddress}</dd>
                </div>
                <div>
                  <dt>Posted</dt>
                  <dd>{job.postedDaysAgo === 1 ? "1 day ago" : `${job.postedDaysAgo} days ago`}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </section>

      {similarJobs.length > 0 && (
        <section className="job-details-section similar-jobs-section">
          <div className="container">
            <h2>Similar jobs</h2>
            <div className="similar-jobs-grid">
              {similarJobs.map((item) => (
                <a className="job-details-card similar-job-card" href={getJobHref(item)} key={item.id}>
                  <strong>{item.title}</strong>
                  <span>{item.company}</span>
                  <p>{item.salary}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
