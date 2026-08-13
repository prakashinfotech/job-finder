'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (phoneNumber: string, role: CandidateRole) => void;
}

export type CandidateRole = 'fresher' | 'experienced' | 'blue-collar' | 'white-collar' | 'part-time' | 'remote';

type LoginStep = 'phone' | 'otp' | 'role';

const roleOptions: { value: CandidateRole; label: string; emoji: string }[] = [
  { value: 'fresher', label: 'Fresher', emoji: '🎓' },
  { value: 'experienced', label: 'Experienced', emoji: '💼' },
  { value: 'blue-collar', label: 'Blue-collar', emoji: '🔧' },
  { value: 'white-collar', label: 'White-collar', emoji: '👔' },
  { value: 'part-time', label: 'Part-time', emoji: '⏰' },
  { value: 'remote', label: 'Remote', emoji: '🏠' },
];

export function LoginModal({ isOpen, onClose, onSubmit }: LoginModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [selectedRole, setSelectedRole] = useState<CandidateRole | null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState<LoginStep>('phone');
  const [isMounted, setIsMounted] = useState(false);

  const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');

  const validatePhoneNumber = (number: string): boolean => {
    const cleaned = number.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const resetFlow = () => {
    setError('');
    setOtp('');
    setSelectedRole(null);
    setStep('phone');
  };

  const handleClose = () => {
    resetFlow();
    onClose();
  };

  const handlePhoneSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber.trim()) {
      setError('Please enter your mobile number');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setStep('otp');
    setOtp('');
  };

  const handleOtpSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    if (otp !== '123456') {
      setError('That OTP did not match. Try 123456 for this demo.');
      return;
    }

    setStep('role');
  };

  const handleRoleSubmit = () => {
    if (!selectedRole) {
      setError('Please select your job type to continue');
      return;
    }

    onSubmit?.(cleanedPhoneNumber, selectedRole);
    setPhoneNumber('');
    resetFlow();
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isOpen) return null;

  return createPortal(
    <>
      <div className="login-modal-backdrop" onClick={handleClose} role="presentation" />

      <div className="login-modal-container" role="dialog" aria-modal="true" aria-labelledby="login-modal-heading">
        <div className="login-modal">
          <button
            className="login-modal-close"
            onClick={handleClose}
            aria-label="Close dialog"
            type="button"
          >
            ×
          </button>

          {step === 'phone' ? (
            <>
              <h2 className="login-modal-title" id="login-modal-heading">Enter your mobile number</h2>

              <form onSubmit={handlePhoneSubmit} className="login-modal-form">
                <div className="login-modal-input-group">
                  <span className="login-modal-prefix">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="Eg: 9876543210"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                      setError('');
                    }}
                    maxLength={10}
                    className="login-modal-input"
                    autoFocus
                    aria-label="Mobile number"
                  />
                </div>

                {error && <p className="login-modal-error" role="alert">{error}</p>}

                <p className="login-modal-terms">
                  By continuing, you agree to the JobFinder's{' '}
                  <a href="/terms" className="login-modal-link">
                    Terms of service
                  </a>
                  {' '}and{' '}
                  <a href="/privacy" className="login-modal-link">
                    Privacy Policy
                  </a>
                </p>

                <button type="submit" className="login-modal-button">
                  NEXT
                </button>
              </form>
            </>
          ) : step === 'otp' ? (
            <>
              <button
                className="login-modal-back-button"
                onClick={() => {
                  setStep('phone');
                  setError('');
                }}
                type="button"
              >
                ← Back
              </button>
              <h2 className="login-modal-title" id="login-modal-heading">Enter OTP</h2>
              <p className="login-modal-subtitle">
                We sent a 6-digit code to +91 {cleanedPhoneNumber}. Use 123456 for this demo.
              </p>

              <form onSubmit={handleOtpSubmit} className="login-modal-form">
                <div className="login-modal-input-group">
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setError('');
                    }}
                    maxLength={6}
                    className="login-modal-input login-modal-otp-input"
                    autoFocus
                    aria-label="One-time password"
                  />
                </div>

                {error && <p className="login-modal-error" role="alert">{error}</p>}

                <button type="submit" className="login-modal-button">
                  VERIFY OTP
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="login-modal-title" id="login-modal-heading">What describes you best?</h2>
              <p className="login-modal-subtitle">This helps us show you the most relevant jobs.</p>

              <div className="login-modal-role-grid" role="group" aria-label="Job seeker type">
                {roleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`login-modal-role-card${selectedRole === option.value ? ' is-selected' : ''}`}
                    onClick={() => {
                      setSelectedRole(option.value);
                      setError('');
                    }}
                    aria-pressed={selectedRole === option.value}
                  >
                    <span className="login-modal-role-emoji" aria-hidden="true">{option.emoji}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>

              {error && <p className="login-modal-error" role="alert">{error}</p>}

              <button
                type="button"
                className="login-modal-button"
                onClick={handleRoleSubmit}
                style={{ marginTop: '16px' }}
              >
                GET STARTED
              </button>
            </>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
