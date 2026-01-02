'use client';
import React from 'react';
import { useFocusStore } from '../stores/focus-store';
import { Coffee, SkipForward, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const BreakOverlay = () => {
  const { isBreak, timeLeft, timerState, completedSessions, skipBreak, startBreak, pauseTimer } = useFocusStore();

  if (!isBreak) return null;

  const isLongBreak = timeLeft > 5 * 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-green-950/90 backdrop-blur-sm">
      <div className="text-center text-white">
        <div className="mb-6">
          <Coffee size={64} className="mx-auto text-green-400 animate-bounce" />
        </div>
        
        <h2 className="text-3xl font-bold mb-2">
          {isLongBreak ? 'Uzun Mola Zamanı! 🎉' : 'Kısa Mola'}
        </h2>
        <p className="text-green-300 mb-8">
          {completedSessions} oturum tamamlandı. Harika gidiyorsun!
        </p>

        <div className="text-7xl font-mono font-bold mb-8 text-green-400">
          {formatTime(timeLeft)}
        </div>

        <div className="flex gap-4 justify-center">
          {timerState === 'running' ? (
            <Button onClick={pauseTimer} size="lg" variant="outline" className="text-white border-white/30">
              Duraklat
            </Button>
          ) : (
            <Button onClick={startBreak} size="lg" className="bg-green-500 hover:bg-green-600">
              <Play size={20} className="mr-2" /> Molayı Başlat
            </Button>
          )}
          
          <Button onClick={skipBreak} size="lg" variant="ghost" className="text-white/60 hover:text-white">
            <SkipForward size={20} className="mr-2" /> Atla
          </Button>
        </div>
      </div>
    </div>
  );
};
