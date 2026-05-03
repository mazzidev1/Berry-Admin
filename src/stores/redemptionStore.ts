import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Redemption {
  id: string;
  userId: string;
  userName: string;
  rewardName: string;
  berryCost: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  autoProcess: boolean;
}

interface RedemptionState {
  redemptions: Redemption[];
  isLoading: boolean;
  fetchRedemptions: () => Promise<void>;
  updateStatus: (id: string, status: Redemption['status']) => void;
}

export const useRedemptionStore = create<RedemptionState>()(
  persist(
    (set) => ({
      redemptions: [],
      isLoading: false,
      fetchRedemptions: async () => {
        set({ isLoading: true });
        await new Promise(r => setTimeout(r, 600));
        set((state) => {
          if (state.redemptions.length > 0) return { isLoading: false };
          const rewards = ["MTN Airtime ₦500", "Wallet Cash ₦1000", "Netflix Gift Card $15", "Airtel Data 1.5GB"];
          const initial: Redemption[] = Array.from({ length: 15 }).map((_, i) => ({
            id: `red-${20000 + i}`,
            userId: `user-${i + 1}`,
            userName: `Participant ${i + 1}`,
            rewardName: rewards[i % rewards.length],
            berryCost: Math.floor(Math.random() * 5000) + 500,
            status: i === 0 ? 'pending' : (i % 2 === 0 ? 'approved' : 'rejected'),
            date: new Date(Date.now() - Math.random() * 86400000 * 5).toISOString(),
            autoProcess: i === 0,
          }));
          return { redemptions: initial, isLoading: false };
        });
      },
      updateStatus: (id, status) => {
        set((state) => ({
          redemptions: state.redemptions.map(r => r.id === id ? { ...r, status } : r)
        }));
      }
    }),
    { name: 'redemption-storage' }
  )
);
