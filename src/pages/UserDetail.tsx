import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Bell, ShieldAlert, Gift, RefreshCw, Smartphone, 
  CircleCheck, Search, Activity, Flag, Plus, Send,
  CheckCircle2, XCircle, Clock, ExternalLink, UserPlus,
  FileText, History
} from "lucide-react";
import { format } from "date-fns";
import { useAdminUserStore } from '@/stores/adminUserStore';
import { toast } from 'sonner';

export default function UserDetailPage() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "profile");
  const { 
    currentUser: user, 
    surveys, 
    redemptions, 
    notifications, 
    referrals, 
    auditLogs, 
    isLoading,
    fetchUserData,
    sendNotification,
    verifyKyc,
    updateUserStatus,
    addAuditLog
  } = useAdminUserStore();

  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId, fetchUserData]);

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifBody) return;
    sendNotification({ title: notifTitle, message: notifBody });
    setNotifTitle("");
    setNotifBody("");
    toast.success("Notification sent successfully");
  };

  const handleKycToggle = (checked: boolean) => {
    verifyKyc(checked);
    toast.success(`KYC status updated to ${checked ? 'Verified' : 'Unverified'}`);
  };

  const handleFlagToggle = (checked: boolean) => {
    updateUserStatus({ flagged: checked });
    addAuditLog(checked ? 'USER_FLAGGED' : 'USER_UNFLAGGED', `Admin ${checked ? 'flagged' : 'unflagged'} the user.`);
    toast.info(`User ${checked ? 'flagged' : 'unflagged'}`);
  };

  const filteredSurveys = surveys.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRedemptions = redemptions.filter(r => 
    r.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-start space-x-6">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between bg-card p-6 rounded-xl border shadow-sm">
        <div className="flex items-start space-x-6">
          <div className="w-20 h-20 bg-primary/10 text-primary text-3xl font-bold rounded-full flex items-center justify-center shrink-0">
            {user.displayName.charAt(0)}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              {user.displayName}
              {user.flagged && <Flag className="w-5 h-5 text-destructive" />}
            </h1>
            <div className="flex flex-col gap-0.5">
              <p className="text-muted-foreground flex items-center gap-2 text-sm">
                <span>{user.email}</span>
                <span className="text-muted/40">•</span>
                <span>{user.phoneNumber}</span>
              </p>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">UID: {user.id}</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-3">
              {user.kycVerified ? (
                <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                  <ShieldAlert className="w-3 h-3 mr-1" /> KYC Verified
                </Badge>
              ) : (
                <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">
                  <ShieldAlert className="w-3 h-3 mr-1" /> KYC Pending
                </Badge>
              )}
              {user.phoneVerified && (
                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                  <Smartphone className="w-3 h-3 mr-1" /> Phone Verified
                </Badge>
              )}
              {user.profileCompleted && (
                <Badge className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200">
                  <CircleCheck className="w-3 h-3 mr-1" /> Profile Complete
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 md:justify-end">
          <Button variant="outline" size="sm" onClick={() => { setActiveTab("notifications"); window.scrollTo({ top: 400, behavior: 'smooth' }); }}>
            <Bell className="w-4 h-4 mr-2" /> Notify
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" /> Adjust Berry
          </Button>
          <Button 
            variant={user.flagged ? "default" : "destructive"} 
            size="sm" 
            className={user.flagged ? "" : "bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-transparent"}
            onClick={() => handleFlagToggle(!user.flagged)}
          >
            <Flag className="w-4 h-4 mr-2" /> {user.flagged ? "Unflag User" : "Flag User"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto p-0 space-x-6 overflow-x-auto">
          <TabsTrigger value="profile" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 text-sm font-medium">Profile</TabsTrigger>
          <TabsTrigger value="berry" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 text-sm font-medium">Berry & Wallet</TabsTrigger>
          <TabsTrigger value="verification" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 text-sm font-medium">Verification</TabsTrigger>
          <TabsTrigger value="surveys" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 text-sm font-medium">Surveys</TabsTrigger>
          <TabsTrigger value="redemptions" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 text-sm font-medium">Redemptions</TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 text-sm font-medium">Notifications</TabsTrigger>
          <TabsTrigger value="referrals" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 text-sm font-medium">Referrals</TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 text-sm font-medium">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update personal details and basic account info.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input defaultValue={user.firstName} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input defaultValue={user.lastName} />
                </div>
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input defaultValue={user.displayName} />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input defaultValue={user.phoneNumber} />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input defaultValue={user.email} />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Registration Date</p>
                  <p className="font-medium">{format(new Date(user.createdAt), "PPP")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Referral Code</p>
                  <p className="font-mono bg-muted inline-block px-1.5 rounded text-foreground">{user.referralCode}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Referred By</p>
                  <p className="font-medium text-primary hover:underline cursor-pointer">{user.referredBy}</p>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button className="bg-primary hover:bg-primary/90 text-white">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="berry" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden border-primary/20">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="text-primary flex items-center gap-2">
                  <Activity className="w-5 h-5" /> Berry Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <h3 className="text-5xl font-black text-primary tracking-tight">{user.berryBalance.toLocaleString()}</h3>
                <div className="mt-4 flex gap-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  <div className="flex flex-col items-center">
                    <span className="text-green-600">Earned</span>
                    <span className="text-lg font-bold text-foreground">12,450</span>
                  </div>
                  <div className="w-px h-8 bg-border my-auto"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-amber-600">Spent</span>
                    <span className="text-lg font-bold text-foreground">7,950</span>
                  </div>
                </div>
                <Button variant="outline" className="mt-6 w-full gap-2">
                  <History className="w-4 h-4" /> View Transactions
                </Button>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-green-200">
              <CardHeader className="bg-green-50 pb-4">
                <CardTitle className="text-green-700 flex items-center gap-2">
                  <Gift className="w-5 h-5" /> Wallet Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <h3 className="text-5xl font-black text-green-600 tracking-tight">₦{user.walletBalance.toLocaleString()}</h3>
                <div className="mt-4 flex gap-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  <div className="flex flex-col items-center">
                    <span className="text-green-600">Received</span>
                    <span className="text-lg font-bold text-foreground">27,500</span>
                  </div>
                  <div className="w-px h-8 bg-border my-auto"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-destructive">Withdrawn</span>
                    <span className="text-lg font-bold text-foreground">15,000</span>
                  </div>
                </div>
                <Button variant="outline" className="mt-6 w-full gap-2 text-green-700 hover:text-green-800">
                  <ExternalLink className="w-4 h-4" /> View Payout History
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Identity & Verification</CardTitle>
              <CardDescription>Review and manage user identification status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${user.kycVerified ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                        {user.kycVerified ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold">KYC Verification</h4>
                        <p className="text-xs text-muted-foreground">Verify government ID and residency details.</p>
                      </div>
                    </div>
                    <Switch checked={user.kycVerified} onCheckedChange={handleKycToggle} />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold">Phone OTP Verification</h4>
                        <p className="text-xs text-muted-foreground">Authorized mobile number confirmation.</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-none">VERIFIED</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-xl border border-destructive/20">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${user.flagged ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                        <Flag className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold">Administrative Flag</h4>
                        <p className="text-xs text-muted-foreground tracking-tight">Prevent all financial activity and redemptions.</p>
                      </div>
                    </div>
                    <Switch checked={user.flagged} onCheckedChange={handleFlagToggle} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border bg-muted/20 aspect-[4/3] flex flex-col items-center justify-center p-6 text-center border-dashed">
                    <FileText className="w-10 h-10 text-muted-foreground/50 mb-4" />
                    <p className="text-sm font-medium text-muted-foreground mb-1">Government ID</p>
                    <p className="text-xs text-muted-foreground/60 mb-4">Front and Back</p>
                    <Button variant="secondary" size="sm" className="w-full">View Document</Button>
                  </div>
                </div>
              </div>

              <Separator />
              
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Payout Destination</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 italic text-sm">
                  <div className="bg-muted/30 p-4 rounded-lg border">
                    <p className="text-muted-foreground mb-1 non-italic font-bold text-[10px] uppercase">Bank Entity</p>
                    <p className="font-medium">{user.bankName}</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg border">
                    <p className="text-muted-foreground mb-1 non-italic font-bold text-[10px] uppercase">Account Number</p>
                    <p className="font-mono font-medium">{user.accountNumber}</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg border">
                    <p className="text-muted-foreground mb-1 non-italic font-bold text-[10px] uppercase">Settlement Name</p>
                    <p className="font-medium">{user.kycName}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surveys" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>User Participation</CardTitle>
                <CardDescription>A list of all surveys this user has engaged with.</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Filter surveys..." 
                  className="pl-9 h-9" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-bold text-xs uppercase tracking-wider">Survey Title</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider">Category</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider">Reward</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider text-right">Completed At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSurveys.length > 0 ? filteredSurveys.map((survey) => (
                      <TableRow key={survey.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{survey.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-bold tracking-widest uppercase">{survey.category}</Badge>
                        </TableCell>
                        <TableCell>
                          {survey.status === 'completed' ? (
                            <Badge className="bg-green-100 text-green-700 border-none shadow-none text-[10px]">COMPLETED</Badge>
                          ) : survey.status === 'failed' ? (
                            <Badge className="bg-destructive/10 text-destructive border-none shadow-none text-[10px]">FAILED</Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 border-none shadow-none text-[10px]">PENDING</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{survey.reward} B</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {format(new Date(survey.completedAt), "MMM d, yyyy HH:mm")}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-40 text-center text-muted-foreground italic">No related surveys found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="redemptions" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Spending History</CardTitle>
                <CardDescription>Items and vouchers redeemed using Berries.</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search redemptions..." 
                  className="pl-9 h-9" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-bold text-xs uppercase tracking-wider">Item Name</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider">Cost</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRedemptions.length > 0 ? filteredRedemptions.map((item) => (
                      <TableRow key={item.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell className="font-bold text-sm">{item.itemName}</TableCell>
                        <TableCell className="font-mono text-primary font-bold text-xs">{item.cost.toLocaleString()} B</TableCell>
                        <TableCell>
                          {item.status === 'delivered' ? (
                            <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">DELIVERED</Badge>
                          ) : (
                            <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">PENDING</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {format(new Date(item.createdAt), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-40 text-center text-muted-foreground italic">No redemptions to show.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication History</CardTitle>
                <CardDescription>Messages sent to this user in-app.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-4 rounded-xl border bg-muted/20 relative group hover:bg-muted transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-sm pr-12">{notif.title}</h4>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase">{format(new Date(notif.createdAt), "HH:mm, MMM d")}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{notif.message}</p>
                      {!notif.read && <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full"></div>}
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="h-40 flex items-center justify-center text-muted-foreground italic text-sm">No notification history.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-primary flex items-center gap-2">
                  <Send className="w-5 h-5" /> Send direct message
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest">Message Title</Label>
                    <Input 
                      placeholder="e.g. Account Update" 
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest">Notification Body</Label>
                    <textarea 
                      className="w-full min-h-[140px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                      placeholder="Type your message here..."
                      value={notifBody}
                      onChange={(e) => setNotifBody(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                    Dispatch Notification
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Referrals</p>
                  <p className="text-xl font-bold">{user.referralCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Referred Network</CardTitle>
              <CardDescription>Users who signed up using this user's invitation code.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {referrals.map((ref) => (
                  <div key={ref.id} className="p-4 rounded-xl border bg-card flex items-center gap-4 group hover:border-primary/30 transition-all cursor-default">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {ref.displayName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm tracking-tight">{ref.displayName}</h4>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase mb-1">{format(new Date(ref.joinedAt), "MMM d, yyyy")}</p>
                      <Badge variant="secondary" className={`text-[9px] py-0 h-4 border-none ${ref.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                        {ref.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0">
              <CardTitle>Security & Administrative Audit</CardTitle>
              <CardDescription>Chronological log of significant system events and modifications.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="relative border-l-2 border-muted ml-3 space-y-8 pb-4">
                {auditLogs.map((log, i) => (
                  <div key={log.id} className="relative pl-8">
                    <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-background ${i === 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`}></div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-xs uppercase tracking-widest text-foreground">{log.action}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}</span>
                      </div>
                      <p className="text-sm text-foreground/80">{log.details}</p>
                      <p className="text-[10px] text-muted-foreground">Performed by: <span className="font-medium text-primary uppercase">{log.actor}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

