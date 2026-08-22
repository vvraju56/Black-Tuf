"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAdminQuotes, useAdminBookings, useAdminContact, useQuoteMutations, useBookingMutations, useContactMutations } from "@/hooks/use-admin";
import { SERVICE_BY_ID } from "@/utils/constants";
import { timeAgo } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, MailOpen, Mail } from "lucide-react";
import type { QuoteStatus, BookingStatus } from "@/types";

const QUOTE_STATUS: Record<QuoteStatus, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  closed: "Closed",
};

const BOOKING_STATUS: Record<BookingStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

function serviceLabel(id: string) {
  return SERVICE_BY_ID[id as keyof typeof SERVICE_BY_ID]?.title ?? id;
}

export function LeadsPanel() {
  return (
    <Tabs defaultValue="quotes" className="space-y-4">
      <TabsList>
        <TabsTrigger value="quotes">Quote Requests</TabsTrigger>
        <TabsTrigger value="bookings">Consultations</TabsTrigger>
        <TabsTrigger value="contact">Contact Messages</TabsTrigger>
      </TabsList>
      <TabsContent value="quotes"><QuotesTab /></TabsContent>
      <TabsContent value="bookings"><BookingsTab /></TabsContent>
      <TabsContent value="contact"><ContactTab /></TabsContent>
    </Tabs>
  );
}

function QuotesTab() {
  const quotes = useAdminQuotes();
  const { setStatus, remove } = useQuoteMutations();
  const [busy, setBusy] = useState("");

  return (
    <Card>
      <CardHeader><CardTitle>Quote requests</CardTitle></CardHeader>
      <CardContent>
        {quotes.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (quotes.data ?? []).length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No quote requests yet.</p>
        ) : (
          <div className="space-y-2">
            {(quotes.data ?? []).map((q) => (
              <div key={q.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{q.name} <span className="text-xs text-muted-foreground">· {q.email}</span></p>
                    <p className="text-xs text-muted-foreground">
                      {serviceLabel(q.service)} · {q.budget ? q.budget.replace(/-/g, " – ") : "no budget"} · {timeAgo(q.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="secondary">{QUOTE_STATUS[q.status]}</Badge>
                    <select
                      className="rounded-md border border-input bg-transparent px-2 py-1 text-sm"
                      disabled={busy === q.id}
                      onChange={async (e) => {
                        const status = e.target.value as QuoteStatus;
                        setBusy(q.id);
                        try {
                          await setStatus(q.id, status);
                          toast.success("Status updated");
                        } catch (err: any) {
                          toast.error("Update failed", { description: err.message });
                        } finally {
                          setBusy("");
                        }
                      }}
                    >
                      {Object.entries(QUOTE_STATUS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={async () => {
                        if (!confirm("Delete this request?")) return;
                        try {
                          await remove(q.id);
                          toast.success("Deleted");
                        } catch (err: any) {
                          toast.error("Delete failed", { description: err.message });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {q.description ? (
                  <p className="mt-2 rounded-md bg-muted/30 p-2 text-sm">{q.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BookingsTab() {
  const bookings = useAdminBookings();
  const { setStatus, remove } = useBookingMutations();
  const [busy, setBusy] = useState("");

  return (
    <Card>
      <CardHeader><CardTitle>Consultation bookings</CardTitle></CardHeader>
      <CardContent>
        {bookings.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (bookings.data ?? []).length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No bookings yet.</p>
        ) : (
          <div className="space-y-2">
            {(bookings.data ?? []).map((b) => (
              <div key={b.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{b.name} <span className="text-xs text-muted-foreground">· {b.email}</span></p>
                    <p className="text-xs text-muted-foreground">
                      {b.service ? serviceLabel(b.service) : "General"} · {b.preferred_date ?? "no date"} {b.preferred_time ? `@ ${b.preferred_time}` : ""} · {timeAgo(b.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="secondary">{BOOKING_STATUS[b.status]}</Badge>
                    <select
                      className="rounded-md border border-input bg-transparent px-2 py-1 text-sm"
                      disabled={busy === b.id}
                      onChange={async (e) => {
                        const status = e.target.value as BookingStatus;
                        setBusy(b.id);
                        try {
                          await setStatus(b.id, status);
                          toast.success("Status updated");
                        } catch (err: any) {
                          toast.error("Update failed", { description: err.message });
                        } finally {
                          setBusy("");
                        }
                      }}
                    >
                      {Object.entries(BOOKING_STATUS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={async () => {
                        if (!confirm("Delete this booking?")) return;
                        try {
                          await remove(b.id);
                          toast.success("Deleted");
                        } catch (err: any) {
                          toast.error("Delete failed", { description: err.message });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {b.notes ? <p className="mt-2 rounded-md bg-muted/30 p-2 text-sm">{b.notes}</p> : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContactTab() {
  const contact = useAdminContact();
  const { setRead, remove } = useContactMutations();
  const [busy, setBusy] = useState("");

  return (
    <Card>
      <CardHeader><CardTitle>Contact messages</CardTitle></CardHeader>
      <CardContent>
        {contact.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (contact.data ?? []).length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No contact messages yet.</p>
        ) : (
          <div className="space-y-2">
            {(contact.data ?? []).map((m) => (
              <div key={m.id} className={`rounded-lg border p-3 ${m.is_read ? "" : "border-primary/40 bg-primary/5"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {m.name} <span className="text-xs text-muted-foreground">· {m.email}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.subject ?? "No subject"} · {timeAgo(m.created_at)} {!m.is_read ? "· unread" : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={busy === m.id}
                      onClick={async () => {
                        setBusy(m.id);
                        try {
                          await setRead(m.id, !m.is_read);
                        } catch (err: any) {
                          toast.error("Update failed", { description: err.message });
                        } finally {
                          setBusy("");
                        }
                      }}
                    >
                      {m.is_read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={async () => {
                        if (!confirm("Delete this message?")) return;
                        try {
                          await remove(m.id);
                          toast.success("Deleted");
                        } catch (err: any) {
                          toast.error("Delete failed", { description: err.message });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="mt-2 rounded-md bg-muted/30 p-2 text-sm">{m.message}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
