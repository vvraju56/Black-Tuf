import Link from "next/link";
import { PublicShell } from "@/features/site/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "₹49,000",
    priceNote: "from, per project",
    description: "For small projects and MVPs with a focused scope.",
    features: ["Up to 2-week delivery", "1 revision round", "Responsive web or mobile build", "Deployment & handover", "30 days post-launch support"],
    cta: "Request a quote",
    featured: false,
  },
  {
    name: "Growth",
    price: "₹1,20,000",
    priceNote: "from, per project",
    description: "The most popular choice for products that need to scale.",
    features: ["Dedicated engineer", "Agile sprints & progress portal", "Full-stack build + integration", "QA, testing & CI/CD", "90 days support & maintenance"],
    cta: "Request a quote",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    priceNote: "tailored to your needs",
    description: "For complex systems, teams and long-term partnerships.",
    features: ["Dedicated team", "IoT / PLC / electrical scope", "SLA-backed support", "On-site commissioning", "Security & compliance review"],
    cta: "Book a consultation",
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <PublicShell>
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight">Simple, transparent pricing</h1>
          <p className="mt-4 text-muted-foreground">
            Every project is scoped individually. Prices below are starting
            points — request a quote for an exact estimate.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.featured ? "glass-strong border-primary/50 shadow-lg shadow-primary/10" : "glass"}>
              {plan.featured ? (
                <div className="flex items-center gap-1.5 rounded-t-xl bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> Most popular
                </div>
              ) : null}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div>
                  <div className="text-3xl font-bold">{plan.price}</div>
                  <p className="text-xs text-muted-foreground">{plan.priceNote}</p>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="mt-6 w-full" variant={plan.featured ? "default" : "outline"} asChild>
                  <Link href={plan.featured ? "/book-consultation" : "/request-quote"}>
                    {plan.cta}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-foreground">
          Prices are estimates in INR and vary with scope, complexity and
          timeline. Ready to start?{" "}
          <Link href="/request-quote" className="text-primary font-medium">Request a quote</Link>{" "}
          or <Link href="/book-consultation" className="text-primary font-medium">book a free consultation</Link>.
        </p>
      </section>
    </PublicShell>
  );
}
