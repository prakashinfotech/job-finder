'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CandidateHeaderActions, useCandidateSession } from '../components/candidate-login';

const trendingSearches = [
  { rank: "TRENDING AT #1", title: "Jobs for Freshers", href: "/jobs/freshers-jobs?sourcePage=Home+Page" },
  { rank: "TRENDING AT #2", title: "Work from home Jobs", href: "/jobs/work-from-home-jobs?sourcePage=Home+Page" },
  { rank: "TRENDING AT #3", title: "Part time Jobs", href: "/jobs/part-time-jobs?sourcePage=Home+Page" },
  { rank: "TRENDING AT #4", title: "Jobs for Women", href: "/jobs/jobs-for-women?sourcePage=Home+Page" },
  { rank: "TRENDING AT #5", title: "Full time Jobs", href: "/jobs/full-time-jobs?sourcePage=Home+Page" },
];

const jobRoles = [
  ["Telecalling / BPO / Telesales", "4,661 openings"],
  ["Accounts / Finance", "4,410 openings"],
  ["Field Sales", "3,954 openings"],
  ["Delivery Person", "3,746 openings"],
  ["Business Development", "2,262 openings"],
  ["Retail / Counter Sales", "1,568 openings"],
  ["Logistics/ Warehouse operations", "1,432 openings"],
  ["Marketing", "1,054 openings"],
  ["Back Office", "956 openings"],
  ["Cook / Chef / Baker", "753 openings"],
  ["Restaurant Staff / Kitchen Help/ Steward", "741 openings"],
  ["Human Resource", "722 openings"],
];

const cities = [
  "Jobs in Agra",
  "Jobs in Ahmedabad",
  "Jobs in Ahmednagar",
  "Jobs in Ajmer",
  "Jobs in Aligarh",
  "Jobs in Amritsar",
  "Jobs in Asansol",
  "Jobs in Aurangabad",
  "Jobs in Bareilly",
  "Jobs in Bengaluru/Bangalore",
  "Jobs in Bhopal",
  "Jobs in Chandigarh",
  "Jobs in Chennai",
  "Jobs in Coimbatore",
  "Jobs in Delhi-NCR",
  "Jobs in Goa",
  "Jobs in Hyderabad",
  "Jobs in Indore",
  "Jobs in Jaipur",
  "Jobs in Kanpur",
  "Jobs in Kochi",
  "Jobs in Kolkata/Calcutta",
  "Jobs in Lucknow",
  "Jobs in Mumbai/Bombay",
  "Jobs in Nagpur",
  "Jobs in Patna",
  "Jobs in Pune",
  "Jobs in Raipur",
  "Jobs in Surat",
  "Jobs in Vadodara",
];

const popularJobs = [
  "Delivery Person Jobs",
  "Accounts / Finance Jobs",
  "Sales (Field Work)",
  "Human Resource",
  "Backoffice Jobs",
  "Business Development",
  "Telecaller / BPO",
  "Work from Home Jobs",
  "Part Time Jobs",
  "Full Time Jobs",
  "Night Shift Jobs",
  "Freshers Jobs",
];

const departments = [
  "Admin / Back Office / Computer Operator Jobs",
  "Advertising / Communication Jobs",
  "Aviation & Aerospace Jobs",
  "Banking / Insurance / Financial Services Jobs",
  "Beauty, Fitness & Personal Care Jobs",
  "Construction & Site Engineering Jobs",
  "Consulting Jobs",
  "Content, Editorial & Journalism Jobs",
  "CSR & Social Service Jobs",
  "Customer Support Jobs",
  "Data Science & Analytics Jobs",
  "Delivery / Driver / Logistics Jobs",
  "Finance & Accounting Jobs",
  "Healthcare / Doctor / Hospital Staff Jobs",
  "Human Resources Jobs",
  "IT & Information Security Jobs",
  "Marketing / Brand / Digital Marketing Jobs",
  "Operations Jobs",
  "Production / Manufacturing / Engineering Jobs",
  "Restaurant / Hospitality / Tourism Jobs",
  "Retail & eCommerce Jobs",
  "Sales & BD Jobs",
  "Software Engineering Jobs",
  "Teaching & Training Jobs",
];

const footerGroups = [
  {
    title: "Links",
    items: ["Download JobFinder app", "Free Job Alerts", "Careers", "Contact Us"],
  },
  {
    title: "Legal",
    items: ["Privacy Policy", "User Terms & Conditions", "Vulnerability Disclosure Policy"],
  },
  {
    title: "Resources",
    items: ["Blog", "Sitemap"],
  },
];

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

const experienceOptions = [
  "Your Experience",
  "Fresher (0 years)",
  "1 year",
  "2 years",
  "3 years",
  "4 years",
  "5+ years",
];

function HeroSearch() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (title.trim()) params.set('q', title.trim());
    if (experience) params.set('exp', experience);
    if (location.trim()) params.set('loc', location.trim());
    router.push(`/jobs/search?${params.toString()}`);
  };

  return (
    <form className="hero-search-bar" onSubmit={handleSearch} role="search" aria-label="Search jobs">
      <div className="hero-search-fields">
        {/* Title field */}
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

        {/* Experience field */}
        <div className="hero-search-field hero-search-field--select">
          <svg aria-hidden="true" className="hero-search-field-icon" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
          <select
            aria-label="Your Experience"
            className="hero-search-field-select"
            onChange={(e) => setExperience(e.target.value === experienceOptions[0] ? '' : e.target.value)}
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

        {/* Location field */}
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

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  );
}

export default function HomePage() {
  const candidateSession = useCandidateSession();

  return (
    <main className="homepage">
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand-and-nav">
            <a className="brand" href="/" aria-label="JobFinder home">
              <JobFinderLogo />
            </a>
            <nav className="desktop-nav" aria-label="Primary">
              <a href="/">Jobs</a>
            </nav>
          </div>
          <div className="topbar-actions">
            <CandidateHeaderActions />
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="hero-kicker">#1 JOB PLATFORM</p>
            <h1>Your job search ends here</h1>
            <p className="hero-subtitle">Discover 10 lakh+ career opportunities</p>
            <HeroSearch />
          </div>
          <div className="hero-visual">
            <img
              alt="Job search illustration"
              loading="eager"
              src="/hero-illustration.svg"
            />
          </div>
        </div>
      </section>


      <section className="content-section">
        <div className="container">
          <SectionHeading title="Popular Searches on JobFinder" />
          <div className="search-grid">
            {trendingSearches.map((search) => (
              <a className="search-card" href={search.href} key={search.rank}>
                <span>{search.rank}</span>
                <strong>{search.title}</strong>
                <em>View all</em>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section roles-section">
        <div className="container">
          <SectionHeading title="Trending job roles on JobFinder" />
          <div className="role-grid">
            {jobRoles.map(([title, count]) => (
              <a className="role-card" href="/" key={title}>
                <strong>{title}</strong>
                <span>{count}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="download-section">
        <div className="container download-card">
          <div className="download-copy">
            <p className="section-label">Download JobFinder app!</p>
            <h3>Unlimited job applications | HRs contact you directly | Track your Applications</h3>
            <ul>
              <li>Unlimited job applications</li>
              <li>HRs contact you directly</li>
              <li>Track your Applications</li>
            </ul>
            <div className="store-row">
              <img
                alt="Download on the App Store"
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
              />
              <img
                alt="Get it on Google Play"
                src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
              />
            </div>
          </div>
          <div className="download-visual">
            <img
              alt="Person searching for jobs on laptop"
              className="download-banner-img"
              src="/download-banner.jpg"
            />
          </div>
        </div>
      </section>

      {!candidateSession && (
      <section className="employer-section">
        <div className="container employer-card">
          <div className="employer-visual">
            <img
              alt="Employer interviewing a candidate"
              src="/employer-hiring.jpg"
            />
          </div>
          <div className="employer-copy">
            <p className="section-label">JOBFINDER FOR EMPLOYERS</p>
            <h3>Want to hire?</h3>
            <p>Find the best candidate from 5 crore+ active job seekers!</p>
            <a className="primary-button" href="/">
              Post job
            </a>
          </div>
        </div>
      </section>
      )}

      <section className="content-section link-cloud-section">
        <div className="container">
          <SectionHeading title="Find Jobs" />
          <div className="chip-grid">
            {cities.map((city) => (
              <a className="text-chip" href="/" key={city}>
                {city}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section link-cloud-section">
        <div className="container">
          <SectionHeading title="Popular Jobs" />
          <div className="chip-grid">
            {popularJobs.map((job) => (
              <a className="text-chip" href="/" key={job}>
                {job}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section link-cloud-section">
        <div className="container">
          <SectionHeading title="Jobs by Department" />
          <div className="chip-grid">
            {departments.map((department) => (
              <a className="text-chip" href="/" key={department}>
                {department}
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <JobFinderLogo />
            <p>India&apos;s leading platform for jobs, hiring, and career growth.</p>
          </div>
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h4>{group.title}</h4>
              <div className="footer-links">
                {group.items.map((item) => (
                  <a href="/" key={item}>
                    {item}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </footer>
    </main>
  );
}
