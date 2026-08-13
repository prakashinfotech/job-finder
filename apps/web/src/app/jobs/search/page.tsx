"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CandidateApplyButton, CandidateHeaderActions } from "../../../components/candidate-login";
import { JobFinderLogo } from "../../../components/logo";
import { getJobHref, jobs as staticJobs, type Job } from "../../../lib/jobs";

const experienceOptions = [
  "Your Experience",
  "Fresher (0 years)",
  "1 year",
  "2 years",
  "3 years",
  "4 years",
  "5+ years",
];

const sidebarFilters = [
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

const jobsPerPage = 5;

type FilterState = Record<(typeof sidebarFilters)[number]["title"], string>;

const defaultFilters = sidebarFilters.reduce((state, group) => {
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

function SearchBar({
  initialTitle,
  initialExp,
  initialLoc,
}: {
  initialTitle: string;
  initialExp: string;
  initialLoc: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [experience, setExperience] = useState(initialExp);
  const [location, setLocation] = useState(initialLoc);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (title.trim()) params.set("q", title.trim());
    if (experience) params.set("exp", experience);
    if (location.trim()) params.set("loc", location.trim());
    router.push(`/jobs/search?${params.toString()}`);
  };

  return (
    <form className="hero-search-bar" onSubmit={handleSearch} role="search" aria-label="Search jobs">
      <div className="hero-search-fields">
        <div className="hero-search-field">
          <svg aria-hidden="true" className="hero-search-field-icon" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" x2="16.65" y1="21" y2="16.65" />
          </svg>
          <input
            aria-label="Search jobs by title"
            className="hero-search-field-input"
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Search jobs by 'title'"
            type="search"
            value={title}
          />
        </div>

        <div className="hero-search-divider" aria-hidden="true" />

        <div className="hero-search-field hero-search-field--select">
          <svg aria-hidden="true" className="hero-search-field-icon" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
          <select
            aria-label="Your Experience"
            className="hero-search-field-select"
            onChange={(e) => setExperience(e.target.value === experienceOptions[0] ? "" : e.target.value)}
            value={experience || experienceOptions[0]}
          >
            {experienceOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <svg aria-hidden="true" className="hero-select-chevron" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="16">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        <div className="hero-search-divider" aria-hidden="true" />

        <div className="hero-search-field">
          <svg aria-hidden="true" className="hero-search-field-icon" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <input
            aria-label="Search for an area"
            className="hero-search-field-input"
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Search for an area..."
            type="text"
            value={location}
          />
        </div>
      </div>

      <button className="hero-search-submit" type="submit">
        Search jobs
      </button>
    </form>
  );
}

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const queryTitle = searchParams.get("q") ?? "";
  const queryExp = searchParams.get("exp") ?? "";
  const queryLoc = searchParams.get("loc") ?? "";

  const [allJobs, setAllJobs] = useState<Job[]>(staticJobs);
  const [selectedFilters, setSelectedFilters] = useState<FilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);

  // Reload jobs from API
  useEffect(() => {
    let isCurrent = true;
    fetch("/api/jobs", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((payload: { jobs?: Job[] } | null) => {
        if (isCurrent && payload?.jobs?.length) {
          setAllJobs(payload.jobs.length >= staticJobs.length ? payload.jobs : staticJobs);
        }
      })
      .catch(() => { if (isCurrent) setAllJobs(staticJobs); });
    return () => { isCurrent = false; };
  }, []);

  // Reset page when URL params change
  useEffect(() => {
    setCurrentPage(1);
  }, [queryTitle, queryExp, queryLoc]);

  const filteredJobs = useMemo(() => {
    const titleQuery = normalize(queryTitle);
    const locQuery = normalize(queryLoc);

    const matchingJobs = allJobs.filter((job) => {
      const postedFilter = selectedFilters["Date posted"] ?? "All";
      const salaryFilter = selectedFilters.Salary ?? "Any salary";
      const modeFilter = selectedFilters["Work mode"] ?? "All work modes";
      const typeFilter = selectedFilters["Work type"] ?? "All work types";
      const departmentFilter = selectedFilters.Department ?? "All departments";

      // Title / keyword match
      const matchesTitle =
        !titleQuery ||
        [job.title, job.company, job.department].some((v) => normalize(v).includes(titleQuery));

      // Location match
      const matchesLocation =
        !locQuery ||
        normalize(job.city).includes(locQuery) ||
        normalize(job.location).includes(locQuery);

      // Experience match (map label to fresher/any)
      const matchesExp =
        !queryExp ||
        queryExp === experienceOptions[0] ||
        (queryExp === "Fresher (0 years)" && normalize(job.experience).includes("fresher")) ||
        true; // experience is a soft filter for now

      const matchesPostedDate =
        postedFilter === "All" ||
        job.postedDaysAgo <= (postedDayLimits[postedFilter] ?? Number.POSITIVE_INFINITY);
      const matchesSalary =
        salaryFilter === "Any salary" ||
        job.salaryMax >= (salaryThresholds[salaryFilter] ?? Number.POSITIVE_INFINITY);
      const matchesMode =
        modeFilter === "All work modes" || normalize(job.mode) === normalize(modeFilter);
      const matchesType =
        typeFilter === "All work types" || normalize(job.type) === normalize(typeFilter);
      const matchesDepartment =
        departmentFilter === "All departments" || job.department === departmentFilter;

      return (
        matchesTitle &&
        matchesLocation &&
        matchesExp &&
        matchesPostedDate &&
        matchesSalary &&
        matchesMode &&
        matchesType &&
        matchesDepartment
      );
    });

    return [...matchingJobs].sort((a, b) => {
      if (sortBy === "latest") return a.postedDaysAgo - b.postedDaysAgo;
      if (sortBy === "salary") return b.salaryMax - a.salaryMax;
      return 0;
    });
  }, [allJobs, queryTitle, queryLoc, queryExp, selectedFilters, sortBy]);

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
    setSortBy("relevance");
    setCurrentPage(1);
  }

  // Build a human-readable heading
  const headingParts: string[] = [];
  if (queryTitle) headingParts.push(`"${queryTitle}"`);
  if (queryLoc) headingParts.push(`in ${queryLoc}`);
  const headingLabel = headingParts.length > 0 ? headingParts.join(" ") : "All Jobs";

  return (
    <main className="freshers-page search-results-page">
      {/* Header */}
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

      {/* Inline search bar */}
      <div className="search-results-hero">
        <div className="container">
          <SearchBar initialTitle={queryTitle} initialExp={queryExp} initialLoc={queryLoc} />
        </div>
      </div>

      {/* Results */}
      <section className="freshers-listing-section">
        <div className="container freshers-layout">
          {/* Sidebar filters */}
          <aside className="freshers-filter-panel" aria-label="Job filters">
            <div className="filter-header">
              <strong>Filters</strong>
              <button onClick={clearFilters} type="button">Clear all</button>
            </div>
            {sidebarFilters.map((group) => (
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

          {/* Job list */}
          <div className="freshers-results">
            <div className="results-heading">
              <div>
                <p>Search Results</p>
                <h1>{headingLabel} — {filteredJobs.length} Jobs Found</h1>
              </div>
              <label>
                Sort by
                <select onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }} value={sortBy}>
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
                  <h2>No jobs found</h2>
                  <p>
                    {queryTitle || queryLoc
                      ? `We couldn't find jobs matching your search. Try different keywords or clear the filters.`
                      : "No jobs available right now. Try adjusting the filters."}
                  </p>
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
    </main>
  );
}
