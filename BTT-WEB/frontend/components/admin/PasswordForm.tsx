'use client';

import { useState } from 'react';
import { KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { AdminNotice } from '@/components/admin/AdminUI';
import { adminRequest, AdminApiError, fieldErrorsToMap } from '@/lib/admin';

function strength(value: string) {
  let score = 0;
  if (value.length >= 10) score += 1;
  if (value.length >= 14) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return Math.min(score, 4);
}

const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  const score = strength(newPassword);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setNotice('');
    setErrors({});

    const localErrors: Record<string, string> = {};
    if (!currentPassword) localErrors.currentPassword = 'Enter your current password.';
    if (newPassword.length < 10)
      localErrors.newPassword = 'Use at least 10 characters for the new password.';
    else if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword))
      localErrors.newPassword = 'Include at least one letter and one number.';
    if (confirmPassword !== newPassword)
      localErrors.confirmPassword = 'The two new passwords do not match.';

    if (Object.keys(localErrors).length) {
      setErrors(localErrors);
      setMessage('Please fix the highlighted fields.');
      setSaving(false);
      return;
    }

    try {
      await adminRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNotice('Password updated. Use the new password the next time you sign in.');
    } catch (error) {
      if (error instanceof AdminApiError) {
        setErrors(fieldErrorsToMap(error.fieldErrors));
        setMessage(error.message);
      } else {
        setMessage('Could not update the password. Try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {message ? <AdminNotice type="error">{message}</AdminNotice> : null}
      {notice ? <AdminNotice type="success">{notice}</AdminNotice> : null}

      <div>
        <label htmlFor="current-password" className="label">
          Current password
        </label>
        <input
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          className="field"
        />
        {errors.currentPassword ? (
          <p className="mt-1.5 text-[0.72rem] text-red-300">{errors.currentPassword}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="new-password" className="label">
          New password
        </label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          className="field"
        />
        {newPassword ? (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex h-1.5 flex-1 gap-1">
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={
                    index < score
                      ? 'flex-1 rounded-full bg-accent'
                      : 'flex-1 rounded-full bg-white/[0.08]'
                  }
                />
              ))}
            </div>
            <span className="text-[0.66rem] text-ink-faint">{STRENGTH_LABELS[score]}</span>
          </div>
        ) : null}
        {errors.newPassword ? (
          <p className="mt-1.5 text-[0.72rem] text-red-300">{errors.newPassword}</p>
        ) : (
          <p className="mt-1.5 text-[0.68rem] text-ink-faint">
            At least 10 characters, including a letter and a number.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="confirm-password" className="label">
          Confirm new password
        </label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="field"
        />
        {errors.confirmPassword ? (
          <p className="mt-1.5 text-[0.72rem] text-red-300">{errors.confirmPassword}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.07] pt-4">
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <KeyRound className="h-4 w-4" aria-hidden />
          )}
          {saving ? 'Updating…' : 'Update password'}
        </button>
        <span className="inline-flex items-center gap-1.5 text-[0.68rem] text-ink-faint">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Stored as a bcrypt hash
        </span>
      </div>
    </form>
  );
}
