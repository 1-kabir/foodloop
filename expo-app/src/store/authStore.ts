import { create } from 'zustand';

export interface User {
  id: string;
  type: 'donor' | 'ngo';
  name: string;
  email: string;
  verified: boolean;
  onboarded: boolean;
  verificationStatus: 'unsubmitted' | 'pending' | 'approved';
}

interface AuthState {
  user: User | null;
  login: (type: 'donor' | 'ngo') => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  setOnboarded: () => void;
  submitVerification: () => void;
  approveVerification: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (type) =>
    set({
      user: {
        id: '1',
        type,
        name: type === 'donor' ? 'Local Cafe' : 'Hope NGO',
        email: 'test@example.com',
        verified: true,
        onboarded: false,
        // New accounts start as unsubmitted — must go through verification
        verificationStatus: 'unsubmitted',
      },
    }),
  logout: () => set({ user: null }),
  updateUser: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),
  setOnboarded: () =>
    set((state) => ({
      user: state.user ? { ...state.user, onboarded: true } : null,
    })),
  submitVerification: () =>
    set((state) => ({
      user: state.user
        ? { ...state.user, verificationStatus: 'pending' }
        : null,
    })),
  approveVerification: () =>
    set((state) => ({
      user: state.user
        ? { ...state.user, verificationStatus: 'approved' }
        : null,
    })),
}));
