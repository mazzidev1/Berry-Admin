import React, { useState } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuthStore } from '@/stores/authStore';

const createUserSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  initialBerry: z.coerce.number().min(0),
  initialWallet: z.coerce.number().min(0),
  referralCode: z.string().optional(),
  kycVerified: z.boolean(),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export default function CreateUserPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const navigate = useNavigate();
  const { role } = useAuthStore();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useHookForm<CreateUserFormValues>({
    // @ts-ignore zodResolver typing mismatch
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      initialBerry: 0,
      initialWallet: 0,
      kycVerified: false,
    }
  });

  const generateReferralCode = () => {
    const fn = watch("firstName") || "";
    const ln = watch("lastName") || "";
    if (fn.length > 0) {
      const prefix = (fn.substring(0, 3) + ln.substring(0, 2)).toUpperCase();
      const suffix = Math.floor(1000 + Math.random() * 9000);
      setValue("referralCode", `${prefix}${suffix}`);
    }
  };

  const onSubmit = async (data: CreateUserFormValues) => {
    setIsLoading(true);
    try {
      setProgressMsg("Creating auth account...");
      await new Promise(r => setTimeout(r, 600)); // mock network
      
      setProgressMsg("Writing profile...");
      await new Promise(r => setTimeout(r, 500)); // mock network
      
      setProgressMsg("Done ✓");
      toast.success(`User ${data.firstName} created successfully`);
      setTimeout(() => {
        navigate('/users');
      }, 500);
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  if (role !== 'superadmin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
        <h1 className="text-2xl font-semibold mb-2">Super Admin Only</h1>
        <p className="text-muted-foreground max-w-sm">You do not have permission to create users directly.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create User</h2>
        <p className="text-muted-foreground">Manually provision a new user account.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>Enter the user's basic information and initial balances.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...register("firstName")} disabled={isLoading} />
                {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...register("lastName")} onBlur={generateReferralCode} disabled={isLoading} />
                {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} disabled={isLoading} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Initial Password</Label>
                <Input id="password" type="password" {...register("password")} disabled={isLoading} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="initialBerry">Initial Berry Balance</Label>
                <Input id="initialBerry" type="number" {...register("initialBerry")} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initialWallet">Initial Wallet Balance (₦)</Label>
                <Input id="initialWallet" type="number" {...register("initialWallet")} disabled={isLoading} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralCode">Referral Code</Label>
                <div className="flex gap-2">
                  <Input id="referralCode" {...register("referralCode")} disabled={isLoading} />
                  <Button type="button" variant="outline" onClick={generateReferralCode} disabled={isLoading}>Generate</Button>
                </div>
              </div>
              
              <div className="space-y-2 flex flex-col justify-end pb-2">
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <Label htmlFor="kycVerified" className="cursor-pointer">KYC Verified</Label>
                  <Switch 
                    id="kycVerified" 
                    checked={watch("kycVerified")} 
                    onCheckedChange={(val) => setValue("kycVerified", val)} 
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="button" variant="outline" className="mr-2" onClick={() => navigate('/users')} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white min-w-[150px]" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {progressMsg}
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create User
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
