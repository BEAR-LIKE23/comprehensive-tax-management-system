
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your project's URL and anon key
export const supabaseUrl = 'https://lgzttojfsvqalrvlgwnr.supabase.co';
export const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnenR0b2pmc3ZxYWxydmxnd25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzOTE2NjgsImV4cCI6MjA3ODk2NzY2OH0.fOVvO5B7IqSrr4a7AvuxtinpX9KHHMloJAF9xFKNUN0';

if (!supabaseUrl) {
    console.error("Supabase URL is not configured. Please add it to services/supabaseClient.ts");
}

if (!supabaseKey) {
    console.error("Supabase Key is not configured. Please add it to services/supabaseClient.ts");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
