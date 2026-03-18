import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bjdlyjeltwjukuthxkti.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqZGx5amVsdHdqdWt1dGh4a3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNDk3MDMsImV4cCI6MjA4NzcyNTcwM30.cH8BtfpsvktT14B6X48J45PXWZP8KL6ZUTpiLGNhkVQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type News = {
  id: number;
  tweet_id: string | null;
  title: string;
  korean_text: string;
  importance: number;
  theme: string | null;
  source: string | null;
  url: string | null;
  story_key: string | null;
  tickers: string[];
  is_digest: boolean;
  published_at: string;
  created_at: string;
};
