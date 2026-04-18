import React, { useState } from 'react';
import { Send, Users, User, BellRing } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';

export default function NotificationsPage() {
  const [isSending, setIsSending] = useState(false);
  const [targetType, setTargetType] = useState('all'); // all, segment, single
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error('Title and message are required.');
      return;
    }
    
    setIsSending(true);
    // Mock network delay
    await new Promise(r => setTimeout(r, 1200));
    setIsSending(false);
    toast.success('Push notification dispatched successfully.');
    setTitle('');
    setMessage('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Push Notifications</h2>
        <p className="text-muted-foreground">Send real-time alerts or announcements to user devices.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BellRing className="w-5 h-5 text-primary" /> Composer</CardTitle>
          <CardDescription>Construct and dispatch a push notification payload.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSend}>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Target Audience</Label>
              <RadioGroup value={targetType} onValueChange={setTargetType} className="flex flex-col space-y-2">
                <div className="flex items-center space-x-3 p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setTargetType('all')}>
                  <RadioGroupItem value="all" id="t-all" />
                  <Label htmlFor="t-all" className="flex-1 cursor-pointer flex items-center justify-between">
                    <span className="flex items-center font-medium"><Users className="w-4 h-4 mr-2" /> All Active Users</span>
                    <span className="text-xs text-muted-foreground font-mono">~35k tokens</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setTargetType('segment')}>
                  <RadioGroupItem value="segment" id="t-segment" />
                  <Label htmlFor="t-segment" className="flex-1 cursor-pointer flex items-center font-medium">
                    <Users className="w-4 h-4 mr-2" /> Specific Segment (e.g. Unverified KYC)
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setTargetType('single')}>
                  <RadioGroupItem value="single" id="t-single" />
                  <Label htmlFor="t-single" className="flex-1 cursor-pointer flex items-center font-medium">
                    <User className="w-4 h-4 mr-2" /> Single User ID
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {targetType === 'single' && (
              <div className="space-y-2">
                <Label>User ID</Label>
                <Input placeholder="Enter specific user UID..." />
              </div>
            )}
            {targetType === 'segment' && (
              <div className="space-y-2">
                <Label>Segment Filter</Label>
                <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option>Unverified KYC Users</option>
                  <option>Users with &gt; 5000 Berry</option>
                  <option>Inactive for 30 days</option>
                </select>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t">
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
                <span className="flex items-center"><Users className="w-4 h-4 mr-2 animate-spin" /> Dispatching...</span>
              ) : (
                <span className="flex items-center"><Send className="w-4 h-4 mr-2" /> Send Push Notification</span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
