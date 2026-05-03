import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useAdminAlertStore } from '@/stores/adminAlertStore';
import { auth } from '@/firebase';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Flag, ClipboardCheck, Gift, Trophy,
  Landmark, BookOpen, Settings, ListPlus, Bell, ChevronLeft, ChevronRight, Search, FileText, Share2, LogOut, ShieldAlert,
  Info, AlertTriangle, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

const navGroups = [
  {
    label: 'OVERVIEW',
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    ]
  },
  {
    label: 'USERS',
    items: [
      { name: 'All Users', path: '/users', icon: Users },
      { name: 'Pending KYC', path: '/users/pending-kyc', icon: ShieldAlert },
      { name: 'Flagged Accounts', path: '/users/flagged', icon: Flag },
    ]
  },
  {
    label: 'SURVEYS',
    items: [
      { name: 'All Surveys', path: '/surveys', icon: ClipboardCheck },
      { name: 'Submissions', path: '/surveys/submissions', icon: ListPlus },
    ]
  },
  {
    label: 'REWARDS',
    items: [
      { name: 'Reward Categories', path: '/rewards', icon: Gift },
      { name: 'Redemptions', path: '/rewards/redemptions', icon: FileText },
      { name: 'Raffle Draws', path: '/rewards/raffles', icon: Trophy },
    ]
  },
  {
    label: 'FINANCE',
    items: [
      { name: 'Withdrawals', path: '/finance/withdrawals', icon: Landmark },
      { name: 'Berry Ledger', path: '/finance/berry-ledger', icon: BookOpen },
      { name: 'Adjustments', path: '/finance/adjustments', icon: Settings },
    ]
  },
  {
    label: 'CONTENT',
    items: [
      { name: 'Profile Builder', path: '/profile-builder', icon: FileText },
      { name: 'Notifications', path: '/notifications', icon: Bell },
    ]
  },
  {
    label: 'REFERRALS',
    items: [
      { name: 'Referral Overview', path: '/referrals', icon: Share2 },
    ]
  },
  {
    label: 'SETTINGS',
    items: [
      { name: 'App Config', path: '/settings/config', icon: Settings },
      { name: 'Admin Users', path: '/settings/admins', icon: Users },
      { name: 'Audit Log', path: '/settings/audit', icon: FileText },
    ]
  }
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const { alerts, unreadCount, fetchAlerts, markAsRead, markAllAsRead } = useAdminAlertStore();

  const handleLogout = async () => {
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
       localStorage.removeItem('mockAdminUser');
       setUser(null, null);
       return;
    }
    await auth.signOut();
    setUser(null, null);
  };

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;
    let logoutTimer: NodeJS.Timeout;

    const resetTimers = () => {
      clearTimeout(inactivityTimer);
      clearTimeout(logoutTimer);
      setShowInactivityWarning(false);
      // Show warning at 55 minutes
      inactivityTimer = setTimeout(() => {
        setShowInactivityWarning(true);
      }, 55 * 60 * 1000);
      // Auto logout at 60 minutes
      logoutTimer = setTimeout(() => {
        handleLogout();
      }, 60 * 60 * 1000);
    };

    const handleUserActivity = () => resetTimers();

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    resetTimers();

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      clearTimeout(inactivityTimer);
      clearTimeout(logoutTimer);
    };
  }, []);

  const getPageTitle = () => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.path === location.pathname) {
          return item.name;
        }
      }
    }
    return 'Admin Portal';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 bg-[#0F1115] text-white transition-all duration-300 flex flex-col z-20",
        collapsed ? "w-16" : "w-64"
      )}>
        <div className="h-16 flex items-center px-4 border-b border-white/10 shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <span className="font-bold">B</span>
          </div>
          {!collapsed && <span className="ml-3 font-semibold truncate animate-in fade-in">Berry Admin</span>}
        </div>

        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          {navGroups.map((group, i) => (
            <div key={i} className="mb-6">
              {!collapsed && (
                <div className="px-4 mb-2 text-xs font-semibold text-white/50 tracking-wider">
                  {group.label}
                </div>
              )}
              {collapsed && <div className="h-4" />} {/* Spacer */}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <React.Fragment key={item.name}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.path}
                          className={cn(
                            "flex items-center px-4 py-2 mx-2 rounded-lg transition-colors",
                            isActive 
                              ? "bg-primary text-white" 
                              : "text-white/70 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          <item.icon className={cn("w-5 h-5 shrink-0", !collapsed && "mr-3")} />
                          {!collapsed && <span className="truncate">{item.name}</span>}
                        </Link>
                      </TooltipTrigger>
                      {collapsed && <TooltipContent side="right">{item.name}</TooltipContent>}
                    </Tooltip>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="shrink-0 border-t border-white/10 p-4">
          <div className={cn("flex items-center", collapsed && "justify-center")}>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.displayName || 'Admin'}</p>
                <p className="text-xs text-white/50 truncate">{user?.email}</p>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between">
            {!collapsed && (
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white/70 hover:text-white hover:bg-white/10 px-2 h-8">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn("p-2 rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors", collapsed && "mx-auto")}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        collapsed ? "pl-16" : "pl-64"
      )}>
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search users or surveys..." 
                className="w-full pl-9 pr-4 py-1.5 bg-muted rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative p-2 text-muted-foreground hover:bg-muted rounded-full focus:outline-none transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={markAllAsRead}>
                      Mark all as read
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[350px]">
                  {alerts.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No new notifications
                    </div>
                  ) : (
                    <div className="divide-y">
                      {alerts.map((alert) => (
                        <div 
                          key={alert.id} 
                          className={cn(
                            "p-4 hover:bg-muted/50 transition-colors cursor-pointer relative",
                            !alert.isRead && "bg-primary/[0.03]"
                          )}
                          onClick={() => {
                            markAsRead(alert.id);
                            if (alert.link) navigate(alert.link);
                          }}
                        >
                          {!alert.isRead && (
                             <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                          )}
                          <div className="flex gap-3">
                            <div className="mt-1 shrink-0">{getAlertIcon(alert.type)}</div>
                            <div className="flex-1 space-y-1">
                              <p className={cn("text-sm font-medium leading-none", !alert.isRead && "text-primary")}>
                                {alert.title}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {alert.message}
                              </p>
                              <p className="text-[10px] text-muted-foreground pt-1">
                                {formatDistanceToNow(new Date(alert.receivedAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                <div className="p-2 border-t text-center">
                  <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                    <Link to="/notifications">Open Notification Center</Link>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center focus:outline-none hover:bg-primary/20 transition-colors">
                {user?.email?.charAt(0).toUpperCase()}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                   <div className="flex flex-col">
                     <span>{user?.displayName || 'Admin'}</span>
                     <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                   </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings/config')}>
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      <AlertDialog open={showInactivityWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Session Expiring</AlertDialogTitle>
            <AlertDialogDescription>
              Your session is about to expire due to inactivity. Click 'Stay Logged In' to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
             <Button onClick={() => setShowInactivityWarning(false)}>Stay Logged In</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
