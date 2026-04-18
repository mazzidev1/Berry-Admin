import { create } from 'zustand';

export interface UserSurvey {
  id: string;
  title: string;
  category: string;
  reward: number;
  status: 'completed' | 'failed' | 'pending';
  completedAt: string;
}

export interface UserRedemption {
  id: string;
  itemName: string;
  cost: number;
  status: 'pending' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface UserReferral {
  id: string;
  displayName: string;
  status: 'active' | 'pending';
  joinedAt: string;
}

export interface UserAuditLog {
  id: string;
  action: string;
  actor: string;
  details: string;
  timestamp: string;
}

interface AdminUserState {
  currentUser: any | null;
  surveys: UserSurvey[];
  redemptions: UserRedemption[];
  notifications: UserNotification[];
  referrals: UserReferral[];
  auditLogs: UserAuditLog[];
  isLoading: boolean;
  
  // Actions
  fetchUserData: (userId: string) => Promise<void>;
  updateUserStatus: (updates: Partial<any>) => void;
  sendNotification: (notification: Omit<UserNotification, 'id' | 'createdAt' | 'read'>) => void;
  verifyKyc: (status: boolean) => void;
  addAuditLog: (action: string, details: string) => void;
}

export const useAdminUserStore = create<AdminUserState>((set, get) => ({
  currentUser: null,
  surveys: [],
  redemptions: [],
  notifications: [],
  referrals: [],
  auditLogs: [],
  isLoading: false,

  fetchUserData: async (userId: string) => {
    set({ isLoading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockUser = {
      id: userId,
      displayName: "Adaeze Obi",
      firstName: "Adaeze",
      lastName: "Obi",
      email: "adaeze.obi@example.com",
      phoneNumber: "+234 800 123 4567",
      berryBalance: 4500,
      walletBalance: 12500,
      kycVerified: false,
      phoneVerified: true,
      profileCompleted: true,
      referralCount: 4,
      referralCode: "ADA2026X",
      referredBy: "user-system",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
      flagged: false,
      bankName: "Guaranty Trust Bank",
      accountNumber: "0123456789",
      kycName: "ADAEZE OBI",
    };

    const mockSurveys: UserSurvey[] = [
      { id: 's1', title: 'Tech Gadget Review', category: 'Tech', reward: 250, status: 'completed', completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
      { id: 's2', title: 'Financial Literacy 101', category: 'Finance', reward: 500, status: 'completed', completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
      { id: 's3', title: 'Healthy Eating Habits', category: 'Health', reward: 150, status: 'failed', completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() },
      { id: 's4', title: 'Car Insurance Preferences', category: 'Finance', reward: 300, status: 'completed', completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString() },
    ];

    const mockRedemptions: UserRedemption[] = [
      { id: 'r1', itemName: '₦5,000 Airtime Voucher', cost: 2500, status: 'delivered', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
      { id: 'r2', itemName: 'Starbucks Gift Card', cost: 1500, status: 'pending', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() },
    ];

    const mockNotifications: UserNotification[] = [
      { id: 'n1', title: 'Welcome to Berry!', message: 'Start earning by completing your first survey.', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString() },
      { id: 'n2', title: 'KYC Document Needed', message: 'Please upload a clear picture of your ID.', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() },
    ];

    const mockReferrals: UserReferral[] = [
      { id: 'ref1', displayName: 'Chidi Benson', status: 'active', joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString() },
      { id: 'ref2', displayName: 'Fatima Yusuf', status: 'pending', joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
      { id: 'ref3', displayName: 'Oluwaseun Ajayi', status: 'active', joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString() },
      { id: 'ref4', displayName: 'Grace Emmanuel', status: 'active', joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString() },
    ];

    const mockAuditLogs: UserAuditLog[] = [
      { id: 'log1', action: 'USER_REGISTERED', actor: 'System', details: 'User account created via organic referral.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString() },
      { id: 'log2', action: 'PHONE_VERIFIED', actor: 'System', details: 'Phone number verified via OTP.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 44).toISOString() },
      { id: 'log3', action: 'LOGIN_ATTEMPT', actor: 'Adaeze Obi', details: 'Successful login from iPhone 13.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    ];

    set({ 
      currentUser: mockUser, 
      surveys: mockSurveys, 
      redemptions: mockRedemptions, 
      notifications: mockNotifications,
      referrals: mockReferrals,
      auditLogs: mockAuditLogs,
      isLoading: false 
    });
  },

  updateUserStatus: (updates) => {
    set((state) => ({
      currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null
    }));
  },

  sendNotification: (notification) => {
    const newNotif: UserNotification = {
      ...notification,
      id: `n-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications]
    }));
    get().addAuditLog('NOTIFICATION_SENT', `Admin sent message: ${notification.title}`);
  },

  verifyKyc: (status) => {
    set((state) => ({
      currentUser: state.currentUser ? { ...state.currentUser, kycVerified: status } : null
    }));
    get().addAuditLog(status ? 'KYC_APPROVED' : 'KYC_REJECTED', `Admin manually ${status ? 'approved' : 'rejected'} KYC status.`);
  },

  addAuditLog: (action, details) => {
    const newLog: UserAuditLog = {
      id: `log-${Date.now()}`,
      action,
      actor: 'Admin (You)',
      details,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      auditLogs: [newLog, ...state.auditLogs]
    }));
  }
}));
