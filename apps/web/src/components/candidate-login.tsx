'use client';

import { LoginModal } from '@jobfinder/ui';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type CandidateSession = {
  phoneNumber: string;
  role: CandidateRole;
  name?: string;
  preferredCity?: string;
  loggedInAt: string;
  profileComplete: boolean;
  resumeUploaded: boolean;
};

// ─── Storage keys ─────────────────────────────────────────────────────────────

const candidateSessionKey = 'jobfinder-candidate-session';
const candidateApplicationsKey = 'jobfinder-candidate-applications';
const employerSessionKey = 'jobfinder-employer-session';

function readCandidateSession(): CandidateSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(candidateSessionKey);
    return stored ? (JSON.parse(stored) as CandidateSession) : null;
  } catch {
    return null;
  }
}

function writeCandidateSession(
  phoneNumber: string,
  role: CandidateRole,
  extras: { name?: string; preferredCity?: string; profileComplete?: boolean; resumeUploaded?: boolean } = {},
) {
  const existing = readCandidateSession();

  // If a different user is logging in, clear the previous user's applications
  // to prevent cross-user data leakage in localStorage.
  if (existing && existing.phoneNumber !== phoneNumber) {
    window.localStorage.removeItem(candidateApplicationsKey);
    window.dispatchEvent(new Event('candidate-application-change'));
  }

  const session: CandidateSession = {
    phoneNumber,
    role,
    name: extras.name ?? existing?.name,
    preferredCity: extras.preferredCity ?? existing?.preferredCity,
    loggedInAt: existing?.loggedInAt ?? new Date().toISOString(),
    profileComplete: extras.profileComplete ?? existing?.profileComplete ?? false,
    resumeUploaded: extras.resumeUploaded ?? existing?.resumeUploaded ?? false,
  };
  window.localStorage.setItem(candidateSessionKey, JSON.stringify(session));
  window.dispatchEvent(new Event('candidate-session-change'));
  return session;
}

function clearCandidateSession() {
  window.localStorage.removeItem(candidateSessionKey);
  window.localStorage.removeItem(candidateApplicationsKey);
  window.dispatchEvent(new Event('candidate-session-change'));
  window.dispatchEvent(new Event('candidate-application-change'));
}

// ─── Application helpers ──────────────────────────────────────────────────────

function readCandidateApplications(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(candidateApplicationsKey);
    const apps = stored ? JSON.parse(stored) : [];
    return Array.isArray(apps) ? apps.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function markApplicationLocal(jobId: string) {
  const apps = new Set(readCandidateApplications());
  apps.add(jobId);
  window.localStorage.setItem(candidateApplicationsKey, JSON.stringify(Array.from(apps)));
  window.dispatchEvent(new Event('candidate-application-change'));
}

async function submitApplication(phoneNumber: string, jobId: string) {
  markApplicationLocal(jobId);
  try {
    await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phoneNumber, jobId }),
    });
  } catch {
    // Server write is best-effort; local state is the source of truth for UI
  }
}

async function registerCandidate(
  phoneNumber: string,
  role: CandidateRole,
  extras: { name?: string; preferredCity?: string } = {},
) {
  try {
    await fetch('/api/candidate/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phoneNumber, role, ...extras }),
    });
  } catch {
    // Best-effort
  }
}

// ─── Employer session helpers ─────────────────────────────────────────────────

function readEmployerSession() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(employerSessionKey);
  } catch {
    return null;
  }
}

function clearEmployerSession() {
  window.localStorage.removeItem(employerSessionKey);
  window.dispatchEvent(new Event('employer-session-change'));
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useCandidateSession() {
  const [session, setSession] = useState<CandidateSession | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sync = () => setSession(readCandidateSession());
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('candidate-session-change', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('candidate-session-change', sync);
    };
  }, []);

  return mounted ? session : null;
}

function useHasEmployerSession() {
  const [has, setHas] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sync = () => setHas(Boolean(readEmployerSession()));
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('employer-session-change', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('employer-session-change', sync);
    };
  }, []);

  return mounted && has;
}

function useHasCandidateApplied(jobId: string) {
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const sync = () => setHasApplied(readCandidateApplications().includes(jobId));
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('candidate-application-change', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('candidate-application-change', sync);
    };
  }, [jobId]);

  return hasApplied;
}

// ─── Profile setup modal ──────────────────────────────────────────────────────

type ProfileSetupProps = {
  phoneNumber: string;
  role: CandidateRole;
  onComplete: (name: string, preferredCity: string) => void;
  onSkip: () => void;
};

const indianCities = [
  'Bengaluru/Bangalore',
  'Mumbai/Bombay',
  'Delhi-NCR',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Kolkata/Calcutta',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Chandigarh',
  'Indore',
  'Surat',
  'Coimbatore',
  'Kochi',
  'Gurugram',
  'Noida',
  'Patna',
  'Bhopal',
  'Nagpur',
];

function ProfileSetupModal({ phoneNumber, role, onComplete, onSkip }: ProfileSetupProps) {
  const [name, setName] = useState('');
  const [preferredCity, setPreferredCity] = useState('');
  const [nameError, setNameError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError('Please enter your name');
      return;
    }
    onComplete(name.trim(), preferredCity);
  };

  if (!isMounted) return null;

  return createPortal(
    <>
      <div className="login-modal-backdrop" role="presentation" />
      <div className="login-modal-container" role="dialog" aria-modal="true" aria-labelledby="profile-setup-heading">
        <div className="login-modal profile-setup-modal">
          <div className="profile-setup-header">
            <span className="profile-setup-badge">Step 2 of 2</span>
            <h2 id="profile-setup-heading" className="login-modal-title">Complete your profile</h2>
            <p className="login-modal-subtitle">
              Help employers find you faster. Takes 30 seconds.
            </p>
          </div>

          <div className="profile-setup-role-tag">
            <span>
              {role === 'fresher' && '🎓'}
              {role === 'experienced' && '💼'}
              {role === 'blue-collar' && '🔧'}
              {role === 'white-collar' && '👔'}
              {role === 'part-time' && '⏰'}
              {role === 'remote' && '🏠'}
              {' '}
              {role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')} job seeker
            </span>
          </div>

          <div className="profile-setup-fields">
            <div className="profile-setup-field">
              <label htmlFor="profile-name">Your name <span aria-hidden="true">*</span></label>
              <input
                id="profile-name"
                type="text"
                placeholder="Eg: Rahul Sharma"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError('');
                }}
                autoFocus
                autoComplete="name"
              />
              {nameError && <p className="login-modal-error" role="alert">{nameError}</p>}
            </div>

            <div className="profile-setup-field">
              <label htmlFor="profile-city">Preferred job city</label>
              <select
                id="profile-city"
                value={preferredCity}
                onChange={(e) => setPreferredCity(e.target.value)}
              >
                <option value="">Select a city (optional)</option>
                {indianCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="profile-setup-actions">
            <button type="button" className="login-modal-button" onClick={handleSubmit}>
              SAVE &amp; CONTINUE
            </button>
            <button type="button" className="profile-setup-skip" onClick={onSkip}>
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

// ─── Resume upload modal ──────────────────────────────────────────────────────

type ResumeUploadProps = {
  phoneNumber: string;
  onComplete: (resumeUrl: string) => void;
  onSkip: () => void;
};

const ACCEPTED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ACCEPTED_EXTENSIONS = ['.pdf', '.docx'];
const MAX_SIZE_MB = 5;

function ResumeUploadModal({ phoneNumber, onComplete, onSkip }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  function validateFile(f: File): string {
    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ACCEPTED_EXTENSIONS.includes(`.${ext}`)) {
      return 'Only PDF and DOCX files are allowed';
    }
    if (!ACCEPTED_TYPES.includes(f.type)) {
      return 'Only PDF and DOCX files are allowed';
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File must be under ${MAX_SIZE_MB} MB`;
    }
    return '';
  }

  function handleFileChange(f: File) {
    const err = validateFile(f);
    if (err) {
      setFileError(err);
      setFile(null);
    } else {
      setFileError('');
      setFile(f);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFileChange(f);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileChange(f);
  }

  async function handleUpload() {
    if (!file) {
      setFileError('Please select a resume file to continue');
      return;
    }
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append('resume', file);
      form.append('phone', phoneNumber);
      const res = await fetch('/api/candidate/resume', { method: 'POST', body: form });
      const data = (await res.json()) as { ok: boolean; resumeUrl?: string; message?: string };
      if (!data.ok) {
        setFileError(data.message ?? 'Upload failed. Please try again.');
        return;
      }
      onComplete(data.resumeUrl ?? '');
    } catch {
      setFileError('Upload failed. Please check your connection and try again.');
    } finally {
      setIsUploading(false);
    }
  }

  if (!isMounted) return null;

  const fileIcon = file?.name.endsWith('.pdf') ? '📄' : file ? '📝' : null;

  return createPortal(
    <>
      <div className="login-modal-backdrop" role="presentation" />
      <div
        className="login-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-upload-heading"
      >
        <div className="login-modal resume-upload-modal">
          <div className="profile-setup-header">
            <span className="profile-setup-badge">Step 3 of 3</span>
            <h2 id="resume-upload-heading" className="login-modal-title">
              Upload your resume
            </h2>
            <p className="login-modal-subtitle">
              Employers need your resume to consider you for jobs. PDF or DOCX, up to 5 MB.
            </p>
          </div>

          {/* Drop zone */}
          <div
            className={`resume-dropzone${isDragging ? ' resume-dropzone--active' : ''}${file ? ' resume-dropzone--has-file' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Click or drag to upload resume"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleInputChange}
              className="resume-file-input"
              aria-hidden="true"
              tabIndex={-1}
            />
            {file ? (
              <div className="resume-file-preview">
                <span className="resume-file-icon" aria-hidden="true">{fileIcon}</span>
                <div className="resume-file-info">
                  <span className="resume-file-name">{file.name}</span>
                  <span className="resume-file-size">{(file.size / 1024).toFixed(0)} KB</span>
                </div>
                <button
                  type="button"
                  className="resume-file-remove"
                  aria-label="Remove file"
                  onClick={(e) => { e.stopPropagation(); setFile(null); setFileError(''); if (inputRef.current) inputRef.current.value = ''; }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="resume-dropzone-placeholder">
                <span className="resume-upload-icon" aria-hidden="true">📎</span>
                <p className="resume-dropzone-text">
                  <strong>Click to browse</strong> or drag &amp; drop
                </p>
                <p className="resume-dropzone-hint">PDF or DOCX · Max 5 MB</p>
              </div>
            )}
          </div>

          {fileError && (
            <p className="login-modal-error resume-upload-error" role="alert">
              {fileError}
            </p>
          )}

          <div className="profile-setup-actions">
            <button
              type="button"
              className="login-modal-button"
              onClick={handleUpload}
              disabled={isUploading}
              aria-busy={isUploading}
            >
              {isUploading ? 'Uploading…' : 'UPLOAD & FINISH'}
            </button>
            <button type="button" className="profile-setup-skip" onClick={onSkip}>
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

// ─── CandidateHeaderActions ───────────────────────────────────────────────────

export function CandidateHeaderActions() {
  const session = useCandidateSession();
  const hasEmployerSession = useHasEmployerSession();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [pendingLogin, setPendingLogin] = useState<{ phone: string; role: CandidateRole } | null>(null);
  const [pendingResume, setPendingResume] = useState<{ phone: string; role: CandidateRole; name?: string; preferredCity?: string } | null>(null);

  const handleLoginSubmit = (phoneNumber: string, role: CandidateRole) => {
    setIsLoginOpen(false);
    const existing = readCandidateSession();
    // If they've already completed the full onboarding, skip setup
    if (existing?.profileComplete && existing?.resumeUploaded) {
      writeCandidateSession(phoneNumber, role);
      registerCandidate(phoneNumber, role);
    } else {
      setPendingLogin({ phone: phoneNumber, role });
    }
  };

  const handleProfileComplete = (name: string, preferredCity: string) => {
    if (!pendingLogin) return;
    // Move to resume upload step
    setPendingResume({ phone: pendingLogin.phone, role: pendingLogin.role, name, preferredCity });
    setPendingLogin(null);
  };

  const handleProfileSkip = () => {
    if (!pendingLogin) return;
    // Move to resume upload step even if profile was skipped
    setPendingResume({ phone: pendingLogin.phone, role: pendingLogin.role });
    setPendingLogin(null);
  };

  const handleResumeComplete = (_resumeUrl: string) => {
    if (!pendingResume) return;
    writeCandidateSession(pendingResume.phone, pendingResume.role, {
      name: pendingResume.name,
      preferredCity: pendingResume.preferredCity,
      profileComplete: Boolean(pendingResume.name),
      resumeUploaded: true,
    });
    registerCandidate(pendingResume.phone, pendingResume.role, {
      name: pendingResume.name,
      preferredCity: pendingResume.preferredCity,
    });
    setPendingResume(null);
  };

  const handleResumeSkip = () => {
    if (!pendingResume) return;
    writeCandidateSession(pendingResume.phone, pendingResume.role, {
      name: pendingResume.name,
      preferredCity: pendingResume.preferredCity,
      profileComplete: Boolean(pendingResume.name),
      resumeUploaded: false,
    });
    registerCandidate(pendingResume.phone, pendingResume.role, {
      name: pendingResume.name,
      preferredCity: pendingResume.preferredCity,
    });
    setPendingResume(null);
  };

  const displayName = session?.name
    ? session.name.split(' ')[0]
    : session
      ? `+91 ···${session.phoneNumber.slice(-4)}`
      : null;

  return (
    <>
      <a className="text-link" href="/">
        Download JobFinder app
      </a>
      <a className="text-link" href="/contact-us">
        Contact us
      </a>

      {session ? (
        /* ── Candidate logged in ── */
        <div className="candidate-session-info">
          {session.name && (
            <span className="candidate-greeting">Hi, {displayName}</span>
          )}
          <button className="text-link topbar-link-button" onClick={clearCandidateSession} type="button">
            Logout
          </button>
        </div>
      ) : hasEmployerSession ? (
        /* ── Employer logged in ── */
        <>
          <a className="text-link" href="/employer/dashboard">
            Dashboard
          </a>
          <button className="text-link topbar-link-button" onClick={clearEmployerSession} type="button">
            Logout
          </button>
        </>
      ) : (
        /* ── Not logged in ── */
        <>
          <button className="text-link topbar-link-button" onClick={() => setIsLoginOpen(true)} type="button">
            Login
          </button>
          <div className="switch-pill" aria-label="User type">
            <button className="is-active" type="button" disabled>
              Candidate
            </button>
            <a href="/employer" className="switch-pill-employer-btn">
              Employer
            </a>
          </div>
        </>
      )}

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSubmit={handleLoginSubmit}
      />

      {pendingLogin ? (
        <ProfileSetupModal
          phoneNumber={pendingLogin.phone}
          role={pendingLogin.role}
          onComplete={handleProfileComplete}
          onSkip={handleProfileSkip}
        />
      ) : null}

      {pendingResume ? (
        <ResumeUploadModal
          phoneNumber={pendingResume.phone}
          onComplete={handleResumeComplete}
          onSkip={handleResumeSkip}
        />
      ) : null}
    </>
  );
}

// ─── CandidateApplyButton ─────────────────────────────────────────────────────

type CandidateApplyButtonProps = {
  className?: string;
  jobId?: string;
  label?: string;
};

export function CandidateApplyButton({
  className,
  jobId = 'candidate-profile',
  label = 'Apply Now',
}: CandidateApplyButtonProps) {
  const session = useCandidateSession();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [pendingLogin, setPendingLogin] = useState<{ phone: string; role: CandidateRole } | null>(null);
  const [pendingResume, setPendingResume] = useState<{ phone: string; role: CandidateRole; name?: string; preferredCity?: string } | null>(null);
  const hasApplied = useHasCandidateApplied(jobId);
  const canShowApplied = Boolean(session && hasApplied);

  const completeApplication = (phoneNumber: string) => {
    submitApplication(phoneNumber, jobId);
  };

  const handleApply = () => {
    if (!session) {
      setIsLoginOpen(true);
      return;
    }
    completeApplication(session.phoneNumber);
  };

  const handleLoginSubmit = (phoneNumber: string, role: CandidateRole) => {
    setIsLoginOpen(false);
    const existing = readCandidateSession();
    if (existing?.profileComplete && existing?.resumeUploaded) {
      writeCandidateSession(phoneNumber, role);
      registerCandidate(phoneNumber, role);
      completeApplication(phoneNumber);
    } else {
      setPendingLogin({ phone: phoneNumber, role });
    }
  };

  const handleProfileComplete = (name: string, preferredCity: string) => {
    if (!pendingLogin) return;
    // Move to resume upload step
    setPendingResume({ phone: pendingLogin.phone, role: pendingLogin.role, name, preferredCity });
    setPendingLogin(null);
  };

  const handleProfileSkip = () => {
    if (!pendingLogin) return;
    // Move to resume upload step even if profile was skipped
    setPendingResume({ phone: pendingLogin.phone, role: pendingLogin.role });
    setPendingLogin(null);
  };

  const handleResumeComplete = (_resumeUrl: string) => {
    if (!pendingResume) return;
    writeCandidateSession(pendingResume.phone, pendingResume.role, {
      name: pendingResume.name,
      preferredCity: pendingResume.preferredCity,
      profileComplete: Boolean(pendingResume.name),
      resumeUploaded: true,
    });
    registerCandidate(pendingResume.phone, pendingResume.role, {
      name: pendingResume.name,
      preferredCity: pendingResume.preferredCity,
    });
    completeApplication(pendingResume.phone);
    setPendingResume(null);
  };

  const handleResumeSkip = () => {
    if (!pendingResume) return;
    writeCandidateSession(pendingResume.phone, pendingResume.role, {
      name: pendingResume.name,
      preferredCity: pendingResume.preferredCity,
      profileComplete: Boolean(pendingResume.name),
      resumeUploaded: false,
    });
    registerCandidate(pendingResume.phone, pendingResume.role, {
      name: pendingResume.name,
      preferredCity: pendingResume.preferredCity,
    });
    completeApplication(pendingResume.phone);
    setPendingResume(null);
  };

  return (
    <>
      <button
        aria-pressed={canShowApplied}
        className={className}
        disabled={canShowApplied}
        onClick={handleApply}
        type="button"
      >
        {canShowApplied ? '✓ Applied' : label}
      </button>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSubmit={handleLoginSubmit}
      />

      {pendingLogin ? (
        <ProfileSetupModal
          phoneNumber={pendingLogin.phone}
          role={pendingLogin.role}
          onComplete={handleProfileComplete}
          onSkip={handleProfileSkip}
        />
      ) : null}

      {pendingResume ? (
        <ResumeUploadModal
          phoneNumber={pendingResume.phone}
          onComplete={handleResumeComplete}
          onSkip={handleResumeSkip}
        />
      ) : null}
    </>
  );
}
