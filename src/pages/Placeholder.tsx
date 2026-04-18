import { Construction } from 'lucide-react';

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
        <Construction className="w-8 h-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-semibold mb-2">{title}</h1>
      <p className="text-muted-foreground max-w-sm">This module is coming in a future phase.</p>
    </div>
  );
}
