import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { forgotPassword } from '@/lib/auth';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await forgotPassword(email);
      setDone(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Forgot password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {done
            ? 'If that email exists, a reset link has been sent. Check your inbox.'
            : 'Enter your email and we’ll send you a reset link.'}
        </p>
        {!done && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input name="email" label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            <Button type="submit" loading={submitting} className="w-full">Send Reset Link</Button>
            {error && <p className="text-sm text-danger">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
