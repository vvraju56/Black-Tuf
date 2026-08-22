import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' as 'customer' | 'seller' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await register(form);
      if (form.role === 'seller') {
        navigate('/seller/pending-approval');
      } else {
        navigate('/verify-email');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Join Black Tuf to start shopping</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input name="name" label="Full Name" placeholder="Jane Doe" value={form.name} onChange={handleChange} required />
          <Input name="email" label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required autoComplete="email" />
          <Input name="password" label="Password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
          <label className="flex items-center gap-2">
            <input type="radio" name="role" value="customer" checked={form.role === 'customer'} onChange={() => setForm({ ...form, role: 'customer' })} />
            <span>Customer</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="role" value="seller" checked={form.role === 'seller'} onChange={() => setForm({ ...form, role: 'seller' })} />
            <span>Seller</span>
          </label>
          <Button type="submit" loading={submitting} className="w-full">Sign Up</Button>
          {error && <p className="text-sm text-danger">{error}</p>}
        </form>
        <p className="mt-6 text-center text-sm">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
