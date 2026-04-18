import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';

interface AuthState {
  user: FirebaseUser | null;
  role: 'admin' | 'superadmin' | null;
  loading: boolean;
  setUser: (user: FirebaseUser | null, role: string | null) => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  loading: true,
  setUser: (user, role) =>
    set({
      user,
      role: (role === 'admin' || role === 'superadmin') ? role : null,
      loading: false, // Generally setting user means we are done loading
    }),
  setLoading: (v) => set({ loading: v }),
}));
