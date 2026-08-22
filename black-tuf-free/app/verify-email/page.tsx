import Link from "next/link";
import { MailCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Black Tuf</Link>
        </Button>
        <Card className="glass-strong">
          <CardContent className="pt-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
              <MailCheck className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Verify your email</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              We've sent a confirmation link to your inbox. Click it to activate
              your account, then sign in to start using the Black Tuf client portal.
            </p>
            <div className="mt-6 space-y-3">
              <Button asChild className="w-full">
                <Link href="/login">Go to sign in</Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Didn't get the email? Check your spam folder, or{" "}
                <Link href="/forgot-password" className="text-primary font-medium">
                  request a password reset
                </Link>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
