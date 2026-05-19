import { type Screen } from '../App';
import { History } from 'lucide-react';
import { cn } from '../lib/utils';

interface PlannerProps {
  onNavigate: (screen: Screen) => void;
}

export function Planner({ onNavigate }: PlannerProps) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-176px)] p-4 md:p-8 max-w-[1400px] mx-auto w-full">
      <div className="flex-grow bg-[#051224]/30 border border-white/5 flex flex-col items-center justify-center text-center p-12 border-dashed">
         <div className="text-white/5 mb-12 transform hover:rotate-12 transition-transform duration-700">
            <History size={240} strokeWidth={0.5} />
         </div>
         <h1 className="font-headline text-5xl md:text-8xl font-black text-white/20 uppercase italic tracking-tighter leading-none mb-6">
           ARCHIVO HISTÓRICO
         </h1>
         <p className="font-headline text-white/10 text-sm md:text-base font-black uppercase tracking-[0.5em] italic">
           REPOSITORIO DE MISIONES PREVIAS
         </p>
      </div>
    </div>
  );
}
