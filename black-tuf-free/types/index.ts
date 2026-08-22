export type Role = "client" | "admin" | "engineer";

export type ServiceId =
  | "web"
  | "mobile"
  | "uiux"
  | "game"
  | "ai"
  | "iot"
  | "plc"
  | "electrical";

export type ProjectStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export type ProjectType = "online" | "on_site";

export type VisitStatus =
  | "requested"
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled";

export type InvoiceStatus = "pending" | "paid" | "overdue" | "cancelled";

export type NotificationType =
  | "project_update"
  | "message"
  | "payment"
  | "visit"
  | "system";

export interface PushToken {
  id: string;
  user_id: string;
  token: string;
  device: string;
  created_at: string;
  last_seen_at: string;
}

export interface ActionResult {
  error?: string;
  message?: string;
  next?: string;
}

export interface Profile {
  id: string;
  firebase_uid: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: Role;
  avatar_url: string | null;
  username?: string | null;
  headline?: string;
  bio?: string;
  country?: string | null;
  city?: string | null;
  cover_url?: string | null;
  verification_badge?: boolean;
  last_seen_at?: string | null;
  available_for_work?: boolean;
  hourly_rate?: number | null;
  hourly_currency?: string;
  timezone?: string | null;
  email_verified?: boolean;
  freelancer_enabled?: boolean;
  freelancer_enabled_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  engineer_id: string | null;
  name: string;
  service: string;
  skills: string[];
  experience_required: number | null;
  project_type: ProjectType;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  budget: number | null;
  deadline: string | null;
  priority: ProjectPriority;
  currency_code: string | null;
  budget_min: number | null;
  budget_max: number | null;
  delivery_date: string | null;
  delivery_time: string | null;
  timezone: string | null;
  description: string;
  status: ProjectStatus;
  progress: number;
  has_sample: boolean;
  is_published: boolean;
  figma_link: string | null;
  adobe_link: string | null;
  created_at: string;
  updated_at: string;
  client?: Profile | null;
  engineer?: Profile | null;
  domains?: ProjectDomain[];
  proposal_count?: number;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  uploaded_by: string;
  name: string;
  file_type: string;
  size: number;
  storage_path: string | null;
  created_at: string;
  project?: { id: string; name: string; service: string; client_id: string | null } | null;
}

export interface Message {
  id: string;
  project_id: string;
  sender_id: string;
  content: string | null;
  file_path: string | null;
  file_name: string | null;
  file_type: string | null;
  read: boolean;
  created_at: string;
  sender?: Profile | null;
  project?: { id: string; name: string; service: string } | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  project_id: string | null;
  link: string | null;
  seen: boolean;
  created_at: string;
  user?: Profile | null;
}

export interface Feedback {
  id: string;
  project_id: string;
  client_id: string;
  rating: number;
  communication: number | null;
  quality: number | null;
  delivery: number | null;
  support: number | null;
  comment: string;
  is_approved: boolean;
  created_at: string;
  client?: Profile | null;
  project?: Project | null;
}

export interface SiteVisit {
  id: string;
  project_id: string;
  client_id: string;
  engineer_id: string | null;
  title: string;
  visit_date: string | null;
  visit_time: string | null;
  status: VisitStatus;
  notes: string;
  created_at: string;
  updated_at: string;
  project?: Project | null;
  engineer?: Profile | null;
  client?: Profile | null;
}

export interface Invoice {
  id: string;
  project_id: string;
  invoice_number: string;
  description: string;
  amount: number;
  status: InvoiceStatus;
  due_date: string | null;
  file_path: string | null;
  created_at: string;
  updated_at: string;
  project?: Project | null;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_url: string | null;
  author_id: string | null;
  tags: string[];
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile | null;
}

export type QuoteStatus = "new" | "contacted" | "quoted" | "closed";

export interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string;
  budget: string | null;
  description: string;
  status: QuoteStatus;
  created_at: string;
}

export type BookingStatus = "requested" | "confirmed" | "cancelled" | "completed";

export interface ConsultationBooking {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  notes: string;
  status: BookingStatus;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  image_url: string | null;
  price: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Domain {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ProjectDomain {
  project_id: string;
  domain_id: string;
  created_at: string;
  domain?: Domain | null;
}

export interface FreelancerDomain {
  user_id: string;
  domain_id: string;
  created_at: string;
  domain?: Domain | null;
}

export type ProjectPriority = "high" | "medium" | "low";

export type ProposalStatus = "pending" | "shortlisted" | "accepted" | "rejected";

export type Availability = "full_time" | "part_time" | "contract" | "busy";

export type ContractStatus = "draft" | "sent" | "signed" | "active" | "completed" | "cancelled";

export interface EngineerProfile {
  user_id: string;
  title: string;
  bio: string;
  skills: string[];
  hourly_rate: number | null;
  experience_years: number;
  portfolio_links: string[];
  certificates: string[];
  availability: Availability;
  location: string | null;
  languages: string[];
  is_available: boolean;
  created_at: string;
  updated_at: string;
  profile?: Profile | null;
  rating?: number | null;
  completed_jobs?: number;
  freelancer_domains?: FreelancerDomain[];
}

export interface Proposal {
  id: string;
  project_id: string;
  engineer_id: string;
  price: number;
  estimated_time: string;
  cover_letter: string;
  portfolio_link: string | null;
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
  engineer?: Profile | null;
  engineer_profile?: EngineerProfile | null;
  project?: Project | null;
}

export interface Contract {
  id: string;
  project_id: string;
  proposal_id: string | null;
  client_id: string;
  engineer_id: string;
  amount: number;
  terms: string;
  milestones: Array<{ title: string; amount: number; due: string | null }>;
  status: ContractStatus;
  signed_at: string | null;
  created_at: string;
  updated_at: string;
  project?: Project | null;
  client?: Profile | null;
  engineer?: Profile | null;
}

export interface SavedEngineer {
  client_id: string;
  engineer_id: string;
  created_at: string;
  engineer?: Profile | null;
  engineer_profile?: EngineerProfile | null;
}

export type ReferenceStatus = "pending" | "accepted" | "declined";

export type AttemptStatus = "not_started" | "in_progress" | "passed" | "failed";

export interface Skill {
  id: string;
  name: string;
  created_at: string;
}

export interface UserSkill {
  user_id: string;
  skill_id: string;
  sort_order: number;
  created_at: string;
  skill?: Skill | null;
}

export interface ProfileDomain {
  user_id: string;
  domain_id: string;
  created_at: string;
  domain?: Domain | null;
}

export interface PortfolioProject {
  id: string;
  user_id: string;
  title: string;
  description: string;
  project_url: string | null;
  github_url: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ExperienceItem {
  id: string;
  user_id: string;
  job_title: string;
  company: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  currently_working: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface EducationItem {
  id: string;
  user_id: string;
  degree: string;
  institution: string;
  field_of_study: string | null;
  country: string | null;
  start_year: number | null;
  end_year: number | null;
  currently_studying: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Qualification {
  id: string;
  user_id: string;
  name: string;
  institution: string;
  issue_date: string | null;
  description: string;
  certificate_url: string | null;
  credential_id: string | null;
  created_at: string;
}

export interface Certification {
  id: string;
  user_id: string;
  name: string;
  issuing_org: string;
  issue_date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  certificate_file: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface Publication {
  id: string;
  user_id: string;
  title: string;
  publisher: string;
  publication_date: string | null;
  description: string;
  url: string | null;
  created_at: string;
}

export interface Article {
  id: string;
  user_id: string;
  title: string;
  cover_image: string | null;
  content: string;
  category: string | null;
  tags: string[];
  is_published: boolean;
  published_date: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile | null;
}

export interface Reference {
  id: string;
  user_id: string;
  referee_name: string;
  referee_email: string | null;
  relationship: string | null;
  content: string;
  status: ReferenceStatus;
  created_at: string;
}

export interface Review {
  id: string;
  project_id: string | null;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
  reviewer?: Profile | null;
  project?: { id: string; name: string } | null;
}

export interface Reward {
  id: string;
  user_id: string;
  code: string;
  title: string;
  description: string;
  icon: string | null;
  date_earned: string;
  created_at: string;
}

export interface ProfileView {
  id: string;
  profile_id: string;
  viewer_id: string | null;
  viewed_at: string;
}

export interface ProfileVerification {
  id: string;
  user_id: string;
  badge_type: string;
  status: "pending" | "approved" | "rejected";
  issued_at: string | null;
  created_at: string;
}

export interface CertificationProgram {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface CertificationAttempt {
  id: string;
  user_id: string;
  program_id: string;
  status: AttemptStatus;
  score: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface ProfileStats {
  projects_completed: number;
  projects_posted: number;
  projects_working_on: number;
  proposals_submitted: number;
  reviews: number;
  average_rating: number | null;
  success_rate: number | null;
  response_rate: number | null;
  profile_views: number;
  response_time: number | null;
}

export interface ProfileCompletion {
  percent: number;
  missing: string[];
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface DashboardStats {
  projects: number;
  proposals: number;
  messages: number;
  notifications: number;
  visits: number;
  invoices: number;
  feedback: number;
  earnings: number;
}
