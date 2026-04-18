import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useForm as useHookForm } from 'react-hook-form';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useHookForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!import.meta.env.VITE_FIREBASE_API_KEY) {
        // Mock auth login
        if (data.email === 'admin@berry.com' || data.email === 'test@test.com' || data.email.includes("admin")) {
           const mockUser = { uid: "mock-admin-123", email: data.email, displayName: "Admin User", emailVerified: true } as any;
           localStorage.setItem('mockAdminUser', JSON.stringify(mockUser));
           setUser(mockUser, 'superadmin');
           navigate('/');
        } else {
           setError("Access denied. Use 'admin@berry.com' to login.");
        }
        setIsLoading(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      const idTokenResult = await user.getIdTokenResult();
      const role = idTokenResult.claims.role as string | null;

      if (role === 'admin' || role === 'superadmin') {
        setUser(user, role);
        navigate('/');
      } else {
        await auth.signOut();
        setUser(null, null);
        setError("Access denied. Your account does not have admin privileges.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1115] text-white p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-lg shadow-xl shadow-black/50 border border-white/10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">B</span>
          </div>
          <h1 className="text-2xl font-semibold text-card-foreground">Berry Admin</h1>
          <p className="text-muted-foreground mt-1">Portal Access</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-card-foreground">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="admin@berry.com" 
              className="bg-background text-foreground border-border focus-visible:ring-primary"
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-card-foreground">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              className="bg-background text-foreground border-border focus-visible:ring-primary"
              {...register('password')}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
