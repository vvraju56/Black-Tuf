"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/client";

type RealtimeTable =
  | "profiles"
  | "projects"
  | "project_domains"
  | "freelancer_domains"
  | "domains"
  | "project_files"
  | "messages"
  | "typing_indicator"
  | "notifications"
  | "feedback"
  | "site_visits"
  | "invoices"
  | "blog_posts"
  | "quote_requests"
  | "consultation_bookings"
  | "contact_messages"
  | "site_settings"
  | "services"
  | "proposals"
  | "engineer_profiles"
  | "contracts"
  | "saved_engineers"
  | "newsletter_subscribers"
  | "skills"
  | "user_skills"
  | "profile_domains"
  | "portfolio_projects"
  | "experience";

/**
 * Subscribe to realtime changes on the given tables and invalidate the
 * provided query keys so the UI updates instantly.
 */
export function useRealtime(channel: string, subscriptions: { table: RealtimeTable; queryKeys: (readonly unknown[])[] }[]) {
  const queryClient = useQueryClient();
  const subscriptionsRef = useRef(subscriptions);
  subscriptionsRef.current = subscriptions;

  useEffect(() => {
    const client = supabase();
    const ch = client.channel(channel);

    subscriptionsRef.current.forEach(({ table }) => {
      ch.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          subscriptionsRef.current
            .filter((s) => s.table === table)
            .forEach(({ queryKeys }) =>
              queryKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))
            );
        }
      );
    });

    ch.subscribe();

    return () => {
      client.removeChannel(ch);
    };
  }, [channel, queryClient]);
}
