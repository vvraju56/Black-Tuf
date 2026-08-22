"use client";

import { useAdminStorage } from "@/hooks/use-admin";
import { formatBytes, timeAgo } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, FolderOpen } from "lucide-react";

const BUCKET_LABEL: Record<string, string> = {
  avatars: "Avatars",
  projectFiles: "Project Files",
  quotations: "Quotations",
  invoices: "Invoices",
};

export function StoragePanel() {
  const storage = useAdminStorage();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {storage.queries.map((q, i) => {
          const bucket = storage.buckets[i];
          const files = q.data ?? [];
          const totalBytes = files.reduce((s: number, f: any) => s + (f.metadata?.size ?? 0), 0);
          return (
            <Card key={bucket}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  <p className="font-medium">{BUCKET_LABEL[bucket] ?? bucket}</p>
                </div>
                <p className="mt-2 text-2xl font-bold">{files.length}</p>
                <p className="text-xs text-muted-foreground">files · {formatBytes(totalBytes)}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Objects</CardTitle>
        </CardHeader>
        <CardContent>
          {storage.queries.some((q) => q.isLoading) ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 pr-3">Bucket</th>
                    <th className="pb-2 pr-3">Name</th>
                    <th className="pb-2 pr-3">Size</th>
                    <th className="pb-2">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {storage.queries.map((q, i) => {
                    const bucket = storage.buckets[i];
                    return (q.data ?? []).map((f: any) => (
                      <tr key={`${bucket}-${f.id}`} className="border-b last:border-0">
                        <td className="py-2 pr-3"><Badge variant="outline">{BUCKET_LABEL[bucket] ?? bucket}</Badge></td>
                        <td className="py-2 pr-3">
                          <span className="flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            {f.name}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground">{formatBytes(f.metadata?.size ?? 0)}</td>
                        <td className="py-2 text-muted-foreground">{timeAgo(f.created_at)}</td>
                      </tr>
                    ));
                  })}
                  {storage.queries.every((q) => (q.data ?? []).length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                        No files stored yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
