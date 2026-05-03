import React, { useState, useEffect } from 'react';
import { Send, Users, User, BellRing, History, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useNotificationStore, AdminNotification } from '@/stores/notificationStore';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function NotificationsPage() {
  const { sendNotification, notifications, fetchNotifications } = useNotificationStore();
  const [isSending, setIsSending] = useState(false);
  const [targetType, setTargetType] = useState<'all' | 'segment' | 'single'>('all');
  const [targetValue, setTargetValue] = useState('Unverified KYC Users');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error('Title and message are required.');
      return;
    }
    
    setIsSending(true);
    try {
      await sendNotification({
        title,
        message,
        targetType,
        targetValue: targetType === 'all' ? undefined : targetValue
      });
      toast.success('Push notification dispatched successfully.');
      setTitle('');
      setMessage('');
    } catch (err) {
      toast.error('Failed to send notification.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Messaging & Notifications</h2>
          <p className="text-muted-foreground">Manage push alerts and system announcements.</p>
        </div>
      </div>

      <Tabs defaultValue="composer" className="space-y-6">
        <TabsList className="bg-background border">
          <TabsTrigger value="composer">Composer</TabsTrigger>
          <TabsTrigger value="history">History & Logs</TabsTrigger>
          <TabsTrigger value="scheduled" disabled className="opacity-50">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="composer" className="space-y-6 focus-visible:outline-none">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BellRing className="w-5 h-5 text-primary" /> Create New Broadcast</CardTitle>
              <CardDescription>Construct and dispatch a push notification payload to user segments.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSend}>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Target Audience</Label>
                  <RadioGroup value={targetType} onValueChange={(v: any) => setTargetType(v)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`flex items-center space-x-3 p-3 border rounded-md cursor-pointer transition-colors ${targetType === 'all' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`} onClick={() => setTargetType('all')}>
                      <RadioGroupItem value="all" id="t-all" />
                      <Label htmlFor="t-all" className="flex-1 cursor-pointer flex flex-col gap-0.5">
                        <span className="flex items-center font-medium"><Users className="w-4 h-4 mr-2" /> Everyone</span>
                        <span className="text-[10px] text-muted-foreground">Approx. 35,420 users</span>
                      </Label>
                    </div>
                    <div className={`flex items-center space-x-3 p-3 border rounded-md cursor-pointer transition-colors ${targetType === 'segment' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`} onClick={() => setTargetType('segment')}>
                      <RadioGroupItem value="segment" id="t-segment" />
                      <Label htmlFor="t-segment" className="flex-1 cursor-pointer flex flex-col gap-0.5 font-medium">
                        <span className="flex items-center"><Users className="w-4 h-4 mr-2" /> Segment</span>
                        <span className="text-[10px] text-muted-foreground">Targeted attributes</span>
                      </Label>
                    </div>
                    <div className={`flex items-center space-x-3 p-3 border rounded-md cursor-pointer transition-colors ${targetType === 'single' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`} onClick={() => setTargetType('single')}>
                      <RadioGroupItem value="single" id="t-single" />
                      <Label htmlFor="t-single" className="flex-1 cursor-pointer flex flex-col gap-0.5 font-medium">
                        <span className="flex items-center"><User className="w-4 h-4 mr-2" /> Individual</span>
                        <span className="text-[10px] text-muted-foreground">By User UID</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {targetType === 'single' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <Label>User UID</Label>
                    <Input placeholder="Enter specific user UID..." value={targetType === 'single' ? targetValue : ''} onChange={(e) => setTargetValue(e.target.value)} />
                  </div>
                )}
                {targetType === 'segment' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <Label>Segment Filter</Label>
                    <select 
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                    >
                      <option>Unverified KYC Users</option>
                      <option>Users with &gt; 5000 Berry</option>
                      <option>Inactive for 30 days</option>
                      <option>Top Earners (Last Month)</option>
                    </select>
                  </div>
                )}

                <Separator />

                <div className="space-y-2 pt-2">
                  <Label>Notification Title</Label>
                  <Input 
                    placeholder="e.g. New Survey Available!" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground text-right">{title.length}/60</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Message Body</Label>
                  <Textarea 
                    placeholder="Enter the main push notification text..." 
                    className="h-24 resize-none"
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground text-right">{message.length}/160</p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-md bg-muted/30">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Play Notification Sound</Label>
                    <div className="text-xs text-muted-foreground">Trigger the default alert tone on user devices.</div>
                  </div>
                  <Switch defaultChecked />
                </div>

              </CardContent>
              <CardFooter className="flex justify-end pt-2">
                <Button type="submit" className="bg-primary hover:bg-primary/90 w-full sm:w-auto" disabled={isSending}>
                  {isSending ? (
                    <span className="flex items-center"><Send className="w-4 h-4 mr-2 animate-spin" /> Dispatching...</span>
                  ) : (
                    <span className="flex items-center"><Send className="w-4 h-4 mr-2" /> Send Push Notification</span>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="focus-visible:outline-none">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="w-5 h-5 text-primary" /> Delivery History</CardTitle>
              <CardDescription>Track the status and performance of recent broadcasts.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-muted-foreground font-medium text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 text-left">Sent At</th>
                      <th className="px-6 py-3 text-left">Notification Details</th>
                      <th className="px-6 py-3 text-left">Audience</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Sender</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {notifications.map((notif) => (
                      <tr key={notif.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-medium">{format(new Date(notif.sentAt), 'MMM d, HH:mm')}</span>
                            <span className="text-xs text-muted-foreground">{format(new Date(notif.sentAt), 'yyyy')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col max-w-[250px]">
                            <span className="font-semibold truncate">{notif.title}</span>
                            <span className="text-muted-foreground text-xs line-clamp-1">{notif.message}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 capitalize">
                            {notif.targetType === 'all' ? <Users className="w-3.5 h-3.5" /> : notif.targetType === 'segment' ? <Users className="w-3.5 h-3.5 text-blue-500" /> : <User className="w-3.5 h-3.5 text-amber-500" />}
                            <span className="text-xs">
                              {notif.targetType} 
                              {notif.targetValue && <span className="text-muted-foreground ml-1">({notif.targetValue})</span>}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={notif.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            {notif.status === 'sent' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                            {notif.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                          {notif.sentBy}
                        </td>
                      </tr>
                    ))}
                    {notifications.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                          No notification records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

