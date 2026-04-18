import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1115] text-white p-4">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-semibold mb-2">Unauthorized</h1>
        <p className="text-muted-foreground max-w-sm mb-8">
          You do not have the required permissions to access this portal.
        </p>
        <Button className="bg-primary hover:bg-primary/90 text-white" render={<Link to="/login" />}>
          Back to Login
        </Button>
      </div>
    </div>
  );
}
