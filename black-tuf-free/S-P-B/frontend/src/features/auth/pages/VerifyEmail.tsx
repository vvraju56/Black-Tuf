import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { verifyEmail, resetPassword } from '@/lib/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const VerifyEmail = () => {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (token) {
        await verifyEmail(token);
      }
      if (password) {
        await resetPassword(token || '', password);
      }
      setDone(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Verify email</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {done ? 'Your account is ready. You can now close this tab.' : 'Your email verification was received. Set a password to continue.'}
        </p>
        {!done && token && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input name="password" label="New Password" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            <Button type="submit" loading={submitting} className="w-full">Set Password</Button>
            {error && <p className="text-sm text-danger">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
