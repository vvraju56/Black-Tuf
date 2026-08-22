import { useState } from 'react';
import { StaticPage } from '@/components/StaticPage';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { createTicket } from '@/lib/support-api';
import { toast } from 'react-hot-toast';
import { Mail, Phone, MapPin } from 'lucide-react';

const categories = ['general', 'order', 'payment', 'product', 'account', 'technical'];

export const Contact = () => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error('Please fill in both subject and message');
      return;
    }
    setSending(true);
    try {
      await createTicket({ subject, category, description });
      toast.success('Message sent! We will get back to you soon.');
      setSubject('');
      setDescription('');
      setCategory('general');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <StaticPage
      title="Contact Us"
      path="/contact"
      description="Get in touch with the Black Tuf team. We are here to help 7 days a week."
    >
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <Mail className="mt-1 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">support@blacktuf.com</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-1 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Phone</p>
              <p className="text-sm text-muted-foreground">1800-123-4567 (toll free, 9am - 9pm IST)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Office</p>
              <p className="text-sm text-muted-foreground">Black Tuf HQ, Bengaluru, Karnataka, India</p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-lg font-semibold">Send us a message</h2>
          <div>
            <label className="mb-1 block text-sm font-medium">Subject</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="How can we help?" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Message</label>
            <Textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell us more..." />
          </div>
          <Button type="submit" loading={sending} className="w-full">Send Message</Button>
        </form>
      </div>
    </StaticPage>
  );
};

export default Contact;
