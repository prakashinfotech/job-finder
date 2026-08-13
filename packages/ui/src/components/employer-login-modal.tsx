'use client';

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface EmployerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (phoneNumber: string) => void;
}

type EmployerLoginStep = 'phone' | 'otp';

export function EmployerLoginModal({ isOpen, onClose, onSubmit }: EmployerLoginModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<EmployerLoginStep>('phone');
  const [isMounted, setIsMounted] = useState(false);

  const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');

  const resetFlow = () => {
    setError('');
    setOtp('');
    setStep('phone');
  };

  const handleClose = () => {
    resetFlow();
    onClose();
  };

  const handlePhoneSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (cleanedPhoneNumber.length !== 10) {
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

    onSubmit?.(cleanedPhoneNumber);
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

      <div className="login-modal-container" role="dialog" aria-modal="true">
        <div className="login-modal">
          <button className="login-modal-close" onClick={handleClose} aria-label="Close dialog" type="button">
            x
          </button>

          {step === 'phone' ? (
            <>
              <h2 className="login-modal-title">Sign in to your account</h2>
              <p className="login-modal-subtitle">Access your hiring dashboard and post jobs</p>

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
                  />
                </div>

                {error && <p className="login-modal-error">{error}</p>}

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
                  CONTINUE
                </button>
              </form>
            </>
          ) : (
            <>
              <button
                className="login-modal-back-button"
                onClick={() => {
                  setStep('phone');
                  setError('');
                }}
                type="button"
              >
                Back
              </button>
              <h2 className="login-modal-title">Enter OTP</h2>
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
                  />
                </div>

                {error && <p className="login-modal-error">{error}</p>}

                <button type="submit" className="login-modal-button">
                  VERIFY OTP
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
