export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          firebase_uid: string | null;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          role: "client" | "admin" | "engineer";
          avatar_url: string | null;
          username: string | null;
          headline: string;
          country: string | null;
          cover_url: string | null;
          verification_badge: boolean;
          last_seen_at: string | null;
          is_private: boolean;
          available_for_work: boolean;
          hourly_rate: number | null;
          timezone: string | null;
          bio: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          firebase_uid?: string | null;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          role?: "client" | "admin" | "engineer";
          avatar_url?: string | null;
          username?: string | null;
          headline?: string;
          country?: string | null;
          cover_url?: string | null;
          verification_badge?: boolean;
          last_seen_at?: string | null;
          is_private?: boolean;
          available_for_work?: boolean;
          hourly_rate?: number | null;
          timezone?: string | null;
          bio?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          firebase_uid?: string | null;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          role?: "client" | "admin" | "engineer";
          avatar_url?: string | null;
          username?: string | null;
          headline?: string;
          country?: string | null;
          cover_url?: string | null;
          verification_badge?: boolean;
          last_seen_at?: string | null;
          is_private?: boolean;
          available_for_work?: boolean;
          hourly_rate?: number | null;
          timezone?: string | null;
          bio?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          client_id: string;
          engineer_id: string | null;
          name: string;
          service: string;
          project_type: "online" | "on_site";
          address: string | null;
          description: string;
          status: "pending" | "in_progress" | "completed" | "cancelled";
          progress: number;
          has_sample: boolean;
          is_published: boolean;
          figma_link: string | null;
          adobe_link: string | null;
          skills: string[] | null;
          experience_required: number | null;
          budget: number | null;
          deadline: string | null;
          priority: "high" | "medium" | "low";
          currency_code: string | null;
          currency_symbol: string | null;
          budget_min: number | null;
          budget_max: number | null;
          delivery_date: string | null;
          delivery_time: string | null;
          timezone: string | null;
          country_code: string | null;
          country_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          engineer_id?: string | null;
          name: string;
          service: string;
          project_type?: "online" | "on_site";
          address?: string | null;
          description?: string;
          status?: "pending" | "in_progress" | "completed" | "cancelled";
          progress?: number;
          has_sample?: boolean;
          is_published?: boolean;
          figma_link?: string | null;
          adobe_link?: string | null;
          skills?: string[] | null;
          experience_required?: number | null;
          budget?: number | null;
          deadline?: string | null;
          priority?: "high" | "medium" | "low";
          currency_code?: string | null;
          currency_symbol?: string | null;
          budget_min?: number | null;
          budget_max?: number | null;
          delivery_date?: string | null;
          delivery_time?: string | null;
          timezone?: string | null;
          country_code?: string | null;
          country_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          engineer_id?: string | null;
          name?: string;
          service?: string;
          project_type?: "online" | "on_site";
          address?: string | null;
          description?: string;
          status?: "pending" | "in_progress" | "completed" | "cancelled";
          progress?: number;
          has_sample?: boolean;
          is_published?: boolean;
          figma_link?: string | null;
          adobe_link?: string | null;
          skills?: string[] | null;
          experience_required?: number | null;
          budget?: number | null;
          deadline?: string | null;
          priority?: "high" | "medium" | "low";
          currency_code?: string | null;
          currency_symbol?: string | null;
          budget_min?: number | null;
          budget_max?: number | null;
          delivery_date?: string | null;
          delivery_time?: string | null;
          timezone?: string | null;
          country_code?: string | null;
          country_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_files: {
        Row: {
          id: string;
          project_id: string;
          uploaded_by: string;
          name: string;
          file_type: string;
          size: number;
          storage_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          uploaded_by: string;
          name: string;
          file_type?: string;
          size?: number;
          storage_path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          uploaded_by?: string;
          name?: string;
          file_type?: string;
          size?: number;
          storage_path?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          project_id: string;
          sender_id: string;
          content: string | null;
          file_path: string | null;
          file_name: string | null;
          file_type: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          sender_id: string;
          content?: string | null;
          file_path?: string | null;
          file_name?: string | null;
          file_type?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          sender_id?: string;
          content?: string | null;
          file_path?: string | null;
          file_name?: string | null;
          file_type?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      typing_indicator: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          type:
            | "project_update"
            | "message"
            | "payment"
            | "visit"
            | "system";
          project_id: string | null;
          link: string | null;
          seen: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body?: string;
          type?: "project_update" | "message" | "payment" | "visit" | "system";
          project_id?: string | null;
          link?: string | null;
          seen?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          body?: string;
          type?: "project_update" | "message" | "payment" | "visit" | "system";
          project_id?: string | null;
          link?: string | null;
          seen?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      feedback: {
        Row: {
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
        };
        Insert: {
          id?: string;
          project_id: string;
          client_id: string;
          rating: number;
          communication?: number | null;
          quality?: number | null;
          delivery?: number | null;
          support?: number | null;
          comment?: string;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          client_id?: string;
          rating?: number;
          communication?: number | null;
          quality?: number | null;
          delivery?: number | null;
          support?: number | null;
          comment?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      site_visits: {
        Row: {
          id: string;
          project_id: string;
          client_id: string;
          engineer_id: string | null;
          title: string;
          visit_date: string | null;
          visit_time: string | null;
          status: "requested" | "scheduled" | "confirmed" | "completed" | "cancelled";
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          client_id: string;
          engineer_id?: string | null;
          title?: string;
          visit_date?: string | null;
          visit_time?: string | null;
          status?: "requested" | "scheduled" | "confirmed" | "completed" | "cancelled";
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          client_id?: string;
          engineer_id?: string | null;
          title?: string;
          visit_date?: string | null;
          visit_time?: string | null;
          status?: "requested" | "scheduled" | "confirmed" | "completed" | "cancelled";
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          project_id: string;
          invoice_number: string;
          description: string;
          amount: number;
          status: "pending" | "paid" | "overdue" | "cancelled";
          due_date: string | null;
          file_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          invoice_number: string;
          description?: string;
          amount?: number;
          status?: "pending" | "paid" | "overdue" | "cancelled";
          due_date?: string | null;
          file_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          invoice_number?: string;
          description?: string;
          amount?: number;
          status?: "pending" | "paid" | "overdue" | "cancelled";
          due_date?: string | null;
          file_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      proposals: {
        Row: {
          id: string;
          project_id: string;
          engineer_id: string;
          price: number;
          estimated_time: string;
          cover_letter: string;
          portfolio_link: string | null;
          status: "pending" | "shortlisted" | "accepted" | "rejected";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          engineer_id: string;
          price?: number;
          estimated_time?: string;
          cover_letter?: string;
          portfolio_link?: string | null;
          status?: "pending" | "shortlisted" | "accepted" | "rejected";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          engineer_id?: string;
          price?: number;
          estimated_time?: string;
          cover_letter?: string;
          portfolio_link?: string | null;
          status?: "pending" | "shortlisted" | "accepted" | "rejected";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      engineer_profiles: {
        Row: {
          user_id: string;
          title: string;
          bio: string;
          skills: string[];
          hourly_rate: number | null;
          experience_years: number;
          portfolio_links: string[];
          certificates: string[];
          availability: "full_time" | "part_time" | "contract" | "busy";
          location: string | null;
          languages: string[];
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title?: string;
          bio?: string;
          skills?: string[];
          hourly_rate?: number | null;
          experience_years?: number;
          portfolio_links?: string[];
          certificates?: string[];
          availability?: "full_time" | "part_time" | "contract" | "busy";
          location?: string | null;
          languages?: string[];
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          title?: string;
          bio?: string;
          skills?: string[];
          hourly_rate?: number | null;
          experience_years?: number;
          portfolio_links?: string[];
          certificates?: string[];
          availability?: "full_time" | "part_time" | "contract" | "busy";
          location?: string | null;
          languages?: string[];
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contracts: {
        Row: {
          id: string;
          project_id: string;
          proposal_id: string | null;
          client_id: string;
          engineer_id: string;
          amount: number;
          terms: string;
          milestones: Json;
          status: "draft" | "sent" | "signed" | "active" | "completed" | "cancelled";
          signed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          proposal_id?: string | null;
          client_id: string;
          engineer_id: string;
          amount?: number;
          terms?: string;
          milestones?: Json;
          status?: "draft" | "sent" | "signed" | "active" | "completed" | "cancelled";
          signed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          proposal_id?: string | null;
          client_id?: string;
          engineer_id?: string;
          amount?: number;
          terms?: string;
          milestones?: Json;
          status?: "draft" | "sent" | "signed" | "active" | "completed" | "cancelled";
          signed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      saved_engineers: {
        Row: {
          client_id: string;
          engineer_id: string;
          created_at: string;
        };
        Insert: {
          client_id: string;
          engineer_id: string;
          created_at?: string;
        };
        Update: {
          client_id?: string;
          engineer_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      push_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          device: string;
          created_at: string;
          last_seen_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          device?: string;
          created_at?: string;
          last_seen_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token?: string;
          device?: string;
          created_at?: string;
          last_seen_at?: string;
        };
        Relationships: [];
      };
      skills: {
        Row: {
          id: string;
          name: string;
          category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_skills: {
        Row: {
          user_id: string;
          skill_id: string;
          sort_order: number;
          is_verified: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          skill_id: string;
          sort_order?: number;
          is_verified?: boolean;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          skill_id?: string;
          sort_order?: number;
          is_verified?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      profile_domains: {
        Row: {
          user_id: string;
          domain_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          domain_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          domain_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      portfolio_projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          cover_url: string | null;
          technologies: string[];
          category: string | null;
          project_url: string | null;
          github_url: string | null;
          live_demo: string | null;
          completion_date: string | null;
          client_review: string | null;
          is_featured: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          cover_url?: string | null;
          technologies?: string[];
          category?: string | null;
          project_url?: string | null;
          github_url?: string | null;
          live_demo?: string | null;
          completion_date?: string | null;
          client_review?: string | null;
          is_featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          cover_url?: string | null;
          technologies?: string[];
          category?: string | null;
          project_url?: string | null;
          github_url?: string | null;
          live_demo?: string | null;
          completion_date?: string | null;
          client_review?: string | null;
          is_featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      experience: {
        Row: {
          id: string;
          user_id: string;
          job_title: string;
          company: string;
          description: string;
          location: string | null;
          country: string | null;
          start_date: string | null;
          end_date: string | null;
          currently_working: boolean;
          employment_type: string | null;
          skills_used: string[];
          reference_name: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_title: string;
          company?: string;
          description?: string;
          location?: string | null;
          country?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          currently_working?: boolean;
          employment_type?: string | null;
          skills_used?: string[];
          reference_name?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_title?: string;
          company?: string;
          description?: string;
          location?: string | null;
          country?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          currently_working?: boolean;
          employment_type?: string | null;
          skills_used?: string[];
          reference_name?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      education: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          degree: string;
          institution?: string;
          field_of_study?: string | null;
          country?: string | null;
          start_year?: number | null;
          end_year?: number | null;
          currently_studying?: boolean;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          degree?: string;
          institution?: string;
          field_of_study?: string | null;
          country?: string | null;
          start_year?: number | null;
          end_year?: number | null;
          currently_studying?: boolean;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      qualifications: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          institution: string;
          issue_date: string | null;
          description: string;
          certificate_url: string | null;
          credential_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          institution?: string;
          issue_date?: string | null;
          description?: string;
          certificate_url?: string | null;
          credential_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          institution?: string;
          issue_date?: string | null;
          description?: string;
          certificate_url?: string | null;
          credential_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      certifications: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          issuing_org?: string;
          issue_date?: string | null;
          expiry_date?: string | null;
          credential_id?: string | null;
          credential_url?: string | null;
          certificate_file?: string | null;
          is_verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          issuing_org?: string;
          issue_date?: string | null;
          expiry_date?: string | null;
          credential_id?: string | null;
          credential_url?: string | null;
          certificate_file?: string | null;
          is_verified?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      publications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          publisher: string;
          publication_date: string | null;
          description: string;
          url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          publisher?: string;
          publication_date?: string | null;
          description?: string;
          url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          publisher?: string;
          publication_date?: string | null;
          description?: string;
          url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      articles: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          cover_image?: string | null;
          content?: string;
          category?: string | null;
          tags?: string[];
          is_published?: boolean;
          published_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          cover_image?: string | null;
          content?: string;
          category?: string | null;
          tags?: string[];
          is_published?: boolean;
          published_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      references: {
        Row: {
          id: string;
          user_id: string;
          referee_name: string;
          referee_email: string | null;
          relationship: string | null;
          content: string;
          status: "pending" | "accepted" | "declined";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          referee_name: string;
          referee_email?: string | null;
          relationship?: string | null;
          content?: string;
          status?: "pending" | "accepted" | "declined";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          referee_name?: string;
          referee_email?: string | null;
          relationship?: string | null;
          content?: string;
          status?: "pending" | "accepted" | "declined";
          created_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          project_id: string | null;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment: string;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment?: string;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          reviewer_id?: string;
          reviewee_id?: string;
          rating?: number;
          comment?: string;
          is_approved?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      rewards: {
        Row: {
          id: string;
          user_id: string;
          code: string;
          title: string;
          description: string;
          icon: string | null;
          date_earned: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          code: string;
          title: string;
          description?: string;
          icon?: string | null;
          date_earned?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          code?: string;
          title?: string;
          description?: string;
          icon?: string | null;
          date_earned?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      profile_views: {
        Row: {
          id: string;
          profile_id: string;
          viewer_id: string | null;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          viewer_id?: string | null;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          viewer_id?: string | null;
          viewed_at?: string;
        };
        Relationships: [];
      };
      profile_verifications: {
        Row: {
          id: string;
          user_id: string;
          badge_type: string;
          status: "pending" | "approved" | "rejected";
          issued_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_type?: string;
          status?: "pending" | "approved" | "rejected";
          issued_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_type?: string;
          status?: "pending" | "approved" | "rejected";
          issued_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      certification_programs: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          icon?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      certification_attempts: {
        Row: {
          id: string;
          user_id: string;
          program_id: string;
          status: "not_started" | "in_progress" | "passed" | "failed";
          score: number | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          program_id: string;
          status?: "not_started" | "in_progress" | "passed" | "failed";
          score?: number | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          program_id?: string;
          status?: "not_started" | "in_progress" | "passed" | "failed";
          score?: number | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
