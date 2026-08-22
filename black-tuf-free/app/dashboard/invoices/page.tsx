"use client";

import { useAuth } from "@/hooks/use-auth";
import { useInvoices, useUpdateInvoiceStatus } from "@/hooks/use-invoices";
import { useRealtime } from "@/hooks/use-realtime";
import { invoiceKeys } from "@/hooks/use-invoices";
import { INVOICE_STATUS } from "@/utils/constants";
import { timeAgo, formatCurrency, formatDate } from "@/lib/utils";
import type { Invoice } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt, Download } from "lucide-react";
import { getSignedUrl } from "@/services/storage";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { toast } from "sonner";

export default function InvoicesPage() {
  useDashboardTitle("Invoices");
  const { user, profile } = useAuth();
  const { data: invoices, isLoading } = useInvoices();
  const statusMut = useUpdateInvoiceStatus();

  useRealtime("invoices-page", [{ table: "invoices", queryKeys: [invoiceKeys.list()] }]);

  if (!user) return null;

  const role = profile?.role;
  const myInvoices = (invoices ?? []).filter((inv) => {
    if (role === "client") return inv.project?.client_id === user.id;
    return true;
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Invoices</h2>
        <Badge variant="secondary">{myInvoices.length} total</Badge>
      </div>

      {myInvoices.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {myInvoices.map((inv) => (
            <InvoiceCard
              key={inv.id}
              invoice={inv}
              role={role ?? "client"}
              onMarkPaid={() => statusMut.mutateAsync({ id: inv.id, status: "paid" })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function InvoiceCard({
  invoice,
  role,
  onMarkPaid,
}: {
  invoice: Invoice;
  role: string;
  onMarkPaid: () => void;
}) {
  const st = INVOICE_STATUS[invoice.status as keyof typeof INVOICE_STATUS] ?? INVOICE_STATUS.pending;
  const canMarkPaid = role === "admin" || role === "engineer";
  const dueLabel = invoice.due_date ? formatDate(invoice.due_date) : "—";

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">#{invoice.invoice_number}</CardTitle>
          <Badge variant={st.color as any}>{st.label}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{invoice.project?.name ?? "—"}</p>
      </CardHeader>
      <CardContent className="flex-1 space-y-2 text-sm">
        <p>{invoice.description}</p>
        <p className="text-2xl font-bold">{formatCurrency(invoice.amount)}</p>
        <p className="text-xs text-muted-foreground">Due: {dueLabel}</p>
        <p className="text-xs text-muted-foreground">Issued {timeAgo(invoice.created_at)}</p>
      </CardContent>
      <div className="flex items-center gap-2 p-4 pt-0">
        {invoice.file_path ? (
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                const url = await getSignedUrl("invoices", invoice.file_path as string);
                window.open(url, "_blank");
              } catch (e: any) {
                toast.error("Download failed", { description: e.message });
              }
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        ) : null}
        {canMarkPaid && invoice.status !== "paid" ? (
          <Button size="sm" onClick={() => onMarkPaid()}>
            Mark paid
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-center">
      <Receipt className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">No invoices found.</p>
    </div>
  );
}
