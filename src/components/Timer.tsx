import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Timer as TimerIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

type Mode = 'work' | 'break';

export default function Timer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<Mode>('work');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(prev => prev - 1);
        } else if (minutes > 0) {
          setMinutes(prev => prev - 1);
          setSeconds(59);
        } else {
          // Timer finished
          clearInterval(timerRef.current!);
          setIsActive(false);
          handleModeChange();
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, minutes, seconds]);

  const handleModeChange = () => {
    if (mode === 'work') {
      setMode('break');
      setMinutes(5);
    } else {
      setMode('work');
      setMinutes(25);
    }
    setSeconds(0);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(mode === 'work' ? 25 : 5);
    setSeconds(0);
  };

  const setWork = () => {
    setIsActive(false);
    setMode('work');
    setMinutes(25);
    setSeconds(0);
  };

  const setBreak = () => {
    setIsActive(false);
    setMode('break');
    setMinutes(5);
    setSeconds(0);
  };

  const progress = ((minutes * 60 + seconds) / (mode === 'work' ? 25 * 60 : 5 * 60)) * 100;

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-12 glass-card rounded-[40px] relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <TimerIcon size={180} />
      </div>

      <div className="flex space-x-2 bg-white/5 p-1.5 rounded-full border border-white/5">
        <button
          onClick={setWork}
          className={cn(
            "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
            mode === 'work' ? "bg-white text-slate-900 shadow-xl" : "text-slate-400 hover:text-white"
          )}
        >
          <TimerIcon size={12} />
          Trabalho
        </button>
        <button
          onClick={setBreak}
          className={cn(
            "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
            mode === 'break' ? "bg-white text-slate-900 shadow-xl" : "text-slate-400 hover:text-white"
          )}
        >
          <Coffee size={12} />
          Pausa
        </button>
      </div>

      <div className="relative flex items-center justify-center">
        {/* Progress ring base */}
        <svg className="w-72 h-72 transform -rotate-90">
          <circle
            cx="144"
            cy="144"
            r="136"
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            className="text-white/5"
          />
          {/* Active progress */}
          <motion.circle
            cx="144"
            cy="144"
            r="136"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={854.51} // 2 * pi * 136
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: 854.51 - (854.51 * progress) / 100 }}
            transition={{ duration: 1, ease: "linear" }}
            className={cn(
              "transition-colors duration-500",
              mode === 'work' ? "text-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" : "text-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
            )}
            style={{ filter: mode === 'work' ? 'drop-shadow(0 0 8px rgba(99,102,241,0.5))' : 'drop-shadow(0 0 8px rgba(6,182,212,0.5))' }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div 
            key={`${minutes}-${seconds}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-8xl font-bold mono tracking-tighter text-white"
          >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </motion.div>
          <div className="text-[10px] text-slate-500 mt-4 uppercase tracking-[0.3em] font-bold">
            {isActive ? 'Foco Máximo' : 'Suspenso'}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-8">
        <button
          onClick={resetTimer}
          className="p-4 text-slate-500 hover:text-white transition-all rounded-2xl hover:bg-white/5 active:scale-90"
          title="Resetar"
        >
          <RotateCcw size={28} />
        </button>
        
        <button
          onClick={toggleTimer}
          className={cn(
            "w-20 h-20 rounded-[28px] flex items-center justify-center transition-all transform active:scale-95 shadow-2xl",
            isActive 
              ? "bg-white/5 text-white border border-white/20" 
              : "bg-white text-slate-900"
          )}
        >
          {isActive ? <Pause size={36} /> : <Play size={36} className="ml-1" />}
        </button>

        <button
          onClick={handleModeChange}
          className="p-4 text-slate-500 hover:text-white transition-all rounded-2xl hover:bg-white/5 active:scale-90"
          title="Trocar Modo"
        >
          {mode === 'work' ? <Coffee size={28} /> : <TimerIcon size={28} />}
        </button>
      </div>
    </div>
  );
}
