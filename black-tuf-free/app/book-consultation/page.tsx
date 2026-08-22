"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitBooking } from "@/services/leads";
import { useActiveServices } from "@/hooks/use-services";
import { PublicShell } from "@/features/site/shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarCheck, Loader2 } from "lucide-react";

export default function BookConsultationPage() {
  const { services } = useActiveServices();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, startPending] = useTransition();

  const submit = () => {
    if (!name || !email || !date || !time) {
      toast.error("Please fill in your name, email, preferred date and time.");
      return;
    }
    startPending(async () => {
      try {
        await submitBooking({
          name,
          email,
          phone: phone || null,
          service: service || null,
          preferred_date: date,
          preferred_time: time,
          notes: notes || undefined,
        });
        toast.success("Consultation booked", { description: "We'll confirm your slot shortly." });
        setName("");
        setEmail("");
        setPhone("");
        setService("");
        setDate("");
        setTime("");
        setNotes("");
      } catch (e: any) {
        toast.error("Failed to book", { description: e.message });
      }
    });
  };

  return (
    <PublicShell>
      <section className="container mx-auto flex min-h-[70vh] items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          <Card className="glass-strong">
            <CardContent className="pt-8 space-y-4">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
                  <CalendarCheck className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Book a consultation</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  A free 30-minute call with an engineer to scope your project.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bk-name">Name</Label>
                  <Input id="bk-name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bk-email">Email</Label>
                  <Input id="bk-email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bk-phone">Phone (optional)</Label>
                  <Input id="bk-phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bk-service">Service (optional)</Label>
                  <select
                    id="bk-service"
                    name="service"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  >
                    <option value="">Not sure yet</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bk-date">Preferred date</Label>
                  <Input id="bk-date" name="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bk-time">Preferred time</Label>
                  <Input id="bk-time" name="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bk-notes">Notes (optional)</Label>
                <Textarea id="bk-notes" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything you'd like to discuss…" />
              </div>

              <Button className="w-full" onClick={submit} disabled={pending}>
                {pending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CalendarCheck className="h-4 w-4 mr-1" />}
                {pending ? "Booking…" : "Book consultation"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicShell>
  );
}
