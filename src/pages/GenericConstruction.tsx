import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export default function GenericConstructionPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-20 animate-in fade-in">
      <Card className="w-full max-w-md bg-muted/20 border-dashed">
        <CardContent className="flex flex-col items-center p-12 text-center text-muted-foreground">
          <Activity className="w-12 h-12 mb-4 opacity-20" />
          <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
          <p className="text-sm">This module is part of a future sprint and currently under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
