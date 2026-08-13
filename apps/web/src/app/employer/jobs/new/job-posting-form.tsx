'use client';

import { useActionState, useEffect, useState } from 'react';
import { createJobPosting } from './actions';

const employerSessionKey = 'jobfinder-employer-session';

type CreateJobState = {
  ok: boolean;
  message: string;
  jobId?: string;
  fields?: Record<string, string>;
};

const initialCreateJobState: CreateJobState = {
  ok: false,
  message: '',
};

const LISTING_PLANS = [
  {
    key: 'free',
    label: 'Free listing',
    price: '₹0',
    description: 'Standard visibility in search results',
    features: ['Listed in search', 'Up to 50 applications'],
  },
  {
    key: 'premium',
    label: 'Premium boost',
    price: '₹999',
    description: 'Higher placement and more applicants',
    features: ['Top of search results', 'Unlimited applications', 'Highlighted badge'],
  },
  {
    key: 'featured',
    label: 'Featured placement',
    price: '₹2,499',
    description: 'Homepage and category featured slot',
    features: ['Homepage feature', 'Category spotlight', 'AI candidate matching', 'WhatsApp alerts'],
  },
  {
    key: 'urgent',
    label: 'Urgent hiring',
    price: '₹1,499',
    description: 'Urgent tag + priority notifications',
    features: ['Urgent badge', 'Push notifications to candidates', 'SMS alerts'],
  },
];

const SCREENING_QUESTION_TEMPLATES = [
  'Do you have a two-wheeler?',
  'Are you comfortable with field sales?',
  'What is your current CTC?',
  'Are you available to join immediately?',
  'Do you have prior experience in this role?',
];

function hasEmployerSession() {
  if (typeof window === 'undefined') {
    return false;
  }

  return Boolean(window.localStorage.getItem(employerSessionKey));
}

export function JobPostingForm() {
  const [state, formAction, isPending] = useActionState(createJobPosting, initialCreateJobState);
  const [isEmployerLoggedIn, setIsEmployerLoggedIn] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [screeningQuestions, setScreeningQuestions] = useState<string[]>(['']);
  const fields = state.fields ?? {};
  const formKey = state.ok ? `saved-${state.jobId ?? 'job'}` : state.message ? `error-${JSON.stringify(fields)}` : 'new';

  function addQuestion() {
    setScreeningQuestions((prev) => [...prev, '']);
  }

  function removeQuestion(idx: number) {
    setScreeningQuestions((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateQuestion(idx: number, value: string) {
    setScreeningQuestions((prev) => prev.map((q, i) => (i === idx ? value : q)));
  }

  function addTemplate(template: string) {
    setScreeningQuestions((prev) => {
      const empty = prev.findIndex((q) => q === '');
      if (empty !== -1) {
        return prev.map((q, i) => (i === empty ? template : q));
      }
      return [...prev, template];
    });
  }

  useEffect(() => {
    setIsEmployerLoggedIn(hasEmployerSession());
  }, []);

  // Reset screening questions when form resets after success
  useEffect(() => {
    if (state.ok) {
      setScreeningQuestions(['']);
      setSelectedPlan('free');
    }
  }, [state.ok]);

  if (!isEmployerLoggedIn) {
    return (
      <section className="job-posting-gate">
        <div className="container job-posting-gate-card">
          <h1>Sign in to post a job</h1>
          <p>Employer login is required before creating a new job posting.</p>
          <a className="primary-button" href="/employer/signin">
            Login/Sign up
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="job-posting-shell">
      <div className="container job-posting-layout">
        <aside className="job-posting-sidebar">
          <p className="signin-kicker">Smart job posting</p>
          <h1>Add a job posting</h1>
          <p>
            Capture the essentials candidates scan first: role, pay, location, shift, and clear
            expectations.
          </p>
          <div className="posting-checklist" aria-label="Posting checklist">
            <span>Company details</span>
            <span>Role information</span>
            <span>Candidate requirements</span>
            <span>Screening questions</span>
            <span>Listing plan</span>
            <span>Publish to database</span>
          </div>
        </aside>

        <form action={formAction} className="job-posting-form" key={formKey}>
          {state.message ? (
            <div className={state.ok ? 'posting-alert posting-alert-success' : 'posting-alert'}>
              <strong>{state.ok ? 'Job saved' : 'Check the form'}</strong>
              <span>{state.message}</span>
              {state.jobId ? <code>{state.jobId}</code> : null}
            </div>
          ) : null}

          <div className="posting-form-section">
            <div>
              <h2>Company</h2>
              <p>These details identify who is hiring.</p>
            </div>
            <div className="posting-field-grid">
              <label>
                Company name
                <input name="companyName" placeholder="Aarambh Services" defaultValue={fields.companyName} required />
              </label>
              <label>
                Department
                <select name="department" defaultValue={fields.department ?? 'Sales & BD'}>
                  <option>Customer Support</option>
                  <option>Sales & BD</option>
                  <option>Back Office</option>
                  <option>Delivery</option>
                  <option>Human Resources</option>
                  <option>Marketing</option>
                  <option>Operations</option>
                </select>
              </label>
            </div>
          </div>

          <div className="posting-form-section">
            <div>
              <h2>Job details</h2>
              <p>Keep this crisp and searchable.</p>
            </div>
            <div className="posting-field-grid">
              <label className="posting-field-wide">
                Job title
                <input name="title" placeholder="Field Sales Associate" defaultValue={fields.title} required />
              </label>
              <label>
                City
                <input name="city" placeholder="Bengaluru/Bangalore" defaultValue={fields.city} required />
              </label>
              <label>
                Locality
                <input name="location" placeholder="Koramangala, Bengaluru" defaultValue={fields.location} required />
              </label>
              <label>
                Work mode
                <select name="mode" defaultValue={fields.mode ?? 'Work from Office'}>
                  <option>Work from Office</option>
                  <option>Field Job</option>
                  <option>Work from Home</option>
                  <option>Hybrid</option>
                </select>
              </label>
              <label>
                Job type
                <select name="type" defaultValue={fields.type ?? 'Full Time'}>
                  <option>Full Time</option>
                  <option>Part Time</option>
                  <option>Internship</option>
                  <option>Contract</option>
                </select>
              </label>
              <label>
                Shift
                <select name="shift" defaultValue={fields.shift ?? 'Day Shift'}>
                  <option>Day Shift</option>
                  <option>Night Shift</option>
                  <option>Evening Shift</option>
                  <option>Flexible Shift</option>
                </select>
              </label>
              <label>
                Openings
                <input min={1} name="openings" type="number" defaultValue={fields.openings ?? '1'} required />
              </label>
            </div>
          </div>

          <div className="posting-form-section">
            <div>
              <h2>Compensation</h2>
              <p>Monthly salary range shown to candidates.</p>
            </div>
            <div className="posting-field-grid">
              <label>
                Minimum salary
                <input min={0} name="salaryMin" placeholder="18000" type="number" defaultValue={fields.salaryMin} />
              </label>
              <label>
                Maximum salary
                <input min={0} name="salaryMax" placeholder="26000" type="number" defaultValue={fields.salaryMax} />
              </label>
              <label>
                Experience
                <select name="experience" defaultValue={fields.experience ?? 'Any experience'}>
                  <option>Freshers only</option>
                  <option>Any experience</option>
                  <option>1 - 3 years</option>
                  <option>3+ years</option>
                </select>
              </label>
              <label>
                English level
                <select name="english" defaultValue={fields.english ?? 'Basic English'}>
                  <option>No English required</option>
                  <option>Basic English</option>
                  <option>Good English</option>
                  <option>Fluent English</option>
                </select>
              </label>
            </div>
          </div>

          <div className="posting-form-section">
            <div>
              <h2>Description</h2>
              <p>Use line breaks for lists where helpful.</p>
            </div>
            <div className="posting-field-grid">
              <label className="posting-field-wide">
                Job description
                <textarea
                  name="description"
                  placeholder="Describe the role, team, and day-to-day work."
                  defaultValue={fields.description}
                  required
                  rows={5}
                />
              </label>
              <label className="posting-field-wide">
                Skills
                <input
                  name="skills"
                  placeholder="Sales, Lead generation, Communication"
                  defaultValue={fields.skills}
                  required
                />
              </label>
              <label className="posting-field-wide">
                Responsibilities
                <textarea
                  name="responsibilities"
                  placeholder="One responsibility per line"
                  defaultValue={fields.responsibilities}
                  rows={4}
                />
              </label>
              <label className="posting-field-wide">
                Requirements
                <textarea
                  name="requirements"
                  placeholder="One requirement per line"
                  defaultValue={fields.requirements}
                  rows={4}
                />
              </label>
              <label className="posting-field-wide">
                Benefits
                <textarea name="benefits" placeholder="One benefit per line" defaultValue={fields.benefits} rows={3} />
              </label>
              <label className="posting-field-wide">
                Interview address
                <input
                  name="interviewAddress"
                  placeholder="Office address or online interview"
                  defaultValue={fields.interviewAddress}
                />
              </label>
            </div>
          </div>

          {/* Screening questions */}
          <div className="posting-form-section">
            <div>
              <h2>Screening questions</h2>
              <p>Ask candidates key questions before they apply to filter better matches.</p>
            </div>
            <div className="posting-field-grid">
              <div className="posting-field-wide screening-templates">
                <p className="screening-templates-label">Quick add from templates:</p>
                <div className="screening-template-chips">
                  {SCREENING_QUESTION_TEMPLATES.map((t) => (
                    <button
                      className="screening-template-chip"
                      key={t}
                      type="button"
                      onClick={() => addTemplate(t)}
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="posting-field-wide screening-questions-list">
                {screeningQuestions.map((q, idx) => (
                  <div className="screening-question-row" key={idx}>
                    <input
                      name={`screeningQuestion_${idx}`}
                      placeholder={`Question ${idx + 1}`}
                      value={q}
                      onChange={(e) => updateQuestion(idx, e.target.value)}
                    />
                    {screeningQuestions.length > 1 && (
                      <button
                        aria-label="Remove question"
                        className="screening-remove-btn"
                        type="button"
                        onClick={() => removeQuestion(idx)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  className="screening-add-btn"
                  type="button"
                  onClick={addQuestion}
                >
                  + Add another question
                </button>
              </div>
            </div>
          </div>

          {/* Monetization / listing plan */}
          <div className="posting-form-section">
            <div>
              <h2>Listing plan</h2>
              <p>Choose how you want to promote this job posting.</p>
            </div>
            <div className="posting-field-wide">
              <input name="listingPlan" type="hidden" value={selectedPlan} />
              <div className="listing-plans-grid">
                {LISTING_PLANS.map((plan) => (
                  <button
                    aria-pressed={selectedPlan === plan.key}
                    className={`listing-plan-card ${selectedPlan === plan.key ? 'is-selected' : ''}`}
                    key={plan.key}
                    type="button"
                    onClick={() => setSelectedPlan(plan.key)}
                  >
                    <div className="listing-plan-header">
                      <strong className="listing-plan-label">{plan.label}</strong>
                      <span className="listing-plan-price">{plan.price}</span>
                    </div>
                    <p className="listing-plan-desc">{plan.description}</p>
                    <ul className="listing-plan-features">
                      {plan.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="posting-submit-row">
            <a className="secondary-button" href="/employer/dashboard">
              Cancel
            </a>
            <button className="primary-button" disabled={isPending} type="submit">
              {isPending ? 'Publishing...' : 'Publish job'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
