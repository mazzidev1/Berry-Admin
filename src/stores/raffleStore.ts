import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Raffle {
  id: string;
  title: string;
  prize: string;
  ticketCost: number;
  ticketsSold: number;
  maxTickets: number | null;
  status: 'active' | 'drawn' | 'draft';
  drawDate: string;
  winnerId?: string;
}

interface RaffleState {
  raffles: Raffle[];
  isLoading: boolean;
  fetchRaffles: () => Promise<void>;
  addRaffle: (raffle: Omit<Raffle, 'id' | 'ticketsSold'>) => void;
  updateRaffle: (id: string, updates: Partial<Raffle>) => void;
  deleteRaffle: (id: string) => void;
}

export const useRaffleStore = create<RaffleState>()(
  persist(
    (set) => ({
      raffles: [],
      isLoading: false,
      fetchRaffles: async () => {
        set({ isLoading: true });
        await new Promise(r => setTimeout(r, 500));
        set((state) => {
          if (state.raffles.length > 0) return { isLoading: false };
          const initialRaffles: Raffle[] = [
            { id: 'raf-1', title: 'Weekly Mega Draw #1', prize: 'iPhone 15 Pro', ticketCost: 100, ticketsSold: 1240, maxTickets: 5000, status: 'active', drawDate: new Date(Date.now() + 86400000 * 5).toISOString() },
            { id: 'raf-2', title: 'Cash Splash #10', prize: '₦50,000 Cash', ticketCost: 50, ticketsSold: 2500, maxTickets: null, status: 'drawn', drawDate: new Date(Date.now() - 86400000).toISOString(), winnerId: 'user-123' },
            { id: 'raf-3', title: 'Berry Bonanza', prize: '10,000 Berry', ticketCost: 200, ticketsSold: 0, maxTickets: 1000, status: 'draft', drawDate: new Date(Date.now() + 86400000 * 10).toISOString() },
          ];
          return { raffles: initialRaffles, isLoading: false };
        });
      },
      addRaffle: (data) => {
        const newRaffle: Raffle = {
          ...data,
          id: `raf-${Date.now()}`,
          ticketsSold: 0,
        };
        set((state) => ({ raffles: [newRaffle, ...state.raffles] }));
      },
      updateRaffle: (id, updates) => {
        set((state) => ({
          raffles: state.raffles.map(r => r.id === id ? { ...r, ...updates } : r)
        }));
      },
      deleteRaffle: (id) => {
        set((state) => ({
          raffles: state.raffles.filter(r => r.id !== id)
        }));
      }
    }),
    { name: 'raffle-storage' }
  )
);
