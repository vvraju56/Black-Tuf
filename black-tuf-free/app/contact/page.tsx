"use client";

import { useState } from "react";
import { toast } from "sonner";
import { submitContactMessage } from "@/services/leads";
import { PublicShell } from "@/features/site/shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone, Send, Loader2 } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async () => {
    if (!name || !email || !message) {
      toast.error("Please fill in your name, email and message.");
      return;
    }
    setPending(true);
    try {
      await submitContactMessage({ name, email, subject: subject || null, message });
      toast.success("Message sent", { description: "We'll get back to you within one business day." });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (e: any) {
      toast.error("Failed to send", { description: e.message });
    } finally {
      setPending(false);
    }
  };

  return (
    <PublicShell>
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight">Contact us</h1>
          <p className="mt-4 text-muted-foreground">
            Have something to build? Drop us a line and we'll get back within one business day.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-xl gap-8 md:grid-cols-5">
          <Card className="glass md:col-span-3">
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input id="contact-name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input id="contact-email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-subject">Subject</Label>
                <Input id="contact-subject" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What's this about?" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-message">Message</Label>
                <Textarea id="contact-message" name="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us about your project…" />
              </div>
              <Button className="w-full" onClick={submit} disabled={pending}>
                {pending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                {pending ? "Sending…" : "Send message"}
              </Button>
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-4 text-sm">
            <div className="flex items-start gap-3 rounded-xl border glass p-4">
              <MapPin className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">Visit us</p>
                <p className="text-muted-foreground">Bengaluru, India · Remote-friendly</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border glass p-4">
              <Mail className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-muted-foreground">hello@black-tuf.example</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border glass p-4">
              <Phone className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-muted-foreground">+91 80 0000 0000</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
