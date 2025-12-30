import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { INITIAL_TEAM_MEMBERS } from '@/lib/mock-team-data';

interface TechnicianSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
}

export function TechnicianSelect({ value, onValueChange }: TechnicianSelectProps) {
  // Use all members for now as mock data is limited
  const technicians = INITIAL_TEAM_MEMBERS;

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full bg-zinc-900 border-white/10">
        <SelectValue placeholder="Teknisyen Seçin" />
      </SelectTrigger>
      <SelectContent className="bg-zinc-900 border-white/10 text-white">
        {technicians.map((tech) => (
          <SelectItem key={tech.uid} value={tech.displayName} className="focus:bg-zinc-800 focus:text-white cursor-pointer">
            <div className="flex items-center gap-2">
              <Avatar className="w-5 h-5">
                 <AvatarImage src={tech.avatarUrl} />
                 <AvatarFallback className="text-[10px] bg-zinc-700">{tech.displayName.substring(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left">
                  <span className="text-sm font-medium">{tech.displayName}</span>
                  <span className="text-[10px] text-muted-foreground">{tech.role}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
