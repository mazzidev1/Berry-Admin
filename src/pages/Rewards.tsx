import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Settings, Smartphone, Wifi, CreditCard, Gift } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const generateMockRewards = () => [
  { id: 'rw-1', name: 'MTN Airtime ₦500', cost: 500, type: 'airtime', provider: 'MTN', active: true, stock: -1, redeemedCount: 15420 },
  { id: 'rw-2', name: 'Airtel Airtime ₦500', cost: 500, type: 'airtime', provider: 'Airtel', active: true, stock: -1, redeemedCount: 8200 },
  { id: 'rw-3', name: 'MTN Data 1.5GB', cost: 1200, type: 'data', provider: 'MTN', active: true, stock: -1, redeemedCount: 9340 },
  { id: 'rw-4', name: 'Wallet Cash ₦1000', cost: 1000, type: 'cash', provider: 'System', active: true, stock: -1, redeemedCount: 22100 },
  { id: 'rw-5', name: 'Wallet Cash ₦5000', cost: 4800, type: 'cash', provider: 'System', active: true, stock: -1, redeemedCount: 4500 },
  { id: 'rw-6', name: 'Shoprite Voucher ₦10000', cost: 9500, type: 'voucher', provider: 'Shoprite', active: false, stock: 0, redeemedCount: 150 },
  { id: 'rw-7', name: 'Netflix Gift Card $15', cost: 15000, type: 'voucher', provider: 'Netflix', active: true, stock: 45, redeemedCount: 890 },
];

export default function RewardsPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setData(generateMockRewards());
      setIsLoading(false);
    }, 600);
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case 'airtime': return <Smartphone className="w-5 h-5 text-blue-500" />;
      case 'data': return <Wifi className="w-5 h-5 text-purple-500" />;
      case 'cash': return <CreditCard className="w-5 h-5 text-green-500" />;
      case 'voucher': return <Gift className="w-5 h-5 text-orange-500" />;
      default: return <Gift className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reward Catalog</h2>
          <p className="text-muted-foreground">Manage the items users can redeem with their Berry balance.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 hidden sm:flex">
          <Plus className="w-4 h-4 mr-2" /> Add Reward
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="flex-1 pb-2">
                <Skeleton className="h-10 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : (
          data.map((reward) => (
            <Card key={reward.id} className={`flex flex-col ${!reward.active ? 'opacity-60 grayscale-[0.5]' : ''}`}>
              <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <div className="p-2 bg-muted rounded-md w-fit mb-2">
                    {getIcon(reward.type)}
                  </div>
                  <CardTitle className="text-base leading-tight">{reward.name}</CardTitle>
                  <CardDescription className="text-xs uppercase font-medium tracking-wider pt-1">{reward.provider}</CardDescription>
                </div>
                {reward.active ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-transparent shadow-none">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <div className="flex items-center justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Cost</span>
                  <span className="font-bold text-primary">{reward.cost.toLocaleString()} Berry</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Stock</span>
                  <span className="font-medium">{reward.stock === -1 ? 'Unlimited' : reward.stock}</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2">
                  <span className="text-muted-foreground">Redeemed</span>
                  <span className="font-medium">{reward.redeemedCount.toLocaleString()} times</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 pt-0">
                <Button variant="outline" className="flex-1 h-8 px-2 text-xs">
                  <Edit className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button variant="outline" className="flex-1 h-8 px-2 text-xs">
                  <Settings className="w-3 h-3 mr-1" /> Config
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
