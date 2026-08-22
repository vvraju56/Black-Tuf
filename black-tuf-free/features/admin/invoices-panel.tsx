"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAdminInvoices, useAdminProjects, useCreateInvoice, useInvoiceStatusMutation, useNextInvoiceNumber } from "@/hooks/use-admin";
import { INVOICE_STATUS } from "@/utils/constants";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Receipt, Loader2 } from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/types";

export function InvoicesPanel() {
  const invoices = useAdminInvoices();
  const projects = useAdminProjects();
  const create = useCreateInvoice();
  const setStatus = useInvoiceStatusMutation();
  const nextNumber = useNextInvoiceNumber();

  const [showForm, setShowForm] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const list = invoices.data ?? [];
  const total = list.reduce((sum, i) => sum + (i.status === "paid" || i.status === "cancelled" ? 0 : i.amount), 0);

  const submit = async () => {
    if (!projectId || !amount || Number(amount) <= 0) {
      toast.error("Select a project and enter a valid amount.");
      return;
    }
    try {
      await create.mutateAsync({
        project_id: projectId,
        invoice_number: nextNumber.data ?? `INV-${Date.now()}`,
        description: description || undefined,
        amount: Number(amount),
        due_date: dueDate || undefined,
      });
      toast.success("Invoice created");
      setShowForm(false);
      setProjectId("");
      setAmount("");
      setDescription("");
      setDueDate("");
    } catch (e: any) {
      toast.error("Failed to create", { description: e.message });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-4 w-4" /> Invoices
            <Badge variant="secondary">{list.length} total</Badge>
          </CardTitle>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" /> New invoice
          </Button>
        </CardHeader>
        <CardContent>
          {showForm ? (
            <div className="mb-6 space-y-4 rounded-lg border p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="inv-project">Project</Label>
                  <select
                    id="inv-project"
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                  >
                    <option value="">Select a project</option>
                    {(projects.data ?? []).map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inv-number">Invoice number</Label>
                  <Input id="inv-number" value={nextNumber.data ?? ""} readOnly />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="inv-amount">Amount (INR)</Label>
                  <Input id="inv-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="150000" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inv-due">Due date</Label>
                  <Input id="inv-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-desc">Description</Label>
                <Textarea id="inv-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <Button size="sm" onClick={submit} disabled={create.isPending}>
                {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create invoice
              </Button>
            </div>
          ) : null}

          {invoices.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : list.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No invoices yet.</p>
          ) : (
            <div className="space-y-2">
              {list.map((inv) => (
                <InvoiceRow key={inv.id} invoice={inv} onStatus={(s) => setStatus.mutateAsync({ id: inv.id, status: s })} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Outstanding total</CardTitle></CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatCurrency(total)}</p>
          <p className="text-sm text-muted-foreground">Pending + overdue across all clients.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function InvoiceRow({ invoice, onStatus }: { invoice: Invoice; onStatus: (s: InvoiceStatus) => void }) {
  const st = INVOICE_STATUS[invoice.status as keyof typeof INVOICE_STATUS] ?? INVOICE_STATUS.pending;
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
      <div className="min-w-0">
        <p className="font-medium">#{invoice.invoice_number}</p>
        <p className="truncate text-xs text-muted-foreground">
          {invoice.project?.name ?? "—"} · {formatCurrency(invoice.amount)}
          {invoice.due_date ? ` · due ${formatDate(invoice.due_date)}` : ""} · {timeAgo(invoice.created_at)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={st.color as "secondary" | "success" | "warning" | "destructive" | "default" | "outline"}>
          {st.label}
        </Badge>
        <select
          className="rounded-md border border-input bg-transparent px-2 py-1 text-sm"
          value={invoice.status}
          disabled={busy}
          onChange={async (e) => {
            const status = e.target.value as InvoiceStatus;
            setBusy(true);
            try {
              await onStatus(status);
              toast.success("Status updated");
            } catch (err: any) {
              toast.error("Update failed", { description: err.message });
            } finally {
              setBusy(false);
            }
          }}
        >
          {Object.keys(INVOICE_STATUS).map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
