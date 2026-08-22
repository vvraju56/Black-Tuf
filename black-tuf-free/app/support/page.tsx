import Link from "next/link";
import { PublicShell } from "@/features/site/shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LifeBuoy, MessagesSquare, Mail, BookOpen, ArrowRight } from "lucide-react";

const channels = [
  {
    icon: MessagesSquare,
    title: "Live chat",
    description: "Existing clients can chat with their project engineer from any project's Messages tab.",
    href: "/login",
    cta: "Open client portal",
  },
  {
    icon: Mail,
    title: "Email support",
    description: "For general questions, send us an email and we'll respond within one business day.",
    href: "/contact",
    cta: "Send an email",
  },
  {
    icon: BookOpen,
    title: "Help & docs",
    description: "Answers to common questions about quoting, projects, payments and the portal.",
    href: "/faq",
    cta: "Browse the FAQ",
  },
];

export default function SupportPage() {
  return (
    <PublicShell>
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
            <LifeBuoy className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Support</h1>
          <p className="mt-4 text-muted-foreground">
            We're here to help. Choose the channel that works best for you.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
          {channels.map((c) => (
            <Card key={c.title} className="glass flex flex-col">
              <CardContent className="flex flex-1 flex-col pt-6">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <c.icon className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">{c.title}</h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{c.description}</p>
                <Button variant="outline" size="sm" asChild className="mt-4">
                  <Link href={c.href}>
                    {c.cta} <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mx-auto mt-12 max-w-xl text-center text-sm text-muted-foreground">
          For urgent issues on an active project, reach out directly in your{" "}
          <Link href="/login" className="text-primary font-medium">client portal</Link>{" "}
          — messages are seen by your project engineer in real time.
        </p>
      </section>
    </PublicShell>
  );
}
