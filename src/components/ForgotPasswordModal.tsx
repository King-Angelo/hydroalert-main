import React, { useEffect, useMemo, useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Mail, X } from 'lucide-react';
import { auth } from '../lib/firebase';

type ForgotPasswordModalProps = {
  isOpen: boolean;
  initialEmail?: string;
  onClose: () => void;
};

type Status = 'idle' | 'loading' | 'success' | 'error';

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  initialEmail,
  onClose,
}) => {
  const [email, setEmail] = useState(initialEmail ?? '');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string>('');

  const normalizedInitialEmail = useMemo(() => (initialEmail ?? '').trim(), [initialEmail]);

  useEffect(() => {
    if (!isOpen) return;
    setEmail(normalizedInitialEmail);
    setStatus('idle');
    setError('');
  }, [isOpen, normalizedInitialEmail]);

  useEffect(() => {
    if (!isOpen) return;
    if (status !== 'success') return;

    const t = window.setTimeout(() => onClose(), 3000);
    return () => window.clearTimeout(t);
  }, [isOpen, status, onClose]);

  const close = () => {
    if (status === 'loading') return;
    onClose();
  };

  const mapFirebaseError = (code?: string) => {
    if (code === 'auth/user-not-found') return 'No account found with this email';
    if (code === 'auth/invalid-email') return 'Please enter a valid email';
    return 'Failed to send reset email. Please try again.';
  };

  const handleSend = async () => {
    const trimmed = email.trim();
    setError('');

    if (!trimmed) {
      setError('Please enter your email address');
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      await sendPasswordResetEmail(auth, trimmed);
      setStatus('success');
    } catch (e: any) {
      setStatus('error');
      setError(mapFirebaseError(e?.code) || e?.message || 'Failed to send reset email. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        aria-label="Close password reset dialog"
        onClick={close}
      />

      <div className="relative z-[61] w-full max-w-sm bg-white/90 backdrop-blur-md p-6 rounded-[1.5rem] shadow-2xl border border-white/50">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-blue-900 tracking-tight">Reset your password</h2>
            <p className="text-sm text-slate-500 mt-1">
              We’ll email you a link to reset or set your password.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={status === 'loading'}
            className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-60"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {status === 'success' ? (
          <div className="bg-green-500/10 border border-green-500/20 text-green-700 p-3 rounded-lg text-sm text-center">
            Password reset email sent! Check your inbox.
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-3 rounded-lg text-sm text-center mb-3">
                {error}
              </div>
            )}

            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Email
            </label>
            <div className="relative mb-4">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-slate-800 focus:outline-none focus:border-blue-400 transition-all font-medium text-sm"
                placeholder="Enter your email"
                autoComplete="email"
                disabled={status === 'loading'}
              />
            </div>

            <button
              type="button"
              onClick={handleSend}
              disabled={status === 'loading'}
              className="w-full bg-[#0ea5e9] hover:bg-sky-400 disabled:opacity-70 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-sky-200"
            >
              {status === 'loading' && (
                <span
                  className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                  aria-hidden="true"
                />
              )}
              {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              onClick={close}
              disabled={status === 'loading'}
              className="w-full text-slate-400 hover:text-slate-600 font-semibold py-2 text-sm transition-colors mt-2 disabled:opacity-60"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

