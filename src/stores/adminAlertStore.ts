import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  receivedAt: string;
  isRead: boolean;
  link?: string;
}

interface AdminAlertState {
  alerts: AdminAlert[];
  unreadCount: number;
  fetchAlerts: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addAlert: (alert: Omit<AdminAlert, 'id' | 'receivedAt' | 'isRead'>) => void;
}

export const useAdminAlertStore = create<AdminAlertState>()(
  persist(
    (set, get) => ({
      alerts: [],
      unreadCount: 0,
      fetchAlerts: () => {
        set((state) => {
          if (state.alerts.length > 0) {
             return { unreadCount: state.alerts.filter(a => !a.isRead).length };
          }
          const initial: AdminAlert[] = [
            {
              id: 'a1',
              type: 'warning',
              title: 'Flagged Account',
              message: 'Account user-99 was flagged for suspicious referral activity.',
              receivedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              isRead: false,
              link: '/users/flagged'
            },
            {
              id: 'a2',
              type: 'info',
              title: 'Pending Withdrawal',
              message: 'New withdrawal request of ₦15,000 from GTBank.',
              receivedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
              isRead: false,
              link: '/finance/withdrawals'
            },
            {
              id: 'a3',
              type: 'success',
              title: 'KYC Verified',
              message: 'John Doe completed KYC verification.',
              receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
              isRead: true,
            }
          ];
          return { alerts: initial, unreadCount: 2 };
        });
      },
      markAsRead: (id) => {
        set((state) => {
          const newAlerts = state.alerts.map(a => a.id === id ? { ...a, isRead: true } : a);
          return { 
            alerts: newAlerts,
            unreadCount: newAlerts.filter(a => !a.isRead).length 
          };
        });
      },
      markAllAsRead: () => {
        set((state) => ({
          alerts: state.alerts.map(a => ({ ...a, isRead: true })),
          unreadCount: 0
        }));
      },
      addAlert: (data) => {
        const newAlert: AdminAlert = {
          ...data,
          id: `alert-${Date.now()}`,
          receivedAt: new Date().toISOString(),
          isRead: false,
        };
        set((state) => ({
          alerts: [newAlert, ...state.alerts],
          unreadCount: state.unreadCount + 1
        }));
      }
    }),
    { name: 'admin-alert-storage' }
  )
);
