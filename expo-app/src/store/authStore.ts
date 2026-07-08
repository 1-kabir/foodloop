import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase, UserRow } from '../lib/supabase';

export interface User {
  id: string;
  type: 'donor' | 'ngo';
  name: string;
  email: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  orgType: string | null;
  foodPrefs: string[];
  dietPref: string | null;
  registrationNumber: string | null;
  maxCapacityKg: number;
  pickupRadiusKm: number;
  verified: boolean;
  onboarded: boolean;
  verificationStatus: 'unsubmitted' | 'pending' | 'approved';
  expoPushToken: string | null;
  createdAt: string;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    type: row.type,
    name: row.name ?? '',
    email: row.email,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    orgType: row.org_type,
    foodPrefs: row.food_prefs ?? [],
    dietPref: row.diet_pref,
    registrationNumber: row.registration_number,
    maxCapacityKg: row.max_capacity_kg,
    pickupRadiusKm: row.pickup_radius_km,
    verified: row.verified,
    onboarded: row.onboarded,
    verificationStatus: row.verification_status,
    expoPushToken: row.expo_push_token,
    createdAt: row.created_at,
  };
}

interface AuthResult {
  error?: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isInitializing: boolean;
  initialize: () => Promise<void>;
  signUp: (params: { email: string; password: string; type: 'donor' | 'ngo'; name: string }) => Promise<AuthResult>;
  signIn: (params: { email: string; password: string }) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<{
    name: string;
    address: string;
    lat: number;
    lng: number;
    orgType: string;
    foodPrefs: string[];
    dietPref: string;
    registrationNumber: string;
    maxCapacityKg: number;
    pickupRadiusKm: number;
    expoPushToken: string;
  }>) => Promise<AuthResult>;
  setOnboarded: () => Promise<void>;
  submitVerification: () => Promise<void>;
  approveVerification: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// camelCase app fields -> snake_case DB columns
const FIELD_MAP: Record<string, string> = {
  name: 'name',
  address: 'address',
  lat: 'lat',
  lng: 'lng',
  orgType: 'org_type',
  foodPrefs: 'food_prefs',
  dietPref: 'diet_pref',
  registrationNumber: 'registration_number',
  maxCapacityKg: 'max_capacity_kg',
  pickupRadiusKm: 'pickup_radius_km',
  expoPushToken: 'expo_push_token',
};

async function fetchProfile(userId: string): Promise<UserRow | null> {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
  if (error) {
    console.warn('Failed to fetch user profile:', error.message);
    return null;
  }
  return data as UserRow;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isInitializing: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await fetchProfile(session.user.id);
      set({ session, user: profile ? rowToUser(profile) : null, isInitializing: false });
    } else {
      set({ session: null, user: null, isInitializing: false });
    }

    // Keep the store in sync with token refreshes, external sign-outs, etc.
    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (newSession?.user) {
        const profile = await fetchProfile(newSession.user.id);
        set({ session: newSession, user: profile ? rowToUser(profile) : null });
      } else {
        set({ session: null, user: null });
      }
    });
  },

  signUp: async ({ email, password, type, name }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'Sign up did not return a user. Check your inbox to confirm your email if confirmation is required.' };

    // Create the matching profile row. RLS policy "Allow users to insert own
    // profile" requires auth.uid() = id, which holds here since we're still
    // authenticated as the user we just created.
    const { data: profileRow, error: profileError } = await supabase
      .from('users')
      .insert({ id: data.user.id, email, type, name })
      .select()
      .single();

    if (profileError) return { error: profileError.message };

    set({ session: data.session, user: rowToUser(profileRow as UserRow) });
    return {};
  },

  signIn: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'Login failed. Please try again.' };

    const profile = await fetchProfile(data.user.id);
    if (!profile) return { error: 'Could not load your profile. Please try again.' };

    set({ session: data.session, user: rowToUser(profile) });
    return {};
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },

  updateUser: async (patch) => {
    const { user } = get();
    if (!user) return { error: 'Not signed in' };

    const dbPatch: Record<string, unknown> = {};
    for (const key of Object.keys(patch) as (keyof typeof patch)[]) {
      const dbKey = FIELD_MAP[key];
      if (dbKey) dbPatch[dbKey] = (patch as any)[key];
    }

    const { data, error } = await supabase
      .from('users')
      .update(dbPatch)
      .eq('id', user.id)
      .select()
      .single();

    if (error) return { error: error.message };

    set({ user: rowToUser(data as UserRow) });
    return {};
  },

  setOnboarded: async () => {
    const { user } = get();
    if (!user) return;
    const { data, error } = await supabase
      .from('users')
      .update({ onboarded: true })
      .eq('id', user.id)
      .select()
      .single();
    if (!error && data) set({ user: rowToUser(data as UserRow) });
  },

  submitVerification: async () => {
    const { user } = get();
    if (!user) return;
    const { data, error } = await supabase
      .from('users')
      .update({ verification_status: 'pending' })
      .eq('id', user.id)
      .select()
      .single();
    if (!error && data) set({ user: rowToUser(data as UserRow) });
  },

  approveVerification: async () => {
    // Demo-mode shortcut (no admin review pipeline yet): flips straight to
    // approved and keeps the legacy `verified` boolean in sync so the
    // Smart Match engine (server/routes/match.js, filters on `verified`)
    // continues to work unchanged.
    const { user } = get();
    if (!user) return;
    const { data, error } = await supabase
      .from('users')
      .update({ verification_status: 'approved', verified: true })
      .eq('id', user.id)
      .select()
      .single();
    if (!error && data) set({ user: rowToUser(data as UserRow) });
  },

  refreshUser: async () => {
    const { user } = get();
    if (!user) return;
    const profile = await fetchProfile(user.id);
    if (profile) set({ user: rowToUser(profile) });
  },
}));
