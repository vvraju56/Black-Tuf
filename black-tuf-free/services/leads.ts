import { supabase } from "./client";
import type { QuoteRequest, QuoteStatus, ConsultationBooking, BookingStatus, ContactMessage } from "@/types";

// ---------------------------------------------------------------
// Quote requests
// ---------------------------------------------------------------
export async function submitQuoteRequest(input: {
  name: string;
  email: string;
  phone?: string | null;
  service: string;
  budget?: string | null;
  description: string;
}) {
  const { error } = await supabase().from("quote_requests").insert({
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    service: input.service,
    budget: input.budget ?? null,
    description: input.description,
    status: "new",
  });
  if (error) throw new Error(error.message);
}

export async function getQuoteRequests(): Promise<QuoteRequest[]> {
  const { data, error } = await supabase()
    .from("quote_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as QuoteRequest[];
}

export async function updateQuoteStatus(id: string, status: QuoteStatus) {
  const { error } = await supabase().from("quote_requests").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteQuoteRequest(id: string) {
  const { error } = await supabase().from("quote_requests").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------
// Consultation bookings
// ---------------------------------------------------------------
export async function submitBooking(input: {
  name: string;
  email: string;
  phone?: string | null;
  service?: string | null;
  preferred_date?: string | null;
  preferred_time?: string | null;
  notes?: string;
}) {
  const { error } = await supabase().from("consultation_bookings").insert({
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    service: input.service ?? null,
    preferred_date: input.preferred_date ?? null,
    preferred_time: input.preferred_time ?? null,
    notes: input.notes ?? "",
    status: "requested",
  });
  if (error) throw new Error(error.message);
}

export async function getBookings(): Promise<ConsultationBooking[]> {
  const { data, error } = await supabase()
    .from("consultation_bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ConsultationBooking[];
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const { error } = await supabase().from("consultation_bookings").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteBooking(id: string) {
  const { error } = await supabase().from("consultation_bookings").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------
// Contact messages
// ---------------------------------------------------------------
export async function submitContactMessage(input: {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
}) {
  const { error } = await supabase().from("contact_messages").insert({
    name: input.name,
    email: input.email,
    subject: input.subject ?? null,
    message: input.message,
  });
  if (error) throw new Error(error.message);
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase()
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ContactMessage[];
}

export async function markContactRead(id: string, read: boolean) {
  const { error } = await supabase().from("contact_messages").update({ is_read: read }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteContactMessage(id: string) {
  const { error } = await supabase().from("contact_messages").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
