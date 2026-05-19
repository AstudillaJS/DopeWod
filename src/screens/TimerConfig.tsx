import { useState } from 'react';
import { type Screen } from '../App';
import { Minus, Plus, Play, Timer, Flame, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface TimerConfigProps {
  onNavigate: (screen: Screen) => void;
}

export function TimerConfig({ onNavigate }: TimerConfigProps) {
  const [rondas, setRondas] = useState(10);
  const [trabajo, setTrabajo] = useState("01:00");
  const [descanso, setDescanso] = useState("00:30");

  return (
    <div className="px-4 sm:px-6 md:px-12 py-6 sm:py-12 max-w-2xl mx-auto space-y-8 sm:space-y-16">
      {/* Editorial Header */}
      <section className="space-y-2 sm:space-y-4">
        <p className="font-headline text-[9px] sm:text-[10px] font-black tracking-[0.4em] text-primary-container uppercase opacity-70">SISTEMA DE PRECISIÓN</p>
        <h2 className="font-headline text-4xl sm:text-6xl md:text-7xl font-black uppercase leading-[0.85] tracking-tighter break-words">
          CONFIGURAR<br /><span className="text-primary-container">SESIÓN</span>
        </h2>
      </section>

      {/* Control Grid */}
      <div className="space-y-8 sm:space-y-16">
        {/* Rondas Control */}
        <ConfigField 
          label="RONDAS" 
          sublabel="Ciclos totales de entrenamiento"
          value={rondas.toString()}
          onIncrement={() => setRondas(rondas + 1)}
          onDecrement={() => setRondas(Math.max(1, rondas - 1))}
        />

        {/* Trabajo Control */}
        <ConfigField 
          label="DURACIÓN TRABAJO" 
          sublabel="Esfuerzo de alta intensidad"
          value={trabajo}
          unit="MM:SS"
          highlight
          readOnly
        />

        {/* Descanso Control */}
        <ConfigField 
          label="DURACIÓN DESCANSO" 
          sublabel="Recuperación activa"
          value={descanso}
          unit="MM:SS"
          readOnly
        />

        {/* Impact Estimator (Bento) */}
        <div className="relative bg-surface-container-low border-l-4 border-primary-container p-4 sm:p-8 overflow-hidden">
          <div className="absolute right-0 top-0 opacity-5 grayscale -translate-y-4 translate-x-4 pointer-events-none">
            <Timer size={140} className="fill-current" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8">
            <div>
               <h4 className="font-headline font-black text-xl sm:text-2xl italic uppercase tracking-tighter mb-3 sm:mb-4 text-white">Impacto Estimado</h4>
               <div className="flex gap-6 sm:gap-8">
                  <div className="space-y-1">
                    <span className="text-[9px] sm:text-[10px] text-on-surface-variant font-black tracking-widest uppercase">TIEMPO TOTAL</span>
                    <p className="font-headline text-lg sm:text-2xl font-black text-white italic">15:00 MIN</p>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="space-y-1">
                    <span className="text-[9px] sm:text-[10px] text-on-surface-variant font-black tracking-widest uppercase">KCAL EST.</span>
                    <p className="font-headline text-lg sm:text-2xl font-black text-primary-container italic">340</p>
                  </div>
               </div>
            </div>
            <div className="flex gap-2 self-start md:self-auto">
               <Flame className="text-primary-container" size={24} fill="currentColor" />
               <Clock className="text-on-surface-variant" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Tactical Start Button */}
      <div className="pt-6 sm:pt-8 space-y-4 sm:space-y-6">
        <button 
          onClick={() => onNavigate('timer-active')}
          className="group relative w-full bg-primary-container text-white py-5 sm:py-8 px-6 sm:px-10 flex items-center justify-between transition-all duration-300 active:scale-95 hover:brightness-110 shadow-[0_20px_50px_rgba(217,4,41,0.2)] select-none"
        >
          <span className="font-headline font-black text-lg sm:text-2xl md:text-3xl italic tracking-widest uppercase leading-none">GUARDAR Y EMPEZAR</span>
          <Play className="group-hover:translate-x-2 transition-transform shrink-0" size={24} fill="currentColor" />
        </button>
        <p className="text-center font-headline text-[9px] uppercase tracking-[0.3em] sm:tracking-[0.5em] text-on-surface-variant/40 font-black">Confirmar parámetros de rendimiento táctico</p>
      </div>
    </div>
  );
}

interface ConfigFieldProps {
  label: string;
  sublabel: string;
  value: string;
  unit?: string;
  highlight?: boolean;
  readOnly?: boolean;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

function ConfigField({ label, sublabel, value, unit, highlight, onIncrement, onDecrement }: ConfigFieldProps) {
  return (
    <div className="group">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2 sm:mb-4 border-b-2 border-outline-variant/30 group-focus-within:border-primary-container transition-colors duration-500 pb-2 sm:pb-4">
        <label className="font-headline text-xs sm:text-sm font-black tracking-widest text-on-surface-variant/40 uppercase self-start sm:self-auto">{label}</label>
        <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-auto">
          {onDecrement && (
            <button onClick={onDecrement} className="text-white hover:text-primary-container transition-colors active:scale-90 p-2 shrink-0">
              <Minus size={24} className="sm:w-8 sm:h-8" />
            </button>
          )}
          <div className="flex items-baseline gap-2 sm:gap-3">
             <span className={cn(
               "font-headline text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter tabular-nums text-right outline-none whitespace-nowrap",
               highlight ? "text-primary-container" : "text-white"
             )}>{value}</span>
             {unit && <span className="font-headline text-base sm:text-lg font-black text-on-surface-variant/40 italic">{unit}</span>}
          </div>
          {onIncrement && (
            <button onClick={onIncrement} className="text-white hover:text-primary-container transition-colors active:scale-90 p-2 shrink-0">
              <Plus size={24} className="sm:w-8 sm:h-8" />
            </button>
          )}
        </div>
      </div>
      <p className="font-headline text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-dusty-rose font-black opacity-40">{sublabel}</p>
    </div>
  );
}
