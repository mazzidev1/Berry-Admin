import React from 'react';
import { Settings, Save, ShieldAlert, Key } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function SettingsConfigPage() {
  const handleSave = () => {
    toast.success("Global configuration updated successfully.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">App Configuration</h2>
        <p className="text-muted-foreground">Manage global application variables and limits.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Economy & Limits</CardTitle>
            <CardDescription>Configure conversion rates and thresholds.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Berry to Naira (₦) Exchange Rate</Label>
                <div className="flex items-center space-x-2">
                  <Input defaultValue="10" type="number" />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Berry = 1 ₦</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Minimum Withdrawal Amount (₦)</Label>
                <Input defaultValue="1000" type="number" />
              </div>
              <div className="space-y-2">
                <Label>Referral Bonus (Berry)</Label>
                <Input defaultValue="50" type="number" />
              </div>
              <div className="space-y-2">
                <Label>Daily Max Withdrawal per User (₦)</Label>
                <Input defaultValue="50000" type="number" />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Require KYC for Withdrawals</h4>
                  <p className="text-sm text-muted-foreground">User must verify ID before fiat withdrawal is allowed.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Auto-Approve Redemptions</h4>
                  <p className="text-sm text-muted-foreground">Allow small value digital items (airtime/data) to bypass manual review.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t px-6 py-4">
            <Button onClick={handleSave} className="ml-auto"><Save className="w-4 h-4 mr-2" /> Save Config</Button>
          </CardFooter>
        </Card>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-lg text-red-600 flex items-center gap-2"><Key className="w-5 h-5" /> API Webhooks (Danger Zone)</CardTitle>
            <CardDescription>Endpoints for third-party integration (e.g., Telecom Airtime API, Payment Gateway).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Airtime Provider Webhook URL</Label>
              <Input defaultValue="https://api.provider.com/v1/webhook" type="password" />
            </div>
            <div className="space-y-2">
              <Label>Bank Payout Secret Key</Label>
              <Input defaultValue="sk_live_1234567890" type="password" />
            </div>
          </CardContent>
          <CardFooter className="bg-red-50/50 border-t px-6 py-4">
            <Button variant="destructive" className="ml-auto">Update Secrets</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
