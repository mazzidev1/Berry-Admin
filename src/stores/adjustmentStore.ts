import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Adjustment {
  id: string;
  userId: string;
  userName: string;
  type: 'credit' | 'debit';
  walletType: 'berry' | 'cash';
  amount: number;
  reason: string;
  adminId: string;
  adminName: string;
  date: string;
}

interface AdjustmentState {
  adjustments: Adjustment[];
  isLoading: boolean;
  fetchAdjustments: () => Promise<void>;
  addAdjustment: (adjustment: Omit<Adjustment, 'id' | 'date' | 'adminId' | 'adminName'>) => void;
}

export const useAdjustmentStore = create<AdjustmentState>()(
  persist(
    (set) => ({
      adjustments: [],
      isLoading: false,
      fetchAdjustments: async () => {
        set({ isLoading: true });
        await new Promise(r => setTimeout(r, 500));
        set((state) => {
          if (state.adjustments.length > 0) return { isLoading: false };
          const initial = [
            { id: 'adj-10234', userId: 'user-45', userName: 'Alice Freeman', type: 'credit', walletType: 'berry', amount: 500, reason: 'Correction for system error on survey compensation', adminId: 'admin-1', adminName: 'Super Admin', date: new Date(Date.now() - 86400000).toISOString() },
            { id: 'adj-10235', userId: 'user-89', userName: 'Bob Smith', type: 'debit', walletType: 'cash', amount: 1000, reason: 'Manual correction of duplicate withdrawal processing', adminId: 'admin-1', adminName: 'Super Admin', date: new Date(Date.now() - 86400000 * 2).toISOString() },
          ] as Adjustment[];
          return { adjustments: initial, isLoading: false };
        });
      },
      addAdjustment: (data) => {
        const newAdj: Adjustment = {
          ...data,
          id: `adj-${Math.floor(Math.random() * 100000)}`,
          date: new Date().toISOString(),
          adminId: 'admin-1', // Mocking current admin
          adminName: 'Super Admin',
        };
        set((state) => ({ adjustments: [newAdj, ...state.adjustments] }));
      }
    }),
    { name: 'adjustment-storage' }
  )
);
