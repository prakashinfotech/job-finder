'use client';

import { useEffect, useState } from 'react';

const employerSessionKey = 'jobfinder-employer-session';

const employerFeatures = [
  {
    icon: '📝',
    title: 'SMART JOB POSTING',
    description: 'Get applications from relevant, high-intent candidates',
    href: '/employer/jobs/new'
  },
  {
    icon: '🔍',
    title: 'Advanced Job Filters & Assessments',
    description: 'Use advanced filters and automated assessments to attract the most relevant candidates.',
    href: '/employer/dashboard/candidates'
  },
  {
    icon: '🤖',
    title: 'Smart AI Lead Management',
    description: 'Boost recruiter productivity by automatically categorizing leads into matched and non-matched candidates',
    href: '/employer/dashboard/applications'
  },
  {
    icon: '📞',
    title: 'Inbound Calls & WhatsApp Alerts',
    description: 'Stay informed on the go with real-time candidate calls and application alerts directly on WhatsApp.',
    href: '/employer/dashboard'
  },
  {
    icon: '✨',
    title: 'AI-Suggested Candidates',
    description: 'Get AI-recommended candidates from our database matching to your job postings.',
    href: '/employer/dashboard/candidates'
  },
  {
    icon: '📊',
    title: 'Customized Lead Management',
    description: 'Manage leads efficiently with ATS integration, CSV access, dashboard tracking, and WhatsApp alerts.',
    href: '/employer/dashboard/analytics'
  }
];

const aiCallingFeatures = [
  {
    title: 'Post a Premium job with AI Calling Agent',
    description: 'Talk to the AI agent and set your hiring criteria. AI agent creates expert, role-specific questions'
  },
  {
    title: 'AI agent calls candidates on your behalf 24/7',
    description: 'Interviews all interested candidates. Follows up 5 times via call, whatsapp & email even after work hours'
  },
  {
    title: 'Gives you a ready shortlist of top candidates',
    description: 'Get a dashboard with candidates pre-sorted by job fit whom you can interview'
  }
];

const stats = [
  { number: '1Cr+', label: 'Qualified candidates' },
  { number: '2L+', label: 'Employers use JobFinder' },
  { number: '692+', label: 'Available cities' }
];

function readEmployerSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(employerSessionKey);
  } catch {
    return null;
  }
}

function useEmployerSession() {
  const [hasEmployerSession, setHasEmployerSession] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const syncSession = () => setHasEmployerSession(Boolean(readEmployerSession()));

    syncSession();
    window.addEventListener('storage', syncSession);
    window.addEventListener('employer-session-change', syncSession);

    return () => {
      window.removeEventListener('storage', syncSession);
      window.removeEventListener('employer-session-change', syncSession);
    };
  }, []);

  function clearSession() {
    window.localStorage.removeItem(employerSessionKey);
    window.dispatchEvent(new Event('employer-session-change'));
  }

  return { hasEmployerSession: mounted && hasEmployerSession, clearSession };
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

export default function EmployerPage() {
  const { hasEmployerSession, clearSession } = useEmployerSession();

  return (
    <main className="homepage">
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand-and-nav">
            <a className="brand" href="/employer" aria-label="JobFinder employer home">
              <JobFinderLogo />
            </a>
            <nav className="desktop-nav" aria-label="Primary">
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#testimonials">Testimonials</a>
              <a href="#contact">Contact</a>
            </nav>
          </div>
          <div className="topbar-actions">
            <a className="text-link" href="/contact-us">
              Contact sales
            </a>
            {hasEmployerSession ? (
              <>
                <a className="text-link" href="/employer/dashboard">
                  Dashboard
                </a>
                <button
                  className="text-link topbar-link-button"
                  type="button"
                  onClick={clearSession}
                >
                  Logout
                </button>
              </>
            ) : (
              <a className="text-link" href="/employer/signin">
                Login/Sign up
              </a>
            )}
            <div className="switch-pill" aria-label="User type">
              {!hasEmployerSession ? (
                <a href="/" className="switch-pill-candidate-btn">
                  Candidate
                </a>
              ) : null}
              <button className="is-active" type="button" disabled>
                Employer
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="hero-kicker">HIRE TOP TALENT IN 48 HOURS</p>
            <h1>Streamline your recruitment with AI-driven precision</h1>
            <p className="hero-subtitle">Single solution from Fresher to experienced hiring</p>
            <div className="hero-actions">
              <a 
                className="primary-button" 
                href={hasEmployerSession ? '/employer/dashboard' : '/employer/signin'} 
              >
                {hasEmployerSession ? 'Go to dashboard' : 'Login/Sign up'}
              </a>
              <a className="secondary-button" href="#features">
                Know more
              </a>
            </div>
            <div className="hero-stats" aria-label="Employer stats">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <strong>{stat.number}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <div className="employer-hero-image">
              <div className="placeholder-box">
                <span className="placeholder-text">Hire with AI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="content-section">
        <div className="container">
          <SectionHeading 
            title="A single platform for your hiring needs"
            subtitle="Everything you need to hire top talent"
          />
          <div className="features-grid">
            {employerFeatures.map((feature, index) => (
              <a className="feature-card" href={feature.href ?? '#features'} key={index}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="ai-calling-section">
        <div className="container">
          <div className="ai-calling-header">
            <SectionHeading 
              title="JOB WITH AI CALLING AGENT"
              subtitle="AI Calling Agent interviews and shortlists candidates 24/7"
            />
          </div>
          <div className="ai-calling-features">
            {aiCallingFeatures.map((feature, index) => (
              <div className="ai-calling-card" key={index}>
                <div className="ai-calling-number">{index + 1}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="ai-calling-stats">
            <div className="stat-item">
              <strong>80% response rate with AI</strong>
              <span>Compared to just 30% call connection rate in manual hiring</span>
            </div>
          </div>
          <div className="ai-calling-cta">
            <a 
              className="primary-button"
              href={hasEmployerSession ? '/employer/dashboard' : '/employer/signin'}
            >
              {hasEmployerSession ? 'Go to dashboard' : 'Post a job now'}
            </a>
          </div>
        </div>
      </section>

      <section className="prep-banner">
        <div className="container prep-card">
          <div className="prep-icon">
            <span className="icon-text">🎓</span>
          </div>
          <div className="prep-copy">
            <p>Campus Hiring</p>
            <h3>JobFinder CampusAI - Unlock opportunities, one challenge at a time</h3>
          </div>
          <a className="inline-link" href="#contact">
            Book a demo
          </a>
        </div>
      </section>

      <section id="pricing" className="content-section">
        <div className="container">
          <SectionHeading 
            title="Simple, Transparent Pricing"
            subtitle="Choose the plan that fits your hiring needs"
          />
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Starter</h3>
              <p className="price">Free</p>
              <ul>
                <li>Unlimited profile views</li>
                <li>Post 1 job</li>
                <li>Basic candidate database access</li>
              </ul>
              <button className="secondary-button">Get started</button>
            </div>
            <div className="pricing-card featured">
              <div className="badge">Popular</div>
              <h3>Professional</h3>
              <p className="price">₹5,000/month</p>
              <ul>
                <li>Unlimited profile views</li>
                <li>Unlimited job postings</li>
                <li>AI-powered candidate matching</li>
                <li>WhatsApp alerts</li>
                <li>CSV export</li>
              </ul>
              <button className="primary-button">Start free trial</button>
            </div>
            <div className="pricing-card">
              <h3>Enterprise</h3>
              <p className="price">Custom</p>
              <ul>
                <li>Everything in Professional</li>
                <li>AI Calling Agent</li>
                <li>Dedicated account manager</li>
                <li>Custom integrations</li>
                <li>Priority support</li>
              </ul>
              <a href="#contact" className="secondary-button">Contact sales</a>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to hire your next great candidate?</h2>
            <p>A hiring platform built to solve for relevancy, volume and speed of hiring</p>
            <div className="cta-buttons">
              <a 
                className="primary-button" 
                href={hasEmployerSession ? '/employer/dashboard' : '/employer/signin'} 
              >
                {hasEmployerSession ? 'Go to dashboard' : 'Login/Sign up'}
              </a>
              <a className="secondary-button" href="#contact">
                Contact sales
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <JobFinderLogo />
            <p>Hire top talent on JobFinder</p>
          </div>
          <div>
            <h4>Product</h4>
            <div className="footer-links">
              <a href="/employer">Job posting</a>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="/contact-us">Contact support</a>
            </div>
          </div>
          <div>
            <h4>Company</h4>
            <div className="footer-links">
              <a href="#testimonials">Testimonials</a>
              <a href="/contact-us">Contact sales</a>
              <a href="/">Back to Candidates</a>
            </div>
          </div>
          <div>
            <h4>Legal</h4>
            <div className="footer-links">
              <a href="/privacy">Privacy policy</a>
              <a href="/terms">Terms & Conditions</a>
              <a href="/terms-of-service">Terms of service</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
