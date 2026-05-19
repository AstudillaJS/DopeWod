import { type Screen, type PRRecord } from '../App';
import { ArrowLeft, Bolt, Calculator, Clock, Terminal, RotateCcw, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import type { ReactNode } from 'react';

interface ProtocolDetailProps {
  onNavigate: (screen: Screen) => void;
  prs: PRRecord[];
}

export function ProtocolDetail({ onNavigate, prs }: ProtocolDetailProps) {
  const snatchPR = prs.find(p => p.exercise.includes('SNATCH'))?.weight || 100;
  
  return (
    <div className="px-4 sm:px-6 md:px-12 py-6 sm:py-12 max-w-[1400px] mx-auto space-y-8 sm:space-y-16">
      {/* Header Context */}
      <section className="relative">
        <button 
           onClick={() => onNavigate('home')}
           className="p-2 -ml-2 text-white/40 hover:text-primary-cyan transition-colors flex items-center gap-2 font-headline font-black text-[10px] tracking-[0.3em] uppercase mb-6 sm:mb-12 select-none"
        >
          <ArrowLeft size={16} />
          VOLVER
        </button>
        
        <div className="absolute -left-4 sm:-left-6 top-16 w-2 sm:w-3 h-24 sm:h-32 bg-primary-cyan hidden xs:block" />
        <p className="font-headline text-primary-cyan font-black tracking-[0.4em] mb-2 sm:mb-4 uppercase text-[10px] sm:text-[11px] italic underline">VANGUARD PROTOCOL // 042</p>
        <h2 className="font-headline text-4xl sm:text-6xl md:text-8xl lg:text-[140px] font-black tracking-tighter text-white leading-none uppercase italic break-words">The Grinder</h2>
        
        <div className="flex flex-wrap gap-6 sm:gap-12 mt-8 sm:mt-16 items-center border-t border-white/5 pt-6 sm:pt-8">
          <div className="flex flex-col">
            <span className="text-white/20 text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-black mb-1">Duration</span>
            <span className="font-headline text-2xl sm:text-3xl text-white font-black italic tracking-tight">25:00 <span className="text-xs font-bold text-white/20 not-italic">MIN</span></span>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/10" />
          <div className="flex flex-col">
            <span className="text-white/20 text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-black mb-1">Focus</span>
            <span className="font-headline text-2xl sm:text-3xl text-white font-black italic tracking-tight">POWER & PACE</span>
          </div>
        </div>
      </section>

      {/* Main Content Sections A-D */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
        <div className="lg:col-span-8 space-y-px bg-white/5 border border-white/5">
          {/* Section A */}
          <ProtocolSection 
             letter="A" 
             title="Strength: Snatch Complex" 
             type="Weightlifting" 
          >
            <div className="space-y-6">
              <p className="text-white font-black uppercase tracking-[0.1em] text-base sm:text-lg">EMOM 10:00 (5 SETS)</p>
              <p className="text-white/60 font-medium text-xs sm:text-sm leading-relaxed max-w-md italic">
                1 Power Snatch + 1 Squat Snatch + 1 Overhead Squat. Focus on vertical bar path and explosive hip extension.
              </p>
              <div className="inline-block px-4 py-1.5 bg-primary-cyan/10 border border-primary-cyan/20 text-primary-cyan text-[9px] sm:text-[10px] font-black tracking-[0.3em] uppercase">
                Target: 70-80% 1RM
              </div>
              
              {/* Load Calculator Item */}
              <div className="bg-black/40 p-4 sm:p-6 border-l-[8px] sm:border-l-[12px] border-primary-cyan flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 group">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="bg-primary-cyan p-3 sm:p-4 shrink-0">
                    <Calculator size={20} className="text-primary-navy" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase text-white/40 tracking-[0.3em] font-black mb-1">Calculated Load (75%)</p>
                    <p className="text-3xl sm:text-4xl font-headline font-black text-white italic tracking-tighter tabular-nums">{(snatchPR * 0.75).toFixed(1)} <span className="text-xs sm:text-sm font-bold text-white/20 not-italic ml-2">KG</span></p>
                  </div>
                </div>
                <button className="p-2 sm:p-3 text-white/40 hover:text-white transition-all group-hover:rotate-180 duration-500 self-end sm:self-center">
                  <RotateCcw size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </ProtocolSection>

          {/* Section B */}
          <ProtocolSection 
             letter="B" 
             title="Accessory: Vertical Press" 
             type="Gymnastics" 
          >
            <div className="space-y-6">
              <p className="text-white font-black uppercase tracking-[0.1em] text-base sm:text-lg">3 SETS FOR QUALITY</p>
              <ul className="space-y-1">
                <ListItem number="01" text="8 Strict Handstand Push-ups" />
                <ListItem number="02" text="12 Dumbbell Z-Press (Moderate)" />
              </ul>
            </div>
          </ProtocolSection>

          {/* Section C */}
          <ProtocolSection 
             letter="C" 
             title='Metcon: "Blood & Sand"' 
             type="Metabolic Conditioning" 
          >
             <div className="relative overflow-hidden">
                <div className="absolute -right-16 bottom-0 opacity-[0.03] grayscale -rotate-12 pointer-events-none">
                   <Clock size={200} />
                </div>
                <div className="mb-4 sm:mb-8 relative z-10">
                   <p className="text-primary-cyan font-black uppercase tracking-[0.4em] text-xs mb-6 sm:mb-8 border-b border-primary-cyan/40 pb-2 inline-block">21 - 15 - 9 FOR TIME</p>
                   <div className="space-y-4">
                     <MetconRow label="Wall Ball Shots" data="9KG / 6KG" />
                     <MetconRow label="Box Jumps" data='24" / 20"' />
                     <MetconRow label="Kettlebell Swings" data="24KG / 16KG" />
                   </div>
                </div>
             </div>
          </ProtocolSection>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6 sm:space-y-8">
           {/* Athlete PR Context */}
           <div className="bg-[#051224] p-6 sm:p-10 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Bolt size={100} />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6 sm:mb-8">
                   <div>
                      <h4 className="text-[9px] sm:text-[10px] font-black text-primary-cyan uppercase tracking-[0.3em]">Athlete Database</h4>
                      <p className="font-headline text-xl sm:text-2xl font-black text-white italic uppercase tracking-tight mt-1">Snatch 1RM</p>
                   </div>
                   <div className="bg-primary-cyan/10 p-2 text-primary-cyan">
                      <Terminal size={18} />
                   </div>
                </div>
                <div className="flex items-baseline gap-2 sm:gap-3 mb-6 sm:mb-10">
                  <span className="text-6xl sm:text-8xl font-headline font-black text-white tracking-tighter italic leading-none">{snatchPR.toFixed(1)}</span>
                  <span className="text-lg sm:text-xl font-black text-primary-cyan italic">KG</span>
                </div>
                <div className="space-y-3">
                   <LoadRow label="60%" value={`${(snatchPR * 0.6).toFixed(1)} KG`} />
                   <LoadRow label="70%" value={`${(snatchPR * 0.7).toFixed(1)} KG`} active />
                   <LoadRow label="80%" value={`${(snatchPR * 0.8).toFixed(1)} KG`} />
                </div>
                <button 
                  onClick={() => onNavigate('timer-active')}
                  className="w-full mt-8 sm:mt-12 py-5 sm:py-8 bg-primary-cyan text-primary-navy font-headline font-black uppercase tracking-widest text-xs sm:text-sm flex items-center justify-center gap-3 sm:gap-4 active:scale-95 transition-all shadow-[0_15px_30px_rgba(0,194,255,0.3)] select-none"
                >
                  EXECUTE SESSION
                  <Bolt size={18} className="sm:w-5 sm:h-5" fill="currentColor" />
                </button>
              </div>
           </div>

           {/* Coach Prompt */}
           <div className="bg-primary-cyan/5 p-6 sm:p-8 border-l-[6px] sm:border-l-[8px] border-primary-cyan flex gap-4 sm:gap-6 italic">
              <Info size={24} className="text-primary-cyan shrink-0 sm:w-7 sm:h-7" strokeWidth={3} />
              <div className="space-y-3">
                <span className="text-[9px] sm:text-[10px] font-black text-primary-cyan uppercase tracking-[0.3em]">Coach Command</span>
                <p className="text-[10px] sm:text-[11px] text-white/60 font-medium leading-relaxed">
                  Session emphasis is <strong className="text-white not-italic underline decoration-primary-cyan font-black">mechanical consistency</strong>. High speed, high volume. Do not sacrifice form for tempo in Section C.
                </p>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}

function ProtocolSection({ letter, title, type, children }: { letter: string; title: string; type: string; children: ReactNode }) {
  return (
    <div className="relative p-6 sm:p-10 lg:p-12 bg-[#051224] transition-colors group">
       <div className="absolute top-6 sm:top-10 right-8 sm:right-12 font-headline text-[80px] sm:text-[120px] lg:text-[140px] font-black opacity-[0.03] italic pointer-events-none group-hover:opacity-10 transition-opacity leading-none select-none text-primary-cyan">
         {letter}
       </div>
       <div className="mb-6 sm:mb-10 flex flex-col gap-1 sm:gap-2">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-primary-cyan opacity-40 italic">{type}</span>
          <h3 className="font-headline text-2xl sm:text-4xl lg:text-5xl font-black text-white italic uppercase tracking-tighter leading-none break-words">{title}</h3>
       </div>
       {children}
    </div>
  );
}

function ListItem({ number, text }: { number: string; text: string }) {
  return (
    <li className="flex items-center gap-4 sm:gap-6 py-4 sm:py-6 border-b border-white/5 group/li transition-colors hover:bg-white/5 px-2">
      <span className="text-primary-cyan font-headline font-black italic text-xl sm:text-2xl group-hover/li:scale-125 transition-transform">{number}</span>
      <span className="font-headline text-sm sm:text-lg md:text-xl font-bold text-white uppercase tracking-tight opacity-90 break-words">{text}</span>
    </li>
  );
}

function MetconRow({ label, data }: { label: string; data: string }) {
  return (
    <div className="flex justify-between items-center gap-4 group/row py-3 border-b border-white/5 lg:border-none">
      <span className="text-white font-black uppercase tracking-tight text-base sm:text-xl md:text-2xl group-hover/row:text-primary-cyan transition-colors italic truncate">{label}</span>
      <span className="text-white/20 text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-white/10 px-2 sm:px-4 py-1 sm:py-2 transition-all group-hover/row:border-primary-cyan group-hover/row:text-white shrink-0">{data}</span>
    </div>
  );
}

function LoadRow({ label, value, active }: { label: string; value: string; active?: boolean }) {
  return (
    <div className={cn(
      "flex justify-between items-center p-4 sm:p-6 transition-all",
      active ? "bg-primary-cyan text-primary-navy border-l-[6px] sm:border-l-[8px] border-white shadow-xl scale-[1.03] sm:scale-[1.05] z-10" : "bg-black/30 text-white/40 border-l border-white/10"
    )}>
       <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] italic">{label}</span>
       <span className="font-headline font-black italic text-base sm:text-xl tracking-tighter">{value}</span>
    </div>
  );
}
