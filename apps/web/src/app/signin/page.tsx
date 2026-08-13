'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

const hiringStats = [
  { value: '1 Crore+', label: 'Qualified candidates' },
  { value: '1 Lakh+', label: 'Employers use JobFinder' },
  { value: '892+', label: 'Available cities' },
];

const trustLogos = ['Swiggy', 'Zepto', 'Zomato', 'Rapido', 'Paytm'];
const employerSessionKey = 'jobfinder-employer-session';

type EmployerSession = {
  phoneNumber: string;
  loggedInAt: string;
};

type LoginStep = 'phone' | 'otp' | 'success';

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

export default function EmployerSigninPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<LoginStep>('phone');
  const [session, setSession] = useState<EmployerSession | null>(null);

  const normalizedPhone = phoneNumber.replace(/\D/g, '');

  const readEmployerSession = () => {
    try {
      const storedSession = window.localStorage.getItem(employerSessionKey);
      return storedSession ? (JSON.parse(storedSession) as EmployerSession) : null;
    } catch {
      return null;
    }
  };

  const writeEmployerSession = (nextPhoneNumber: string) => {
    const nextSession: EmployerSession = {
      phoneNumber: nextPhoneNumber,
      loggedInAt: new Date().toISOString(),
    };

    window.localStorage.setItem(employerSessionKey, JSON.stringify(nextSession));
    window.dispatchEvent(new Event('employer-session-change'));
    setSession(nextSession);
    setStep('success');
  };

  const clearEmployerSession = () => {
    window.localStorage.removeItem(employerSessionKey);
    window.dispatchEvent(new Event('employer-session-change'));
    setSession(null);
    setPhoneNumber('');
    setOtp('');
    setError('');
    setStep('phone');
  };

  const handlePhoneSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (normalizedPhone.length !== 10) {
      setError('Please enter a valid 10 digit mobile number');
      return;
    }

    setOtp('');
    setStep('otp');
  };

  const handleOtpSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the 6 digit OTP');
      return;
    }

    if (otp !== '123456') {
      setError('That OTP did not match. Try 123456 for this demo.');
      return;
    }

    writeEmployerSession(normalizedPhone);
  };

  useEffect(() => {
    const savedSession = readEmployerSession();

    if (savedSession) {
      setSession(savedSession);
      setPhoneNumber(savedSession.phoneNumber);
      setStep('success');
    }
  }, []);

  return (
    <main className="employer-signin-page">
      <header className="signin-topbar">
        <div className="container signin-topbar-inner">
          <a className="signin-brand" href="/employer" aria-label="JobFinder employer home">
            <JobFinderLogo />
            <span>for employers</span>
          </a>
          <nav className="signin-nav" aria-label="Employer sign in navigation">
            <a href="/employer">Product</a>
            <a href="/contact-us">Contact sales</a>
          </nav>
        </div>
      </header>

      <section className="signin-hero">
        <div className="container signin-hero-grid">
          <div className="signin-copy">
            <p className="signin-kicker">Hire top talent in 48 hours with JobFinder</p>
            <h1>Hire your dream team with JobFinder.</h1>
            <p className="signin-subtitle">
              Streamline your recruitment with AI-driven precision. Single solution from fresher to
              experienced hiring.
            </p>
            <div className="signin-actions">
              <a className="watch-video-button" href="/employer">
                Watch video
              </a>
            </div>
            <div className="signin-stats" aria-label="Employer hiring stats">
              {hiringStats.map((stat) => (
                <div key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <aside className="signin-card" aria-label="Employer login form">
            {step === 'success' && session ? (
              <div className="signin-success-panel">
                <span className="signin-success-eyebrow">Signed in</span>
                <h2>Welcome back</h2>
                <p>Recruiter account +91 {session.phoneNumber}</p>
                <a className="signin-submit signin-dashboard-link" href="/employer">
                  Go to employer home
                </a>
                <button className="enterprise-login-link signin-logout-button" onClick={clearEmployerSession} type="button">
                  Sign out
                </button>
              </div>
            ) : step === 'phone' ? (
              <>
                <h2>Let&apos;s get started</h2>
                <p>Hire top talent faster with JobFinder</p>
                <form className="signin-form" onSubmit={handlePhoneSubmit}>
                  <label htmlFor="mobile-number">Mobile number</label>
                  <div className="signin-phone-field">
                    <span>+91</span>
                    <input
                      id="mobile-number"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="Enter 10 digit mobile number"
                      type="tel"
                      value={phoneNumber}
                      onChange={(event) => {
                        setPhoneNumber(event.target.value.replace(/\D/g, '').slice(0, 10));
                        setError('');
                      }}
                    />
                  </div>
                  {error ? <span className="signin-error">{error}</span> : null}
                  <button className="signin-submit" type="submit">
                    Continue
                  </button>
                </form>
                <div className="signin-divider">
                  <span>OR</span>
                </div>
                <a className="enterprise-login-link" href="/contact-us">
                  Click here for Enterprise login
                </a>
                <p className="signin-terms">
                  By clicking continue, you agree to the JobFinder{' '}
                  <a href="/terms">Terms of service</a> & <a href="/privacy">Privacy policy</a>
                </p>
              </>
            ) : (
              <>
                <button
                  className="signin-back-button"
                  onClick={() => {
                    setStep('phone');
                    setError('');
                  }}
                  type="button"
                >
                  Back
                </button>
                <h2>Enter OTP</h2>
                <p>We sent a 6 digit code to +91 {normalizedPhone}. Use 123456 for this demo.</p>
                <form className="signin-form" onSubmit={handleOtpSubmit}>
                  <label htmlFor="employer-otp">OTP</label>
                  <div className="signin-phone-field">
                    <input
                      id="employer-otp"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter OTP"
                      type="tel"
                      value={otp}
                      onChange={(event) => {
                        setOtp(event.target.value.replace(/\D/g, '').slice(0, 6));
                        setError('');
                      }}
                    />
                  </div>
                  {error ? <span className="signin-error">{error}</span> : null}
                  <button className="signin-submit" type="submit">
                    Verify OTP
                  </button>
                </form>
              </>
            )}
          </aside>
        </div>
      </section>

      <section className="signin-trust-section">
        <div className="container signin-trust-grid">
          <div>
            <p className="signin-kicker">Trusted by hiring teams</p>
            <h2>Trusted by 1000+ enterprises and 7 lakhs+ MSMEs for hiring</h2>
          </div>
          <div className="signin-logo-row" aria-label="Trusted companies">
            {trustLogos.map((logo) => (
              <span key={logo}>{logo}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="signin-preview-section">
        <div className="container signin-preview-grid">
          <div className="signin-preview-copy">
            <p className="signin-kicker">Fast recruiter workflow</p>
            <h2>Start with a mobile number and post your first job in minutes.</h2>
            <p>
              Get relevant applicants, shortlist faster, and reach candidates through calls and
              WhatsApp alerts from one employer dashboard.
            </p>
          </div>
          <div className="signin-candidate-panel" aria-label="Candidate preview">
            <img
              alt="Employer hiring preview"
              src="https://storage.googleapis.com/mumbai_apnatime_prod/apna-home/two-people.png"
            />
            <div className="candidate-mini-card">
              <strong>Matched candidates</strong>
              <span>243 nearby applicants ready to interview</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
