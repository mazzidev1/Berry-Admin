import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'moderator' | 'support';
  status: 'active' | 'inactive';
  lastLogin: string;
}

interface AdminState {
  admins: AdminUser[];
  isLoading: boolean;
  fetchAdmins: () => Promise<void>;
  addAdmin: (admin: Omit<AdminUser, 'id' | 'lastLogin'>) => void;
  updateAdmin: (id: string, updates: Partial<AdminUser>) => void;
  deleteAdmin: (id: string) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      admins: [],
      isLoading: false,
      fetchAdmins: async () => {
        set({ isLoading: true });
        await new Promise(r => setTimeout(r, 500));
        set((state) => {
          if (state.admins.length > 0) return { isLoading: false };
          const initialAdmins: AdminUser[] = [
            { id: 'adm-1', name: 'John SuperAdmin', email: 'john@founder.com', role: 'superadmin', status: 'active', lastLogin: '2 hrs ago' },
            { id: 'adm-2', name: 'Support Sarah', email: 'sarah@support.com', role: 'support', status: 'active', lastLogin: '5 mins ago' },
            { id: 'adm-3', name: 'Mike Manager', email: 'mike@ops.com', role: 'moderator', status: 'inactive', lastLogin: '3 days ago' },
          ];
          return { admins: initialAdmins, isLoading: false };
        });
      },
      addAdmin: (data) => {
        const newAdmin: AdminUser = {
          ...data,
          id: `adm-${Date.now()}`,
          lastLogin: 'Never',
        };
        set((state) => ({ admins: [newAdmin, ...state.admins] }));
      },
      updateAdmin: (id, updates) => {
        set((state) => ({
          admins: state.admins.map(a => a.id === id ? { ...a, ...updates } : a)
        }));
      },
      deleteAdmin: (id) => {
        set((state) => ({
          admins: state.admins.filter(a => a.id !== id)
        }));
      }
    }),
    {
      name: 'admin-user-storage',
    }
  )
);
