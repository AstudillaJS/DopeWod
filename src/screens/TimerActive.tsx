import { useState, useEffect } from 'react';
import { type Screen } from '../App';
import { Pause, Play, RotateCcw, Dumbbell, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface TimerActiveProps {
  onNavigate: (screen: Screen) => void;
}

export function TimerActive({ onNavigate }: TimerActiveProps) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(true);
  const [rounds, setRounds] = useState(3);
  const totalRounds = 12;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (rounds < totalRounds) {
        setRounds(rounds + 1);
        setTimeLeft(60);
      } else {
        setIsActive(false);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, rounds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / 60) * 100;

  return (
    <div className="relative min-h-screen pt-20 sm:pt-28 pb-16 sm:pb-32 px-4 sm:px-6 flex flex-col items-center justify-between overflow-hidden bg-primary-navy">
      {/* Back Button */}
      <button 
        onClick={() => onNavigate('control')}
        className="absolute top-8 sm:top-12 left-4 sm:left-6 z-20 p-2 text-white/40 hover:text-primary-cyan transition-colors flex items-center gap-2 font-headline font-black text-[10px] tracking-widest uppercase select-none"
      >
        <ArrowLeft size={16} />
        ABORTAR
      </button>

      {/* Background Kinetic Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-primary-cyan to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-tr from-primary-cyan to-transparent" />
      </div>

      {/* Round Counter */}
      <div className="w-full max-w-md text-center z-10 mt-4">
        <div className="inline-flex items-baseline gap-2 sm:gap-4 mb-1 sm:mb-2">
           <span className="font-headline font-black text-primary-cyan text-2xl sm:text-4xl italic tracking-tighter uppercase">RONDA</span>
           <span className="font-headline font-black text-3xl sm:text-5xl tracking-tighter text-white">{rounds}</span>
           <span className="font-headline font-black text-lg sm:text-2xl italic tracking-tighter text-white/20">/ {totalRounds}</span>
        </div>
        <p className="font-headline text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] uppercase text-on-surface-variant/60 font-black mt-1">EMOM ENTRENAMIENTO</p>
      </div>

      {/* Circular Timer Visualization */}
      <div className="relative flex items-center justify-center w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 my-6 sm:my-8 select-none">
        {/* Glow Layer */}
        <div className="absolute inset-2 sm:inset-4 rounded-full bg-black/40 border border-primary-cyan/20 shadow-[0_0_120px_rgba(0,194,255,0.1)]" />
        
        {/* Progress System System */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle 
            className="text-white opacity-5" 
            cx="50%" cy="50%" r="46%" 
            fill="transparent" 
            stroke="currentColor" 
            strokeWidth="2" 
          />
          <motion.circle 
            className="text-primary-cyan" 
            cx="50%" cy="50%" r="46%" 
            fill="transparent" 
            stroke="currentColor" 
            strokeWidth="4" 
            strokeLinecap="butt"
            strokeDasharray="290"
            animate={{ strokeDashoffset: 290 - (progress / 100) * 290 }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>

        {/* Content Group */}
        <div className="text-center z-10 flex flex-col items-center">
          <p className="font-headline text-[9px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-primary-cyan font-black mb-2 sm:mb-4">TIEMPO RESTANTE</p>
          <div className="font-headline font-black text-6xl sm:text-8xl md:text-9xl tracking-tighter text-cyan-glow text-white leading-none tabular-nums italic">
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Control Module */}
      <div className="w-full max-w-md flex flex-col gap-6 sm:gap-8 z-10">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <button 
            onClick={() => setIsActive(!isActive)}
            className="bg-black/60 hover:bg-black/80 text-white font-headline font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] py-5 sm:py-8 flex items-center justify-center gap-2 sm:gap-4 transition-all active:scale-95 border-b-4 border-primary-cyan text-xs sm:text-sm select-none"
          >
            {isActive ? <Pause size={20} className="sm:w-6 sm:h-6" fill="currentColor" /> : <Play size={20} className="sm:w-6 sm:h-6" fill="currentColor" />}
            {isActive ? 'PAUSA' : 'RESUMIR'}
          </button>
          <button 
            onClick={() => { setTimeLeft(60); setIsActive(false); }}
            className="bg-black/60 hover:bg-black/80 text-white font-headline font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] py-5 sm:py-8 flex items-center justify-center gap-2 sm:gap-4 transition-all active:scale-95 border-b-4 border-white/20 text-xs sm:text-sm select-none"
          >
            <RotateCcw size={20} className="sm:w-6 sm:h-6" />
            REINICIAR
          </button>
        </div>

        {/* Tactical Feed (Bento) */}
        <div className="bg-black/40 border-l-[8px] sm:border-l-[12px] border-primary-cyan p-4 sm:p-8 flex items-center justify-between group overflow-hidden relative">
          <div className="absolute right-0 top-0 opacity-5 grayscale -translate-y-4 translate-x-4 pointer-events-none">
            <Dumbbell size={120} />
          </div>
          <div className="relative z-10 pr-4">
            <p className="font-headline text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] text-primary-cyan font-black uppercase mb-1 sm:mb-2">PRÓXIMO</p>
            <h3 className="font-headline font-bold text-lg sm:text-2xl uppercase tracking-tight text-white mb-1 break-words">KETTLEBELL SWINGS</h3>
            <p className="font-headline text-[10px] text-on-surface-variant font-black uppercase tracking-wider opacity-60">15 REPETICIONES / INTENSIDAD ALTA</p>
          </div>
          <div className="hidden sm:block relative z-10 shrink-0">
            <Dumbbell size={40} className="text-white/20" />
          </div>
        </div>
      </div>

      {/* Decorative Side Monoliths */}
      <div className="fixed top-1/2 -left-20 -translate-y-1/2 rotate-90 hidden lg:block pointer-events-none select-none">
        <p className="font-headline font-black text-9xl text-white/5 tracking-tighter uppercase italic">PROTOCOL</p>
      </div>
      <div className="fixed top-1/2 -right-20 -translate-y-1/2 -rotate-90 hidden lg:block pointer-events-none select-none">
        <p className="font-headline font-black text-9xl text-white/5 tracking-tighter uppercase italic">ACCURACY</p>
      </div>
    </div>
  );
}
