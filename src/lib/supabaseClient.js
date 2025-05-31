import { createClient } from '@supabase/supabase-js'

// Ambil dari environment Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY

// Inisialisasi Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
