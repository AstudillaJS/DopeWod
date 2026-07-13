import { type Screen, type UserRole } from '../App';
import { Timer, ArrowRight, TrendingUp, Calendar as CalendarIcon, Flame } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
  role: UserRole;
  userName?: string;
  hasPlanning?: boolean;
}

export function Dashboard({ onNavigate, role, userName = 'USUARIO', hasPlanning = true }: DashboardProps) {
  const isCoach = role === 'coach' || role === 'admin';

  if (!isCoach && !hasPlanning) {
    return (
      <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-[1400px] mx-auto select-none">
        {/* Hub Hero - No Planning Assigned */}
        <div className="bg-[#051224] border border-primary-cyan/20 p-8 sm:p-12 md:p-16 flex flex-col justify-between min-h-[450px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-10 transition-opacity pointer-events-none">
             <TrendingUp size={320} className="text-white" />
          </div>
          
          <div className="relative z-10">
            <p className="font-headline font-black text-[10px] md:text-xs tracking-[0.4em] text-primary-cyan uppercase mb-6 sm:mb-12">
              ATLETA DE DOPE WOD
            </p>
            <h1 className="font-headline text-4xl sm:text-6xl md:text-7xl lg:text-[80px] font-black text-white italic leading-[0.9] tracking-tighter uppercase whitespace-pre-line break-words mb-4">
              ¡BIENVENIDO A<br />DOPE WOD, {userName.toUpperCase()}!
            </h1>
            <p className="text-white/60 font-medium text-sm sm:text-base md:text-lg max-w-xl leading-relaxed mt-6">
              Tu cuenta ha sido creada exitosamente con el rol de <strong className="text-primary-cyan">ATLETA</strong>. Actualmente no tienes ninguna planificación asignada a tu perfil.
            </p>
          </div>
          
          <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
            <div className="inline-flex items-center gap-4 bg-primary-cyan/10 border border-primary-cyan/30 px-6 py-4">
              <div className="w-2.5 h-2.5 bg-primary-cyan rounded-full animate-ping shrink-0" />
              <p className="font-headline font-black text-xs sm:text-sm tracking-wider text-primary-cyan uppercase">
                CONTACTA A TU COACH O ADMINISTRADOR PARA QUE ASIGNE TU PLANIFICACIÓN
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [selectedDay, setSelectedDay] = useState('L');

  const weeklyWorkouts: Record<string, { title: string; subtitle: string; tag: string }> = {
    'L': { title: 'STRENGTH & POWER', subtitle: 'CLEAN / FRONT SQUAT / T2B', tag: 'DÍA 01 // CARGA ALTA' },
    'M': { title: 'METCON CORE', subtitle: 'AMRAP 20: ROW / DU / KETTLEBELL', tag: 'DÍA 02 // RENDIMIENTO' },
    'X': { title: 'RECUPERACIÓN ACTIVA', subtitle: 'MOVILIDAD / NATACIÓN / ZONA 2', tag: 'DÍA 03 // BAREMO' },
    'J': { title: 'GYMNASTICS SKILL', subtitle: 'HSPU / MUSCLE UP / BARS', tag: 'DÍA 04 // TÉCNICA' },
    'V': { title: 'WEIGHTLIFTING 1RM', subtitle: 'SNATCH PREP / ACCESORIOS', tag: 'DÍA 05 // INTENSIDAD' },
    'S': { title: 'TEAM WOD', subtitle: 'PARTNER WORKOUT / ENDURANCE', tag: 'DÍA 06 // COMUNIDAD' },
    'D': { title: 'DESCANSO TOTAL', subtitle: 'REST DAY // FULL RECOVERY', tag: 'DÍA 07 // REPOSO' },
  };

  const currentWorkout = weeklyWorkouts[selectedDay];

  let overlineText = '';
  let headlineText = '';

  const programName = 'DOPE WOD';

  if (role === 'admin') {
    overlineText = 'SUPER ADMIN';
    headlineText = `WELCOME SUPER ADMIN\n${userName}`;
  } else if (role === 'coach') {
    overlineText = `COACH - ${programName}`;
    headlineText = `WELCOME COACH\n${userName}`;
  } else {
    overlineText = "FORGING BETTER PERSON'S";
    headlineText = `WELCOME TO\n${programName} PROGRAM`;
  }

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-[1400px] mx-auto">
      {/* Top Section: Hub Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-primary-cyan/10 border border-primary-cyan/20">
        {/* Left Hero */}
        <div className="bg-primary-cyan p-6 sm:p-10 md:p-16 flex flex-col justify-between min-h-[350px] sm:min-h-[450px] lg:min-h-[500px]">
          <div>
             <p className="font-headline font-black text-[10px] md:text-xs tracking-[0.4em] text-primary-navy uppercase mb-6 sm:mb-12">
               {overlineText}
             </p>
             <h1 className="font-headline text-4xl sm:text-6xl md:text-8xl lg:text-[100px] font-black text-white italic leading-[0.8] tracking-tighter uppercase whitespace-pre-line break-words">
               {headlineText}
             </h1>
          </div>
          
          <div className="mt-10 sm:mt-20">
             <p className="font-headline font-black text-[10px] sm:text-xs md:text-sm tracking-[0.2em] text-primary-navy uppercase mb-4 sm:mb-8">
               DÍA: {selectedDay === 'L' ? 'LUNES' : selectedDay === 'M' ? 'MARTES' : selectedDay === 'X' ? 'MIÉRCOLES' : selectedDay === 'J' ? 'JUEVES' : selectedDay === 'V' ? 'VIERNES' : selectedDay === 'S' ? 'SÁBADO' : 'DOMINGO'} // PROGRAMA: {isCoach ? 'TODOS' : 'CUSTOM 1'}
             </p>
             <div className="flex gap-3 sm:gap-4">
                 <button 
                   onClick={() => onNavigate('protocol-detail')}
                   className="bg-white text-primary-cyan px-6 sm:px-10 py-3.5 sm:py-5 font-headline font-black uppercase text-xs sm:text-sm tracking-widest flex items-center gap-3 sm:gap-4 hover:bg-white/90 transition-all active:scale-95 flex-grow justify-center select-none"
                 >
                   IR A LA PLANI
                   <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                 </button>
                 <button 
                   onClick={() => onNavigate('control')}
                   className="bg-transparent border-2 border-white/40 text-white p-3 sm:p-5 hover:bg-white/10 transition-colors select-none"
                 >
                   <Timer size={20} className="sm:w-6 sm:h-6" />
                 </button>
             </div>
          </div>
        </div>

        {/* Right Hero: Dynamic Planning Info */}
        <div className="bg-primary-navy p-6 sm:p-10 md:p-16 flex flex-col justify-between group relative overflow-hidden transition-all duration-500 min-h-[300px] sm:min-h-[350px] lg:min-h-full">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-all pointer-events-none">
              <CalendarIcon size={240} strokeWidth={1} className="text-white" />
           </div>
           
           <div className="relative z-10 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4 sm:mb-6">
                <p className="font-headline font-black text-xs tracking-[0.2em] text-primary-cyan uppercase underline underline-offset-8">
                  {currentWorkout.tag}
                </p>
                {/* Gamification Streak Widget */}
                <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.15)]">
                   <Flame size={14} className="text-orange-500" />
                   <span className="font-headline font-black text-[9px] tracking-widest uppercase text-orange-500">
                      RACHA: 3 DÍAS 🔥
                   </span>
                </div>
              </div>
              <h2 className="font-headline text-3xl sm:text-5xl md:text-7xl font-black text-white uppercase italic leading-none tracking-tighter mb-4">
                {currentWorkout.title}
              </h2>
              <p className="font-headline font-black text-xs sm:text-sm md:text-base text-white/40 uppercase tracking-[0.2em]">
                {currentWorkout.subtitle}
              </p>
           </div>
           
           <div className="h-px bg-white/5 w-full my-6 sm:my-8 lg:my-12 relative z-10" />
           
           <div className="flex items-end justify-between relative z-10">
              <div>
                 <p className="font-headline font-black text-[9px] sm:text-[10px] tracking-[0.3em] text-white/40 uppercase mb-2 sm:mb-4">CAPACIDAD OBJETIVO</p>
                 <span className="font-headline text-5xl sm:text-6xl md:text-8xl font-black text-primary-cyan italic leading-none tracking-tighter uppercase whitespace-nowrap">
                   {selectedDay === 'D' ? 'REST' : '100% OP'}
                 </span>
              </div>
              <div className="text-white/20 hidden md:block">
                 <TrendingUp size={80} strokeWidth={1} />
              </div>
           </div>
        </div>
      </div>

      {/* Bottom Section: Calendar and Planning Week */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
         {/* Weekly Calendar */}
         <div className="lg:col-span-2 bg-[#051224] p-6 sm:p-10 border border-white/5">
            <h3 className="font-headline font-black text-xs tracking-[0.3em] text-white/20 uppercase mb-8 sm:mb-12 flex items-center gap-3">
               <div className="w-2 h-2 bg-primary-cyan shadow-[0_0_8px_rgba(0,194,255,0.8)]" />
               CALENDARIO SEMANAL
            </h3>
            
            <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-6 sm:mb-8">
               <DayItem label="L" full="LUNES" active={selectedDay === 'L'} onClick={() => setSelectedDay('L')} />
               <DayItem label="M" full="MARTES" active={selectedDay === 'M'} onClick={() => setSelectedDay('M')} />
               <DayItem label="X" full="MIÉRCOLES" active={selectedDay === 'X'} onClick={() => setSelectedDay('X')} />
               <DayItem label="J" full="JUEVES" active={selectedDay === 'J'} onClick={() => setSelectedDay('J')} />
               <DayItem label="V" full="VIERNES" active={selectedDay === 'V'} onClick={() => setSelectedDay('V')} />
               <DayItem label="S" full="SÁBADO" active={selectedDay === 'S'} onClick={() => setSelectedDay('S')} />
               <DayItem label="D" full="DOMINGO" active={selectedDay === 'D'} onClick={() => setSelectedDay('D')} />
            </div>
            
            <div className="grid grid-cols-7 gap-2 sm:gap-4">
               {['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'].map(d => (
                 <p key={d} className="text-[7px] sm:text-[8px] font-black tracking-widest text-white/20 uppercase text-center truncate">{d}</p>
               ))}
            </div>
         </div>

         {/* Planning Week Card */}
         <div className="bg-primary-cyan p-6 sm:p-10 relative overflow-hidden flex flex-col justify-between min-h-[250px] sm:min-h-[300px]">
            <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 grayscale translate-x-8 -translate-y-8 pointer-events-none">
               <CalendarIcon size={200} strokeWidth={1} />
            </div>
            
            <div className="relative z-10">
               <p className="font-headline font-black text-[9px] tracking-[0.2em] text-primary-navy uppercase mb-6 sm:mb-12">Nº SEMANA PLANIFICACIÓN</p>
               <div className="flex items-baseline gap-2">
                  <span className="font-headline text-7xl sm:text-9xl font-black text-white italic tracking-tighter leading-none">12</span>
                  <span className="font-headline text-2xl sm:text-3xl font-black text-primary-navy italic">F3</span>
               </div>
            </div>
            
            <div className="relative z-10 pt-8 sm:pt-12 border-t border-white/20">
               <div className="h-1.5 bg-white/20 w-full mb-3 overflow-hidden">
                  <div className="h-full bg-white w-[85%]" />
               </div>
               <p className="text-right font-headline font-black text-[9px] tracking-[0.2em] text-primary-navy uppercase">PROGRESO DE BLOQUE</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function DayItem({ label, full, active, onClick }: { label: string; full: string; active?: boolean; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
      "aspect-square flex items-center justify-center transition-all cursor-pointer select-none",
      active ? "bg-primary-cyan text-white shadow-[0_0_20px_rgba(0,194,255,0.4)]" : "bg-primary-cyan/5 text-white hover:bg-primary-cyan/10"
    )}>
       <span className="font-headline text-xl sm:text-2xl md:text-4xl font-black italic">{label}</span>
    </div>
  );
}
