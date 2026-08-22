"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRealtime } from "@/hooks/use-realtime";
import { adminKeys } from "@/hooks/use-admin";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { OverviewPanel } from "@/features/admin/overview";
import { ServicesPanel } from "@/features/admin/services";
import { ClientsPanel } from "@/features/admin/clients";
import { ProjectsPanel } from "@/features/admin/projects";
import { LeadsPanel } from "@/features/admin/leads";
import { EngineersPanel } from "@/features/admin/engineers";
import { MessagesPanel } from "@/features/admin/messages";
import { VisitsPanel } from "@/features/admin/visits";
import { InvoicesPanel } from "@/features/admin/invoices-panel";
import { StoragePanel } from "@/features/admin/storage";
import { NotificationsPanel } from "@/features/admin/notifications";
import { FeedbackPanel } from "@/features/admin/feedback";
import { AnalyticsPanel } from "@/features/admin/analytics";
import { SettingsPanel } from "@/features/admin/settings-panel";

export function AdminDashboard() {
  useDashboardTitle("Admin Dashboard");
  const { user, profile } = useAuth();
  const [tab, setTab] = useState("overview");

  useRealtime("admin-dashboard", [
    { table: "projects", queryKeys: [adminKeys.projects, ["projects"]] },
    { table: "profiles", queryKeys: [adminKeys.users] },
    { table: "messages", queryKeys: [adminKeys.messages] },
    { table: "notifications", queryKeys: [adminKeys.notifications] },
    { table: "site_visits", queryKeys: [adminKeys.visits, ["visits", "list"]] },
    { table: "feedback", queryKeys: [adminKeys.feedback] },
    { table: "invoices", queryKeys: [adminKeys.invoices, ["invoices"]] },
    { table: "project_files", queryKeys: [adminKeys.projects] },
    { table: "services", queryKeys: [adminKeys.services] },
    { table: "quote_requests", queryKeys: [adminKeys.quotes] },
    { table: "consultation_bookings", queryKeys: [adminKeys.bookings] },
    { table: "contact_messages", queryKeys: [adminKeys.contact] },
    { table: "site_settings", queryKeys: [adminKeys.settings] },
  ]);

  if (!user || profile?.role !== "admin") return null;

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-6">
      <TabsList className="flex flex-wrap h-auto gap-1">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="services">Services</TabsTrigger>
        <TabsTrigger value="clients">Clients</TabsTrigger>
        <TabsTrigger value="projects">Projects</TabsTrigger>
        <TabsTrigger value="requests">Project Requests</TabsTrigger>
        <TabsTrigger value="engineers">Engineers</TabsTrigger>
        <TabsTrigger value="chat">Live Chat</TabsTrigger>
        <TabsTrigger value="visits">Site Visits</TabsTrigger>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>
        <TabsTrigger value="files">Files</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="feedback">Feedback</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="overview"><OverviewPanel /></TabsContent>
      <TabsContent value="services"><ServicesPanel /></TabsContent>
      <TabsContent value="clients"><ClientsPanel /></TabsContent>
      <TabsContent value="projects"><ProjectsPanel /></TabsContent>
      <TabsContent value="requests"><LeadsPanel /></TabsContent>
      <TabsContent value="engineers"><EngineersPanel /></TabsContent>
      <TabsContent value="chat"><MessagesPanel /></TabsContent>
      <TabsContent value="visits"><VisitsPanel /></TabsContent>
      <TabsContent value="invoices"><InvoicesPanel /></TabsContent>
      <TabsContent value="files"><StoragePanel /></TabsContent>
      <TabsContent value="notifications"><NotificationsPanel /></TabsContent>
      <TabsContent value="feedback"><FeedbackPanel /></TabsContent>
      <TabsContent value="analytics"><AnalyticsPanel /></TabsContent>
      <TabsContent value="settings"><SettingsPanel /></TabsContent>
    </Tabs>
  );
}
