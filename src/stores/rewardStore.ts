import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Reward {
  id: string;
  name: string;
  cost: number;
  type: 'airtime' | 'data' | 'cash' | 'voucher';
  provider: string;
  active: boolean;
  stock: number; // -1 for unlimited
  redeemedCount: number;
  description?: string;
}

interface RewardState {
  rewards: Reward[];
  isLoading: boolean;
  fetchRewards: () => Promise<void>;
  addReward: (reward: Omit<Reward, 'id' | 'redeemedCount'>) => void;
  updateReward: (id: string, updates: Partial<Reward>) => void;
  deleteReward: (id: string) => void;
}

export const useRewardStore = create<RewardState>()(
  persist(
    (set) => ({
      rewards: [],
      isLoading: false,
      fetchRewards: async () => {
        set({ isLoading: true });
        await new Promise(r => setTimeout(r, 600));
        set((state) => {
          if (state.rewards.length > 0) return { isLoading: false };
          const initialRewards: Reward[] = [
            { id: 'rw-1', name: 'MTN Airtime ₦500', cost: 500, type: 'airtime', provider: 'MTN', active: true, stock: -1, redeemedCount: 15420 },
            { id: 'rw-2', name: 'Airtel Airtime ₦500', cost: 500, type: 'airtime', provider: 'Airtel', active: true, stock: -1, redeemedCount: 8200 },
            { id: 'rw-3', name: 'MTN Data 1.5GB', cost: 1200, type: 'data', provider: 'MTN', active: true, stock: -1, redeemedCount: 9340 },
            { id: 'rw-4', name: 'Wallet Cash ₦1000', cost: 1000, type: 'cash', provider: 'System', active: true, stock: -1, redeemedCount: 22100 },
            { id: 'rw-5', name: 'Wallet Cash ₦5000', cost: 4800, type: 'cash', provider: 'System', active: true, stock: -1, redeemedCount: 4500 },
            { id: 'rw-6', name: 'Shoprite Voucher ₦10000', cost: 9500, type: 'voucher', provider: 'Shoprite', active: false, stock: 0, redeemedCount: 150 },
            { id: 'rw-7', name: 'Netflix Gift Card $15', cost: 15000, type: 'voucher', provider: 'Netflix', active: true, stock: 45, redeemedCount: 890 },
          ];
          return { rewards: initialRewards, isLoading: false };
        });
      },
      addReward: (data) => {
        const newReward: Reward = {
          ...data,
          id: `rw-${Date.now()}`,
          redeemedCount: 0,
        };
        set((state) => ({ rewards: [newReward, ...state.rewards] }));
      },
      updateReward: (id, updates) => {
        set((state) => ({
          rewards: state.rewards.map(r => r.id === id ? { ...r, ...updates } : r)
        }));
      },
      deleteReward: (id) => {
        set((state) => ({
          rewards: state.rewards.filter(r => r.id !== id)
        }));
      }
    }),
    {
      name: 'reward-storage',
    }
  )
);
