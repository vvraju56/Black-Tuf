"use client";

import { useState, useActionState, startTransition, useEffect } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminUsers, useAdminProjects, adminKeys } from "@/hooks/use-admin";
import { adminCreateClient } from "@/app/actions";
import { timeAgo } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, UserPlus, X, Loader2 } from "lucide-react";

export function ClientsPanel() {
  const users = useAdminUsers();
  const projects = useAdminProjects();
  const [adding, setAdding] = useState(false);

  const clients = (users.data ?? []).filter((u) => u.role === "client");
  const projectList = projects.data ?? [];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Clients ({clients.length})</CardTitle>
        <Button size="sm" onClick={() => setAdding((v) => !v)}>
          <Plus className="h-4 w-4 mr-1" /> Add Client
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {adding ? <AddClientForm onDone={() => setAdding(false)} /> : null}

        {users.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : clients.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No clients yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {clients.map((c) => {
              const own = projectList.filter((p) => p.client_id === c.id);
              const active = own.filter((p) => p.status !== "completed" && p.status !== "cancelled").length;
              return (
                <Link key={c.id} href="/dashboard/projects" className="rounded-lg border p-3 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={c.avatar_url ?? undefined} />
                      <AvatarFallback>{c.full_name?.[0] ?? c.email?.[0] ?? "U"}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{c.full_name ?? c.email ?? "—"}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{own.length} projects</Badge>
                    <Badge variant={active > 0 ? "success" : "secondary"}>{active > 0 ? "Active" : "Inactive"}</Badge>
                    <span>{timeAgo(c.created_at)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AddClientForm({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient();
  const [state, formAction, pending] = useActionState(adminCreateClient, null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (state?.message) {
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      queryClient.invalidateQueries({ queryKey: adminKeys.users });
    }
  }, [state, queryClient]);

  return (
    <form
      action={() => {
        const fd = new FormData();
        fd.set("name", name);
        fd.set("email", email);
        fd.set("phone", phone);
        fd.set("password", password);
        startTransition(() => formAction(fd));
      }}
      className="space-y-4 rounded-lg border bg-muted/20 p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-semibold">
          <UserPlus className="h-4 w-4" /> Add Client
        </h3>
        <Button variant="ghost" size="icon" onClick={onDone}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="client-name">Full name</Label>
          <Input id="client-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="client-email">Email</Label>
          <Input id="client-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="john@email.com" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="client-phone">Phone</Label>
          <Input id="client-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="client-password">Temporary password</Label>
          <Input id="client-password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Min 6 characters" required />
        </div>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.message && <p className="text-sm text-success">{state.message}</p>}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
          Create Client
        </Button>
        <Button variant="outline" type="button" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  );
}
