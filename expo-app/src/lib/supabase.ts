import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase client environment variables are not set. Ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are present in your .env configuration.');
}

// AsyncStorage is required on React Native — the Supabase JS SDK defaults to
// `localStorage`, which does not exist off-web, so sessions would never
// persist across app restarts without this adapter wired in explicitly.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// Database row shapes (mirrors server/schema.sql + migrations/001_*.sql)
export interface UserRow {
  id: string;
  email: string;
  type: 'donor' | 'ngo';
  name: string | null;
  org_type: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  food_prefs: string[] | null;
  diet_pref: string | null;
  registration_number: string | null;
  max_capacity_kg: number;
  pickup_radius_km: number;
  verified: boolean;
  onboarded: boolean;
  verification_status: 'unsubmitted' | 'pending' | 'approved';
  expo_push_token: string | null;
  created_at: string;
}

export interface ListingRow {
  id: string;
  donor_id: string;
  food_name: string;
  category: string;
  qty_kg: number;
  qty_remaining_kg: number;
  expiry_window: string;
  expiry_at: string;
  photo_url: string | null;
  status: 'available' | 'partial' | 'fully_claimed' | 'collected' | 'expired';
  pickup_window_start: string | null;
  pickup_window_end: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface ClaimRow {
  id: string;
  listing_id: string;
  ngo_id: string;
  qty_claimed_kg: number;
  pickup_time: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  qr_token: string;
  completed_at: string | null;
  created_at: string;
}
