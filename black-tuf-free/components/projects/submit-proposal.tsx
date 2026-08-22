"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useSubmitProposal, useProposalsForProject } from "@/hooks/use-proposals";
import { useProject } from "@/hooks/use-projects";
import { EmailVerificationDialog } from "@/components/profile/email-verification-dialog";
import { toast } from "sonner";

const schema = z.object({
  price: z.coerce.number().min(1, "Enter a price for this project."),
  estimated_time: z.string().min(1, "Estimate the delivery time."),
  cover_letter: z.string().min(20, "Your cover letter should be at least 20 characters."),
  portfolio_link: z.string().url("Enter a valid URL").or(z.literal("")).optional(),
});

type FormValues = z.infer<typeof schema>;

export function SubmitProposal({ projectId }: { projectId: string }) {
  const { user, profile } = useAuth();
  const { data: project } = useProject(projectId);
  const submit = useSubmitProposal(projectId);
  const { data: proposals } = useProposalsForProject(projectId);
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);

  const myProposal = user ? proposals?.find((p) => p.engineer_id === user.id) : null;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      price: project?.budget ? Number(project.budget) * 0.9 : undefined,
      estimated_time: "",
      cover_letter: "",
      portfolio_link: "",
    },
  });

  useEffect(() => {
    if (myProposal) {
      setSubmitted(true);
      form.reset({
        price: myProposal.price,
        estimated_time: myProposal.estimated_time,
        cover_letter: myProposal.cover_letter,
        portfolio_link: myProposal.portfolio_link ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myProposal?.id]);

  if (!user || !profile) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center">
        <p className="mb-3 text-sm text-muted-foreground">
          Sign in as an engineer to submit a proposal.
        </p>
        <Button variant="gradient" onClick={() => router.push("/login?next=/projects/" + projectId)}>
          Sign in to apply
        </Button>
      </div>
    );
  }

  if (profile.role !== "engineer") {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        Only engineer accounts can submit proposals to this project.
      </div>
    );
  }

  if (!profile.email_verified) {
    return (
      <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-6 text-center">
        <p className="text-sm font-medium">Email verification required</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          Verify your email to submit proposals and start working on freelance projects.
        </p>
        <Button variant="gradient" className="mt-4" onClick={() => setVerifyOpen(true)}>
          Verify Email
        </Button>
        <EmailVerificationDialog
          open={verifyOpen}
          onOpenChange={setVerifyOpen}
          onVerified={() => toast.success("Email verified. You can now submit proposals.")}
        />
      </div>
    );
  }

  const onSubmit = (values: FormValues) => {
    if (!user) return;
    submit.mutate(
      {
        project_id: projectId,
        engineer_id: user.id,
        price: values.price,
        estimated_time: values.estimated_time,
        cover_letter: values.cover_letter,
        portfolio_link: values.portfolio_link || null,
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          toast.success("Proposal submitted. The client will review it shortly.");
        },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <div>
          <p className="font-semibold">Proposal submitted</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {myProposal
              ? `You quoted ${myProposal.price} for ${myProposal.estimated_time}. The client can now review it.`
              : "Your proposal is with the client. Track its status from your dashboard."}
          </p>
        </div>
        <Button variant="secondary" onClick={() => router.push("/engineer/proposals")}>
          View my proposals
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form id="submit-proposal" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your price (₹)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="estimated_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated time</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 4 weeks" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="portfolio_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portfolio link</FormLabel>
              <FormControl>
                <Input placeholder="https://your-portfolio.example" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cover_letter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover letter</FormLabel>
              <FormControl>
                <Textarea
                  rows={5}
                  placeholder="Introduce yourself, your relevant experience and how you'd approach this project…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" variant="gradient" disabled={submit.isPending}>
          <Send className="h-4 w-4" />
          {submit.isPending ? "Submitting…" : "Submit Proposal"}
        </Button>
      </form>
    </Form>
  );
}
