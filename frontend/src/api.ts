import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8080" });

export default api;

// Types
export interface Company {
  id: number;
  name: string;
  industry?: string;
  size?: string;
  website?: string;
  domain?: string;
  logo_url?: string;
  notes?: string;
  created_at?: string;
  job_count: number;
  contact_count: number;
}

export interface Job {
  id: number;
  company_id: number;
  title: string;
  url?: string;
  status: "Wishlist" | "Applied" | "Closed";
  applied_date?: string;
  deadline?: string;
  notes?: string;
  created_at?: string;
  company_name?: string;
  company_logo_url?: string;
}

export interface Contact {
  id: number;
  company_id?: number;
  name: string;
  role?: string;
  email?: string;
  linkedin_url?: string;
  reached_out_on?: string;
  follow_up_date?: string;
  notes?: string;
  company_name?: string;
  company_logo_url?: string;
}

export interface Question {
  id: number;
  company_id?: number;
  question: string;
  category: "Behavioral" | "Technical" | "Case" | "Other";
  my_answer?: string;
  notes?: string;
  created_at?: string;
  company_name?: string;
}

export interface JournalEntry {
  id: number;
  date: string;
  body: string;
  created_at?: string;
}

export interface DeadlineItem {
  type: "job" | "contact";
  id: number;
  label: string;
  company_name?: string;
  company_logo_url?: string;
  deadline: string;
}

export interface DashboardStats {
  companies: number;
  wishlist: number;
  applied: number;
  closed: number;
  contacts: number;
  questions: number;
  upcoming_deadlines: DeadlineItem[];
}
