'use client';
import React, { useState } from 'react';
import { useFocusStore } from '../stores/focus-store';
import { Plus, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const QuickEntry = () => {
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState(25);
  const addTask = useFocusStore(state => state.addTask);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title, minutes);
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center w-full max-w-2xl mx-auto mb-8 bg-background/50 p-2 rounded-xl backdrop-blur-sm border border-border/50">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
        <Plus size={20} />
      </div>
      <Input 
        value={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        placeholder="Bugün neye odaklanacaksın? (Örn: Raporu tamamla)"
        className="border-none shadow-none focus-visible:ring-0 bg-transparent text-lg h-12"
        autoFocus
      />
      
      <div className="flex items-center gap-2 border-l border-border/50 pl-2">
         <Input 
            type="number" 
            value={minutes}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMinutes(Number(e.target.value))}
            className="w-16 h-8 text-center border-none bg-accent/20"
            min={1}
            max={180}
         />
         <span className="text-muted-foreground text-sm mr-2">dk</span>
      </div>

      <Button type="submit" size="icon" className="h-10 w-10 rounded-lg">
        <ArrowRight size={18} />
      </Button>
    </form>
  );
};
