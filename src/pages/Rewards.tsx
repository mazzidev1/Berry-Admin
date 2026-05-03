import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Settings, Smartphone, Wifi, CreditCard, Gift, Loader2 } from 'lucide-react';
import { useRewardStore, Reward } from '@/stores/rewardStore';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function RewardsPage() {
  const { rewards: data, isLoading, fetchRewards, addReward, updateReward, deleteReward } = useRewardStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [type, setType] = useState<'airtime' | 'data' | 'cash' | 'voucher'>('airtime');
  const [provider, setProvider] = useState('');
  const [active, setActive] = useState(true);
  const [stock, setStock] = useState('-1');

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  const resetForm = () => {
    setName('');
    setCost('');
    setType('airtime');
    setProvider('');
    setActive(true);
    setStock('-1');
    setEditingReward(null);
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setName(reward.name);
    setCost(reward.cost.toString());
    setType(reward.type);
    setProvider(reward.provider);
    setActive(reward.active);
    setStock(reward.stock.toString());
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      cost: parseInt(cost) || 0,
      type,
      provider,
      active,
      stock: parseInt(stock) || 0,
    };

    if (editingReward) {
      updateReward(editingReward.id, payload);
      toast.success("Reward updated successfully");
    } else {
      addReward(payload);
      toast.success("Reward added to catalog");
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteReward(deleteId);
      toast.success("Reward removed from catalog");
      setDeleteId(null);
    }
  };

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
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reward Catalog</h2>
          <p className="text-muted-foreground">Manage the items users can redeem with their Berry balance.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> Add Reward
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingReward ? 'Edit Reward' : 'Add New Reward'}</DialogTitle>
                <DialogDescription>
                  Configure the reward parameters. Users will see this in the app catalog.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. MTN 1GB Data" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Category</Label>
                    <Select value={type} onValueChange={(v: any) => setType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="airtime">Airtime</SelectItem>
                        <SelectItem value="data">Data Bundle</SelectItem>
                        <SelectItem value="cash">Wallet Cash</SelectItem>
                        <SelectItem value="voucher">Gift Voucher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="provider">Provider</Label>
                    <Input id="provider" value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="e.g. MTN" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cost">Cost (Berry)</Label>
                    <Input id="cost" type="number" value={cost} onChange={(e) => setCost(e.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stock">Stock (-1: unlim)</Label>
                    <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="space-y-0.5">
                    <Label>Active Status</Label>
                    <div className="text-[10px] text-muted-foreground">Is this visible to users?</div>
                  </div>
                  <Switch checked={active} onCheckedChange={setActive} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full sm:w-auto">{editingReward ? 'Update Reward' : 'Create Reward'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
            <Card key={reward.id} className={`flex flex-col group transition-all hover:shadow-md ${!reward.active ? 'opacity-60 grayscale-[0.5]' : ''}`}>
              <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <div className="p-2 bg-muted rounded-md w-fit mb-2 group-hover:bg-primary/10 transition-colors">
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
              <CardFooter className="flex gap-2 pt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" className="flex-1 h-8 px-2 text-xs" onClick={() => handleEdit(reward)}>
                  <Edit className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button variant="outline" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(reward.id)}>
                  <Trash className="w-3 h-3" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from catalog?</AlertDialogTitle>
            <AlertDialogDescription>
              This reward will no longer be available for users to redeem. Existing redemption records will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" size="default">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" variant="destructive" size="default">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

