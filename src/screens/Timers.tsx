import { type Screen } from '../App';
import { Timer, Repeat, Settings, Gauge } from 'lucide-react';
import type { ReactNode } from 'react';

interface TimersProps {
  onNavigate: (screen: Screen) => void;
}

export function Timers({ onNavigate }: TimersProps) {
  return (
    <div className="px-4 sm:px-6 md:px-12 py-6 sm:py-12 max-w-[1400px] mx-auto space-y-6 sm:space-y-12">
      {/* Editorial Header */}
      <section className="flex flex-col gap-3 sm:gap-6 border-l-[8px] sm:border-l-[12px] border-primary-cyan pl-4 sm:pl-8 py-2 sm:py-4">
        <h2 className="font-headline text-3xl sm:text-6xl md:text-[100px] font-black uppercase tracking-tighter leading-[0.8] text-[#1E3A5F]/20 select-none">
          SISTEMAS DE
        </h2>
        <h2 className="font-headline text-4xl sm:text-7xl md:text-[120px] font-black uppercase tracking-tighter leading-[0.8] text-primary-cyan italic">
          PRECISIÓN
        </h2>
      </section>

      {/* Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5">
        <ControlCard 
          title="TABATA"
          desc="Máxima intensidad: 20s ON / 10s OFF."
          footer="8 RONDAS"
          icon={<Gauge size={120} className="sm:w-[180px] sm:h-[180px]" />}
          onClick={() => onNavigate('timer-active')}
        />
        <ControlCard 
          title="EMOM"
          desc="Every Minute on the Minute."
          footer="10 MIN"
          icon={<Timer size={120} className="sm:w-[180px] sm:h-[180px]" />}
          onClick={() => onNavigate('timer-active')}
        />
        <ControlCard 
          title="AMRAP"
          desc="As Many Reps As Possible."
          footer="LIBRE"
          icon={<Repeat size={120} className="sm:w-[180px] sm:h-[180px]" />}
          onClick={() => onNavigate('timer-active')}
        />
        <div 
          onClick={() => onNavigate('timer-config')}
          className="bg-primary-cyan p-6 sm:p-10 md:p-12 flex flex-col justify-between min-h-[300px] sm:min-h-[400px] relative overflow-hidden group cursor-pointer transition-all hover:brightness-105 select-none"
        >
          <div className="absolute right-0 top-0 p-4 sm:p-8 opacity-10 group-hover:rotate-90 transition-transform duration-700 pointer-events-none">
             <Settings size={120} strokeWidth={1} className="text-primary-navy sm:w-[180px] sm:h-[180px]" />
          </div>
          <div>
            <h3 className="font-headline text-5xl sm:text-7xl md:text-[100px] font-black text-white italic leading-none tracking-tighter mb-2 sm:mb-4">CUSTOM</h3>
            <p className="font-headline text-primary-navy font-black text-xs sm:text-sm uppercase tracking-widest leading-none">CONFIGURACIÓN DE ATLETA</p>
          </div>
          <div className="flex items-center justify-between mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-primary-navy/20">
            <span className="font-headline text-xl sm:text-3xl md:text-4xl font-black italic text-white uppercase group-hover:translate-x-2 transition-transform">ADAPTATIVO</span>
            <button className="bg-white/40 text-white font-headline font-black px-6 sm:px-12 py-3 sm:py-4 uppercase text-xs tracking-widest backdrop-blur-md hover:bg-white/50 active:scale-95 transition-all">START</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ControlCard({ title, desc, footer, icon, onClick }: { title: string; desc: string; footer: string; icon: ReactNode; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="bg-[#051224] p-6 sm:p-10 md:p-12 min-h-[300px] sm:min-h-[400px] flex flex-col justify-between relative overflow-hidden group cursor-pointer border border-transparent hover:border-primary-cyan/20 transition-all select-none"
    >
      <div className="absolute right-0 top-0 p-4 sm:p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
         {icon}
      </div>
      <div>
        <h3 className="font-headline text-5xl sm:text-7xl md:text-[100px] font-black text-white italic leading-none tracking-tighter mb-2 sm:mb-4 opacity-40 group-hover:opacity-100 transition-opacity">{title}</h3>
        <p className="font-headline text-white/20 font-black text-xs sm:text-sm uppercase tracking-widest leading-relaxed max-w-xs">{desc}</p>
      </div>
      <div className="flex items-center justify-between mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/5">
        <span className="font-headline text-xl sm:text-3xl md:text-4xl font-black italic text-white uppercase">{footer}</span>
        <button 
          className="bg-primary-cyan text-primary-navy font-headline font-black px-6 sm:px-12 py-3 sm:py-4 uppercase text-xs tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_10px_20px_rgba(0,194,255,0.2)]"
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          START
        </button>
      </div>
    </div>
  );
}
