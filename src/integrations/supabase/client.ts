// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bozdrfijtzymqnaqhhkl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvemRyZmlqdHp5bXFuYXFoaGtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNzc0NzIsImV4cCI6MjA1Nzc1MzQ3Mn0.RzOmdpzTo_AeB8_7RTYo8Cchg-eWaweF23Ok54LCY4U";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);