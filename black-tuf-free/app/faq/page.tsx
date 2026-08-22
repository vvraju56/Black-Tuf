import Link from "next/link";
import { PublicShell } from "@/features/site/shell";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const faqs = [
  {
    q: "How do I get a quote?",
    a: "Click \"Request a quote\" on any service page, fill in your requirements, and our team will review them and publish a quotation you can view under Invoices in your client portal.",
  },
  {
    q: "Do I need an account to request a quote?",
    a: "No. You can request a quote directly. But creating a free account gives you a portal where you can track the project, chat with the team and receive notifications.",
  },
  {
    q: "Can I track progress in real time?",
    a: "Yes. Projects, messages, files and notifications update live via Supabase Realtime, so you always see the latest state.",
  },
  {
    q: "How do on-site visits work?",
    a: "For on-site projects, you can request a site visit from the project detail page. Our team schedules an engineer to visit, inspect and update the visit status in your portal.",
  },
  {
    q: "Is my data secure?",
    a: "All data lives in PostgreSQL with Row Level Security. Auth is handled by Supabase Auth and files are stored in private buckets.",
  },
  {
    q: "Do you provide maintenance and support?",
    a: "Yes. Most plans include post-launch support, and we offer long-term maintenance agreements for web, mobile, IoT and industrial systems.",
  },
  {
    q: "Can I change the scope after a project starts?",
    a: "Yes. Scope changes are discussed with your project engineer and reflected as updates to the project and its quotation.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We issue invoices per project and accept bank transfer and UPI for domestic clients. International clients can pay via card.",
  },
];

export default function FaqPage() {
  return (
    <PublicShell>
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight">Frequently asked questions</h1>
          <p className="mt-4 text-muted-foreground">
            Everything you need to know about working with Black Tuf.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-2xl gap-4">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-xl border glass p-4 open:bg-muted/30">
              <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mx-auto mt-14 max-w-xl text-center">
          <h2 className="text-xl font-semibold">Still have questions?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Reach out and we'll get back within one business day.
          </p>
          <Button asChild className="mt-5">
            <Link href="/contact">Contact us <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </div>
      </section>
    </PublicShell>
  );
}
