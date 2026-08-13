'use client';

import { type FormEvent, useState } from 'react';

const employerSessionKey = 'jobfinder-employer-session';

const industries = [
  'Technology & IT',
  'Manufacturing',
  'Retail & E-commerce',
  'Healthcare & Pharma',
  'BFSI (Banking, Financial Services & Insurance)',
  'Logistics & Supply Chain',
  'Education & EdTech',
  'Hospitality & Travel',
  'Construction & Real Estate',
  'Media & Entertainment',
  'Telecom',
  'Agriculture & Food',
  'Other',
];

const hiringScales = [
  '1–10 hires/month',
  '11–50 hires/month',
  '51–200 hires/month',
  '200+ hires/month',
];

const companySizes = [
  '1–10 employees',
  '11–50 employees',
  '51–200 employees',
  '201–500 employees',
  '500+ employees',
];

type Step = 'company' | 'contact' | 'hiring' | 'done';

function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'company', label: 'Company' },
    { key: 'contact', label: 'HR Contact' },
    { key: 'hiring', label: 'Hiring Goals' },
    { key: 'done', label: 'Done' },
  ];
  const idx = steps.findIndex((s) => s.key === current);

  return (
    <div className="onboarding-steps" aria-label="Onboarding progress">
      {steps.map((step, i) => (
        <div
          key={step.key}
          className={`onboarding-step ${i <= idx ? 'is-active' : ''} ${i < idx ? 'is-done' : ''}`}
        >
          <span className="step-dot">{i < idx ? '✓' : i + 1}</span>
          <span className="step-label">{step.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function EmployerOnboardingPage() {
  const [step, setStep] = useState<Step>('company');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Company details
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [industry, setIndustry] = useState(industries[0]!);
  const [companySize, setCompanySize] = useState(companySizes[0]!);
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  // HR Contact
  const [hrName, setHrName] = useState('');
  const [hrEmail, setHrEmail] = useState('');
  const [hrDesignation, setHrDesignation] = useState('');

  // Hiring goals
  const [hiringScale, setHiringScale] = useState(hiringScales[0]!);
  const [hiringRoles, setHiringRoles] = useState('');
  const [candidateFilters, setCandidateFilters] = useState<string[]>([]);

  const filterOptions = ['Experience level', 'Location', 'Salary range', 'Skills', 'Education', 'Language'];

  function toggleFilter(f: string) {
    setCandidateFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
  }

  function handleCompanySubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!companyName.trim()) {
      setError('Company name is required.');
      return;
    }
    setStep('contact');
  }

  function handleContactSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!hrName.trim() || !hrEmail.trim()) {
      setError('HR name and email are required.');
      return;
    }
    setStep('hiring');
  }

  async function handleHiringSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const session = window.localStorage.getItem(employerSessionKey);
      if (!session) {
        window.location.href = '/employer/signin';
        return;
      }

      const payload = {
        companyName,
        gstNumber,
        industry,
        companySize,
        website,
        description,
        hrName,
        hrEmail,
        hrDesignation,
        hiringScale,
        hiringRoles,
        candidateFilters,
      };

      const res = await fetch('/api/employer/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json()) as { message?: string };
        setError(data.message ?? 'Something went wrong. Please try again.');
        return;
      }

      setStep('done');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (step === 'done') {
    return (
      <main className="onboarding-page">
        <div className="container onboarding-container">
          <div className="onboarding-done-card">
            <div className="onboarding-done-icon">🎉</div>
            <h1>You&apos;re all set!</h1>
            <p>
              Your company profile for <strong>{companyName}</strong> has been created. You can now
              post jobs, search candidates, and manage your hiring pipeline.
            </p>
            <div className="onboarding-done-actions">
              <a className="primary-button" href="/employer/jobs/new">
                Post your first job
              </a>
              <a className="secondary-button" href="/employer/dashboard">
                Go to dashboard
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="onboarding-page">
      <header className="onboarding-topbar">
        <div className="container onboarding-topbar-inner">
          <a className="onboarding-brand" href="/employer">
            <span className="onboarding-brand-text">jobfinder for employers</span>
          </a>
          <span className="onboarding-topbar-step">
            {step === 'company' ? 'Step 1 of 3' : step === 'contact' ? 'Step 2 of 3' : 'Step 3 of 3'}
          </span>
        </div>
      </header>

      <div className="container onboarding-container">
        <StepIndicator current={step} />

        {step === 'company' && (
          <div className="onboarding-card">
            <div className="onboarding-card-header">
              <h1>Tell us about your company</h1>
              <p>This helps candidates trust your job postings and improves match quality.</p>
            </div>

            <form className="onboarding-form" onSubmit={handleCompanySubmit}>
              {error ? <p className="onboarding-error">{error}</p> : null}

              <div className="onboarding-field-grid">
                <label className="onboarding-field-wide">
                  Company name <span className="required-star">*</span>
                  <input
                    placeholder="e.g. Aarambh Services Pvt. Ltd."
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </label>

                <label>
                  GST / Company registration number
                  <input
                    placeholder="22AAAAA0000A1Z5"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                  />
                </label>

                <label>
                  Industry <span className="required-star">*</span>
                  <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
                    {industries.map((ind) => (
                      <option key={ind}>{ind}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Company size
                  <select value={companySize} onChange={(e) => setCompanySize(e.target.value)}>
                    {companySizes.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Website
                  <input
                    placeholder="https://yourcompany.com"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </label>

                <label className="onboarding-field-wide">
                  Company description
                  <textarea
                    placeholder="Brief description of what your company does, culture, and why candidates should join."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </label>
              </div>

              <div className="onboarding-form-actions">
                <button className="primary-button" type="submit">
                  Continue →
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'contact' && (
          <div className="onboarding-card">
            <div className="onboarding-card-header">
              <h1>HR contact details</h1>
              <p>Candidates and our team will use this to reach the right person.</p>
            </div>

            <form className="onboarding-form" onSubmit={handleContactSubmit}>
              {error ? <p className="onboarding-error">{error}</p> : null}

              <div className="onboarding-field-grid">
                <label>
                  Full name <span className="required-star">*</span>
                  <input
                    placeholder="Priya Sharma"
                    required
                    value={hrName}
                    onChange={(e) => setHrName(e.target.value)}
                  />
                </label>

                <label>
                  Work email <span className="required-star">*</span>
                  <input
                    placeholder="priya@yourcompany.com"
                    required
                    type="email"
                    value={hrEmail}
                    onChange={(e) => setHrEmail(e.target.value)}
                  />
                </label>

                <label className="onboarding-field-wide">
                  Designation
                  <input
                    placeholder="HR Manager / Talent Acquisition Lead"
                    value={hrDesignation}
                    onChange={(e) => setHrDesignation(e.target.value)}
                  />
                </label>
              </div>

              <div className="onboarding-form-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setStep('company')}
                >
                  ← Back
                </button>
                <button className="primary-button" type="submit">
                  Continue →
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'hiring' && (
          <div className="onboarding-card">
            <div className="onboarding-card-header">
              <h1>Hiring goals & preferences</h1>
              <p>Help us personalise your dashboard and candidate recommendations.</p>
            </div>

            <form className="onboarding-form" onSubmit={handleHiringSubmit}>
              {error ? <p className="onboarding-error">{error}</p> : null}

              <div className="onboarding-field-grid">
                <label>
                  Hiring scale
                  <select value={hiringScale} onChange={(e) => setHiringScale(e.target.value)}>
                    {hiringScales.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>

                <label className="onboarding-field-wide">
                  Roles you typically hire for
                  <input
                    placeholder="e.g. Sales Executive, Delivery Partner, Customer Support"
                    value={hiringRoles}
                    onChange={(e) => setHiringRoles(e.target.value)}
                  />
                </label>

                <div className="onboarding-field-wide">
                  <p className="onboarding-filter-label">
                    Candidate filters you care about most
                  </p>
                  <div className="onboarding-filter-chips">
                    {filterOptions.map((f) => (
                      <button
                        className={`onboarding-chip ${candidateFilters.includes(f) ? 'is-selected' : ''}`}
                        key={f}
                        type="button"
                        onClick={() => toggleFilter(f)}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="onboarding-form-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setStep('contact')}
                >
                  ← Back
                </button>
                <button className="primary-button" disabled={isSubmitting} type="submit">
                  {isSubmitting ? 'Saving...' : 'Complete setup'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
