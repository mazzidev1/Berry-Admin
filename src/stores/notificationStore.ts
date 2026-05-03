import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  targetType: 'all' | 'segment' | 'single';
  targetValue?: string;
  status: 'sent' | 'scheduled' | 'failed';
  sentAt: string;
  sentBy: string;
}

interface NotificationState {
  notifications: AdminNotification[];
  sendNotification: (notification: Omit<AdminNotification, 'id' | 'sentAt' | 'sentBy' | 'status'>) => Promise<void>;
  fetchNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      sendNotification: async (data) => {
        // Mock delay
        await new Promise(r => setTimeout(r, 1000));
        
        const newNotif: AdminNotification = {
          ...data,
          id: `notif-${Date.now()}`,
          sentAt: new Date().toISOString(),
          sentBy: 'Current Admin',
          status: 'sent',
        };
        
        set((state) => ({ notifications: [newNotif, ...state.notifications] }));
      },
      fetchNotifications: () => {
        // Initial mock if empty
        set((state) => {
          if (state.notifications.length > 0) return state;
          return {
            notifications: [
              {
                id: 'notif-1',
                title: 'New Feature Released!',
                message: 'Check out the new profile builder in your dashboard.',
                targetType: 'all',
                status: 'sent',
                sentAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
                sentBy: 'System'
              },
              {
                id: 'notif-2',
                title: 'KYC Required',
                message: 'Please complete your KYC to unlock full withdrawal features.',
                targetType: 'segment',
                targetValue: 'Unverified KYC Users',
                status: 'sent',
                sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                sentBy: 'Admin Smith'
              }
            ]
          };
        });
      }
    }),
    {
      name: 'notification-storage',
    }
  )
);
