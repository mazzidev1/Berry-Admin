/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase';
import { useAuthStore } from '@/stores/authStore';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

import RequireAdmin from '@/components/RequireAdmin';
import AdminLayout from '@/layouts/AdminLayout';
import LoginPage from '@/pages/Login';
import UnauthorizedPage from '@/pages/Unauthorized';
import PlaceholderPage from '@/pages/Placeholder';
import Dashboard from '@/pages/Dashboard';
import UsersPage from '@/pages/Users';
import UserDetailPage from '@/pages/UserDetail';
import PendingKycPage from '@/pages/PendingKyc';
import FlaggedAccountsPage from '@/pages/FlaggedAccounts';
import CreateUserPage from '@/pages/CreateUser';
import SurveysPage from '@/pages/Surveys';
import CreateSurveyPage from '@/pages/CreateSurvey';
import SurveySubmissionsPage from '@/pages/SurveySubmissions';
import RewardsPage from '@/pages/Rewards';
import RedemptionsPage from '@/pages/Redemptions';
import WithdrawalsPage from '@/pages/Withdrawals';
import BerryLedgerPage from '@/pages/BerryLedger';
import ReferralsPage from '@/pages/Referrals';
import NotificationsPage from '@/pages/Notifications';
import SettingsConfigPage from '@/pages/SettingsConfig';
import RafflesPage from '@/pages/Raffles';
import AdjustmentsPage from '@/pages/Adjustments';
import AdminUsersPage from '@/pages/AdminUsers';
import AuditLogPage from '@/pages/AuditLog';
import ProfileBuilderPage from '@/pages/ProfileBuilder';
import GenericConstructionPage from '@/pages/GenericConstruction';

export default function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      // Mock auth flow
      const stored = localStorage.getItem('mockAdminUser');
      if (stored) {
        setUser(JSON.parse(stored), 'superadmin');
      } else {
        setUser(null, null);
      }
      setLoading(false);
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult(true);
          const role = idTokenResult.claims.role as string | null;
          setUser(user, role);
        } catch (error) {
          console.error("Error getting user token", error);
          setUser(user, null);
        }
      } else {
        setUser(null, null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [setUser, setLoading]);

  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          <Route element={<RequireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/users/pending-kyc" element={<PendingKycPage />} />
              <Route path="/users/flagged" element={<FlaggedAccountsPage />} />
              <Route path="/users/create" element={<CreateUserPage />} />
              <Route path="/users/:userId" element={<UserDetailPage />} />
              
              <Route path="/surveys" element={<SurveysPage />} />
              <Route path="/surveys/submissions" element={<SurveySubmissionsPage />} />
              <Route path="/surveys/create" element={<CreateSurveyPage />} />
              <Route path="/surveys/:surveyId" element={<GenericConstructionPage title="Survey Detail" />} />
              
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/rewards/redemptions" element={<RedemptionsPage />} />
              <Route path="/rewards/raffles" element={<RafflesPage />} />
              
              <Route path="/finance/withdrawals" element={<WithdrawalsPage />} />
              <Route path="/finance/berry-ledger" element={<BerryLedgerPage />} />
              <Route path="/finance/adjustments" element={<AdjustmentsPage />} />
              
              <Route path="/profile-builder" element={<ProfileBuilderPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/referrals" element={<ReferralsPage />} />
              
              <Route path="/settings/config" element={<SettingsConfigPage />} />
              <Route path="/settings/admins" element={<AdminUsersPage />} />
              <Route path="/settings/audit" element={<AuditLogPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </TooltipProvider>
  );
}

