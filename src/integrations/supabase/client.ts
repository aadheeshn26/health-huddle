// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kharczyblouoyoungpcj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoYXJjenlibG91b3lvdW5ncGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MjExODMsImV4cCI6MjA2NTQ5NzE4M30.VnmxfH9Rz07p8HikN4QFUAoJo_cwHO6aOFK-XVJTARU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);