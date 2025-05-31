import { createClient } from '@supabase/supabase-js';

    const supabaseUrl = '';
    const supabaseAnonKey = '';
    
    let supabaseInstance = null;

    if (supabaseUrl && supabaseAnonKey) {
      try {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
        console.log("Supabase client initialized successfully.");
      } catch (error) {
        console.error("Failed to create Supabase client:", error);
        supabaseInstance = null;
      }
    } else {
      console.warn("Supabase URL or Anon Key is not provided. Supabase client will not be initialized.");
    }

    export const supabase = supabaseInstance;