import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  bankName: string;
  accountNum: string;
  status: 'pending' | 'processing' | 'failed' | 'success';
  date: string;
  requiresReview: boolean;
}

interface WithdrawalState {
  withdrawals: Withdrawal[];
  isLoading: boolean;
  fetchWithdrawals: () => Promise<void>;
  updateStatus: (id: string, status: Withdrawal['status']) => void;
}

export const useWithdrawalStore = create<WithdrawalState>()(
  persist(
    (set) => ({
      withdrawals: [],
      isLoading: false,
      fetchWithdrawals: async () => {
        set({ isLoading: true });
        await new Promise(r => setTimeout(r, 600));
        set((state) => {
          if (state.withdrawals.length > 0) return { isLoading: false };
          const banks = ["Kuda Bank", "GTBank", "Access Bank", "Opay", "Zenith Bank"];
          const initial: Withdrawal[] = Array.from({ length: 15 }).map((_, i) => ({
            id: `wth-${10000 + i}`,
            userId: `user-${i + 1}`,
            userName: `Participant ${i + 1}`,
            amount: Math.floor(Math.random() * 45000) + 1000,
            bankName: banks[i % banks.length],
            accountNum: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
            status: i === 0 ? 'pending' : (i % 3 === 0 ? 'success' : 'processing'),
            date: new Date(Date.now() - Math.random() * 86400000 * 5).toISOString(),
            requiresReview: i === 0,
          }));
          return { withdrawals: initial, isLoading: false };
        });
      },
      updateStatus: (id, status) => {
        set((state) => ({
          withdrawals: state.withdrawals.map(w => w.id === id ? { ...w, status } : w)
        }));
      }
    }),
    { name: 'withdrawal-storage' }
  )
);
