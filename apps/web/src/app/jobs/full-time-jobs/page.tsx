"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CandidateApplyButton, CandidateHeaderActions } from "../../../components/candidate-login";
import { JobFinderLogo } from "../../../components/logo";
import { getJobHref, jobs as staticJobs, type Job } from "../../../lib/jobs";

const filters = [
  {
    title: "Date posted",
    options: ["All", "Last 24 hours", "Last 3 days", "Last 7 days"],
  },
  {
    title: "Salary",
    options: ["Any salary", "Rs. 10,000+", "Rs. 20,000+", "Rs. 30,000+"],
  },
  {
    title: "Work mode",
    options: ["All work modes", "Work from office", "Work from home", "Field job"],
  },
  {
    title: "Department",
    options: [
      "All departments",
      "Sales & BD",
      "Customer Support",
      "Back Office",
      "Delivery",
      "Human Resource",
      "Accounts / Finance",
    ],
  },
];

const quickLinks = [
  "Freshers Jobs",
  "Work From Home Jobs",
  "Part Time Jobs",
  "Jobs for women",
  "Night Shift Jobs",
  "Full Time Jobs",
];

const infoCards = [
  "Stable income & career growth",
  "PF, ESI & health benefits",
  "Verified full-time employers",
];

const faqItems = [
  "What are Full Time Jobs?",
  "Which Sectors Have the Most Full Time Jobs in India?",
  "What is the Average Salary for Full Time Jobs?",
  "How to Get a Full Time Job as a Fresher?",
  "Benefits of Full Time Employment",
];

const jobsPerPage = 5;

type FilterState = Record<(typeof filters)[number]["title"], string>;

const defaultFilters = filters.reduce((state, group) => {
  state[group.title] = group.options[0] ?? "";
  return state;
}, {} as FilterState);

const salaryThresholds: Record<string, number> = {
  "Rs. 10,000+": 10000,
  "Rs. 20,000+": 20000,
  "Rs. 30,000+": 30000,
};

const postedDayLimits: Record<string, number> = {
  "Last 24 hours": 1,
  "Last 3 days": 3,
  "Last 7 days": 7,
};

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}



export default function FullTimeJobsPage() {
  const fullTimeStaticJobs = useMemo(
    () => staticJobs.filter((job) => normalize(job.type) === "full time"),
    [],
  );

  const [jobs, setJobs] = useState<Job[]>(fullTimeStaticJobs);
  const [selectedFilters, setSelectedFilters] = useState<FilterState>(defaultFilters);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isCurrent = true;

    fetch("/api/jobs", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { jobs?: Job[] } | null) => {
        if (!isCurrent) return;
        if (payload?.jobs?.length) {
          const filtered = payload.jobs.filter((job) => normalize(job.type) === "full time");
          setJobs(filtered.length >= fullTimeStaticJobs.length ? filtered : fullTimeStaticJobs);
        }
      })
      .catch(() => {
        if (isCurrent) setJobs(fullTimeStaticJobs);
      });

    return () => {
      isCurrent = false;
    };
  }, [fullTimeStaticJobs]);

  const filteredJobs = useMemo(() => {
    const query = normalize(searchTerm);

    const matchingJobs = jobs.filter((job) => {
      const postedFilter = selectedFilters["Date posted"] ?? "All";
      const salaryFilter = selectedFilters.Salary ?? "Any salary";
      const modeFilter = selectedFilters["Work mode"] ?? "All work modes";
      const departmentFilter = selectedFilters.Department ?? "All departments";

      const matchesSearch =
        !query ||
        [job.title, job.company, job.city, job.department, job.mode].some((value) =>
          normalize(value).includes(query),
        );
      const matchesPostedDate =
        postedFilter === "All" ||
        job.postedDaysAgo <= (postedDayLimits[postedFilter] ?? Number.POSITIVE_INFINITY);
      const matchesSalary =
        salaryFilter === "Any salary" ||
        job.salaryMax >= (salaryThresholds[salaryFilter] ?? Number.POSITIVE_INFINITY);
      const matchesMode =
        modeFilter === "All work modes" || normalize(job.mode) === normalize(modeFilter);
      const matchesDepartment =
        departmentFilter === "All departments" || job.department === departmentFilter;

      return matchesSearch && matchesPostedDate && matchesSalary && matchesMode && matchesDepartment;
    });

    return [...matchingJobs].sort((a, b) => {
      if (sortBy === "latest") return a.postedDaysAgo - b.postedDaysAgo;
      if (sortBy === "salary") return b.salaryMax - a.salaryMax;
      return 0;
    });
  }, [jobs, searchTerm, selectedFilters, sortBy]);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage,
  );

  function updateFilter(groupTitle: keyof FilterState, option: string) {
    setSelectedFilters((current) => ({ ...current, [groupTitle]: option }));
    setCurrentPage(1);
  }

  function clearFilters() {
    setSelectedFilters(defaultFilters);
    setSearchInput("");
    setSearchTerm("");
    setSortBy("relevance");
    setCurrentPage(1);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1);
  }

  return (
    <main className="freshers-page">
      <header className="topbar freshers-topbar">
        <div className="container topbar-inner">
          <div className="brand-and-nav">
            <a className="brand" href="/" aria-label="jobfinder">
              <JobFinderLogo />
            </a>
            <nav className="desktop-nav" aria-label="Jobs navigation">
              <a href="/">Jobs</a>
            </nav>
          </div>
          <div className="topbar-actions">
            <CandidateHeaderActions />
          </div>
        </div>
      </header>

      <section className="freshers-search-shell">
        <div className="container">
          <div className="freshers-search-card">
            <label htmlFor="job-search">Search full time jobs by title, company or skill</label>
            <form className="freshers-search-row" onSubmit={handleSearch}>
              <input
                id="job-search"
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search full time jobs"
                type="search"
                value={searchInput}
              />
              <button type="submit">Search</button>
            </form>
            <div className="freshers-quick-links" aria-label="Job type links">
              {quickLinks.map((link) => (
                <a
                  href={
                    link === "Full Time Jobs" ? "/jobs/full-time-jobs?sourcePage=Home+Page"
                    : link === "Freshers Jobs" ? "/jobs/freshers-jobs?sourcePage=Home+Page"
                    : link === "Work From Home Jobs" ? "/jobs/work-from-home-jobs?sourcePage=Home+Page"
                    : link === "Part Time Jobs" ? "/jobs/part-time-jobs?sourcePage=Home+Page"
                    : link === "Jobs for women" ? "/jobs/jobs-for-women?sourcePage=Home+Page"
                    : "/"
                  }
                  key={link}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="freshers-listing-section">
        <div className="container freshers-layout">
          <aside className="freshers-filter-panel" aria-label="Job filters">
            <div className="filter-header">
              <strong>Filters</strong>
              <button onClick={clearFilters} type="button">Clear all</button>
            </div>
            {filters.map((group) => (
              <div className="filter-group" key={group.title}>
                <h2>{group.title}</h2>
                {group.options.map((option) => (
                  <label key={option}>
                    <input
                      checked={selectedFilters[group.title] === option}
                      name={group.title}
                      onChange={() => updateFilter(group.title, option)}
                      type="radio"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ))}
          </aside>

          <div className="freshers-results">
            <div className="results-heading">
              <div>
                <p>Full Time Jobs</p>
                <h1>Full Time Jobs - {filteredJobs.length} Verified Vacancies</h1>
              </div>
              <label>
                Sort by
                <select onChange={(event) => { setSortBy(event.target.value); setCurrentPage(1); }} value={sortBy}>
                  <option value="relevance">Relevance</option>
                  <option value="latest">Latest</option>
                  <option value="salary">Salary: High to Low</option>
                </select>
              </label>
            </div>

            <div className="job-card-list">
              {filteredJobs.length > 0 ? (
                paginatedJobs.map((job) => (
                  <article className="freshers-job-card" key={job.id}>
                    <div className="job-logo" aria-hidden="true">{job.company.slice(0, 1)}</div>
                    <div className="job-card-body">
                      <div className="job-title-row">
                        <div>
                          <h2>{job.title}</h2>
                          <p>{job.company}</p>
                        </div>
                        <span>{job.tag}</span>
                      </div>
                      <div className="job-meta-grid">
                        <span>{job.city}</span>
                        <span>{job.salary}</span>
                        <span>{job.mode}</span>
                        <span>{job.type}</span>
                        <span>{job.department}</span>
                        <span>{job.shift}</span>
                        <span>{job.experience}</span>
                        <span>{job.english}</span>
                      </div>
                      <div className="job-card-actions">
                        <a href={getJobHref(job)}>View details</a>
                        <CandidateApplyButton jobId={job.id} />
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="freshers-empty-state">
                  <h2>No jobs match your filters</h2>
                  <p>Try changing the filters or clearing them to see more full time jobs.</p>
                  <button onClick={clearFilters} type="button">Clear filters</button>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <nav className="freshers-pagination" aria-label="Pagination">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} type="button">Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button className={page === currentPage ? "active" : ""} key={page} onClick={() => setCurrentPage(page)} type="button">{page}</button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} type="button">Next</button>
              </nav>
            )}
          </div>
        </div>
      </section>

      <section className="freshers-info-section">
        <div className="container freshers-info-card">
          <div className="freshers-info-copy">
            <p>Know more about Full Time Jobs</p>
            <h2>Build a stable career with verified full time jobs across India</h2>
            <div className="freshers-info-grid">
              {infoCards.map((item) => (
                <div key={item}>
                  <span aria-hidden="true" />
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
            <CandidateApplyButton className="primary-button" label="Create profile" />
          </div>
          <div className="freshers-profile-preview" aria-hidden="true">
            <div className="preview-card">
              <span>Match score</span>
              <strong>93%</strong>
              <p>Sales Executive</p>
            </div>
            <div className="preview-card">
              <span>Applications</span>
              <strong>16</strong>
              <p>HRs can contact you directly</p>
            </div>
          </div>
        </div>
      </section>

      <section className="freshers-faq-section">
        <div className="container">
          <h2>Know more about full time jobs</h2>
          <div className="freshers-faq-list">
            {faqItems.map((item) => (
              <details key={item}>
                <summary>{item}</summary>
                <p>
                  Full time jobs offer stable income, career growth, and benefits like PF, ESI, and health
                  insurance. Roles span sales, customer support, operations, delivery, HR, accounts, and more.
                  Complete your profile on JobFinder and apply to verified full time jobs that match your skills,
                  location, and salary expectations.
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
