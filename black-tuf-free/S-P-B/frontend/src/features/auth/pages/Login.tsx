import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(form);
      navigate(from);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to continue to Black Tuf</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input name="email" label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} error={error || undefined} required autoComplete="email" />
          <Input name="password" label="Password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required autoComplete="current-password" />
          <Button type="submit" loading={submitting} className="w-full">Sign In</Button>
          {error && <p className="text-sm text-danger">{error}</p>}
        </form>
        <div className="mt-6 flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
          <span>
            No account? <Link to="/register" className="text-primary font-medium hover:underline">Register</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
