"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CandidateApplyButton, CandidateHeaderActions } from "../../../components/candidate-login";
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
    title: "Work type",
    options: ["All work types", "Full Time", "Part Time", "Internship"],
  },
  {
    title: "Department",
    options: ["All departments", "Sales & BD", "Customer Support", "Back Office", "Delivery"],
  },
];

const quickLinks = [
  "Work From Home Jobs",
  "Part Time Jobs",
  "Freshers Jobs",
  "Jobs for women",
  "Full Time Jobs",
  "Night Shift Jobs",
];

const infoCards = [
  "Personalised job matches",
  "Direct connect with HRs",
  "Latest updates on the job",
];

const faqItems = [
  "Explore Best Jobs for Freshers",
  "What are Some of the Most Popular Jobs for Freshers?",
  "Companies That Hire Freshers in India",
  "Benefits of Freshers Jobs",
  "How to Find the Right Freshers Job in India?",
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

export default function FreshersJobsPage() {
  const [jobs, setJobs] = useState<Job[]>(staticJobs);
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
        if (isCurrent && payload?.jobs?.length) {
          // Prefer the larger set so static fallback is never lost
          setJobs(payload.jobs.length >= staticJobs.length ? payload.jobs : staticJobs);
        }
      })
      .catch(() => {
        setJobs(staticJobs);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const filteredJobs = useMemo(() => {
    const query = normalize(searchTerm);

    const matchingJobs = jobs.filter((job) => {
      const postedFilter = selectedFilters["Date posted"] ?? "All";
      const salaryFilter = selectedFilters.Salary ?? "Any salary";
      const modeFilter = selectedFilters["Work mode"] ?? "All work modes";
      const typeFilter = selectedFilters["Work type"] ?? "All work types";
      const departmentFilter = selectedFilters.Department ?? "All departments";

      const matchesSearch =
        !query ||
        [job.title, job.company, job.city, job.department, job.mode, job.type].some((value) =>
          normalize(value).includes(query),
        );
      const matchesPostedDate =
        postedFilter === "All" || job.postedDaysAgo <= (postedDayLimits[postedFilter] ?? Number.POSITIVE_INFINITY);
      const matchesSalary =
        salaryFilter === "Any salary" || job.salaryMax >= (salaryThresholds[salaryFilter] ?? Number.POSITIVE_INFINITY);
      const matchesMode = modeFilter === "All work modes" || normalize(job.mode) === normalize(modeFilter);
      const matchesType = typeFilter === "All work types" || normalize(job.type) === normalize(typeFilter);
      const matchesDepartment = departmentFilter === "All departments" || job.department === departmentFilter;

      return (
        matchesSearch &&
        matchesPostedDate &&
        matchesSalary &&
        matchesMode &&
        matchesType &&
        matchesDepartment
      );
    });

    return [...matchingJobs].sort((first, second) => {
      if (sortBy === "latest") {
        return first.postedDaysAgo - second.postedDaysAgo;
      }

      if (sortBy === "salary") {
        return second.salaryMax - first.salaryMax;
      }

      return 0;
    });
  }, [jobs, searchTerm, selectedFilters, sortBy]);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

  function updateFilter(groupTitle: keyof FilterState, option: string) {
    setSelectedFilters((current) => ({
      ...current,
      [groupTitle]: option,
    }));
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

  function updateSort(value: string) {
    setSortBy(value);
    setCurrentPage(1);
  }

  return (
    <main className="freshers-page">
      <header className="topbar freshers-topbar">
        <div className="container topbar-inner">
          <div className="brand-and-nav">
            <a className="brand" href="/" aria-label="JobFinder home">
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
            <label htmlFor="job-search">Search jobs by title, company or skill</label>
            <form className="freshers-search-row" onSubmit={handleSearch}>
              <input
                id="job-search"
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search freshers jobs"
                type="search"
                value={searchInput}
              />
              <button type="submit">Search</button>
            </form>
            <div className="freshers-quick-links" aria-label="Job type links">
              {quickLinks.map((link) => (
                <a href={link === "Freshers Jobs" ? "/jobs/freshers-jobs?sourcePage=Home+Page" : "/"} key={link}>
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
              <button onClick={clearFilters} type="button">
                Clear all
              </button>
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
                <p>Freshers Jobs</p>
                <h1>Freshers Jobs - {filteredJobs.length} Verified Vacancies</h1>
              </div>
              <label>
                Sort by
                <select onChange={(event) => updateSort(event.target.value)} value={sortBy}>
                  <option value="relevance">Relevance</option>
                  <option value="latest">Latest</option>
                  <option value="salary">Salary: High to Low</option>
                </select>
              </label>
            </div>

            <div className="job-card-list">
              {filteredJobs.length > 0 ? (
                paginatedJobs.map((job) => (
                <article className="freshers-job-card" key={`${job.title}-${job.city}`}>
                  <div className="job-logo" aria-hidden="true">
                    {job.company.slice(0, 1)}
                  </div>
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
                  <p>Try changing the filters or clearing them to see more fresher jobs.</p>
                  <button onClick={clearFilters} type="button">
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <nav className="freshers-pagination" aria-label="Pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  type="button"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    className={page === currentPage ? "active" : ""}
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    type="button"
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  type="button"
                >
                  Next
                </button>
              </nav>
            )}
          </div>
        </div>
      </section>

      <section className="freshers-info-section">
        <div className="container freshers-info-card">
          <div className="freshers-info-copy">
            <p>Know more about Freshers Jobs</p>
            <h2>Build your first career move with verified fresher jobs</h2>
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
              <strong>92%</strong>
              <p>Customer Support Executive</p>
            </div>
            <div className="preview-card">
              <span>Applications</span>
              <strong>14</strong>
              <p>HRs can contact you directly</p>
            </div>
          </div>
        </div>
      </section>

      <section className="freshers-faq-section">
        <div className="container">
          <h2>Know more about freshers jobs</h2>
          <div className="freshers-faq-list">
            {faqItems.map((item) => (
              <details key={item}>
                <summary>{item}</summary>
                <p>
                  Freshers can apply to verified entry-level roles across sales, customer support, operations,
                  delivery, back office, and more. Complete your profile and apply to roles that match your location,
                  salary expectation, and work preference.
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
