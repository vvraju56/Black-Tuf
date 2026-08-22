"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { submitQuoteRequest } from "@/services/leads";
import { useActiveServices } from "@/hooks/use-services";
import { PublicShell } from "@/features/site/shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";

function QuoteForm() {
  const searchParams = useSearchParams();
  const initialService = searchParams.get("service") ?? "";
  const { services } = useActiveServices();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState(initialService);
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [pending, startPending] = useTransition();

  const submit = () => {
    if (!name || !email || !service || !description) {
      toast.error("Please fill in your name, email, service and description.");
      return;
    }
    startPending(async () => {
      try {
        await submitQuoteRequest({ name, email, phone: phone || null, service, budget: budget || null, description });
        toast.success("Quote request sent", { description: "Our team will get back to you with an estimate." });
        setName("");
        setEmail("");
        setPhone("");
        setDescription("");
      } catch (e: any) {
        toast.error("Failed to send", { description: e.message });
      }
    });
  };

  return (
    <Card className="glass-strong">
      <CardContent className="pt-8 space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Request a quote</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell us what you need and we'll respond with an estimate.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="quote-name">Name</Label>
            <Input id="quote-name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quote-email">Email</Label>
            <Input id="quote-email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="quote-phone">Phone (optional)</Label>
            <Input id="quote-phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quote-service">Service</Label>
            <select
              id="quote-service"
              name="service"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="">Select a service</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="quote-budget">Budget range (optional)</Label>
          <select
            id="quote-budget"
            name="budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          >
            <option value="">Select a range</option>
            <option value="under-50k">Under ₹50,000</option>
            <option value="50k-1.5l">₹50,000 – ₹1,50,000</option>
            <option value="1.5l-5l">₹1,50,000 – ₹5,00,000</option>
            <option value="above-5l">Above ₹5,00,000</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="quote-description">Project description</Label>
          <Textarea id="quote-description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What do you want to build? Goals, timeline, references…" />
        </div>

        <Button className="w-full" onClick={submit} disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
          {pending ? "Sending…" : "Request a quote"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function RequestQuotePage() {
  return (
    <PublicShell>
      <section className="container mx-auto flex min-h-[70vh] items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          <Suspense fallback={null}>
            <QuoteForm />
          </Suspense>
        </div>
      </section>
    </PublicShell>
  );
}
