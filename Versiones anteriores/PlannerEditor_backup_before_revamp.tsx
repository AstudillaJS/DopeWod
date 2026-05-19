import { type Screen } from '../App';
import { Plus, LayoutGrid, Trash2, Hash } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';

interface TrainingBlock {
  id: string;
  letter: string;
  type: 'estructura' | 'gimnasticos' | 'endurance';
  title: string;
  reps: string;
  load: string;
  notes: string;
}

interface PlannerEditorProps {
  onNavigate: (screen: Screen) => void;
}

export function PlannerEditor({ onNavigate }: PlannerEditorProps) {
  const [selectedDay, setSelectedDay] = useState('L');
  const [weekNumber, setWeekNumber] = useState(1);
  const [blocks, setBlocks] = useState<TrainingBlock[]>([]);

  const addBlock = () => {
    const nextLetter = String.fromCharCode(65 + blocks.length); // A, B, C...
    const newBlock: TrainingBlock = {
      id: Math.random().toString(36).substr(2, 9),
      letter: nextLetter,
      type: 'estructura',
      title: '',
      reps: '',
      load: '',
      notes: ''
    };
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id).map((b, i) => ({
      ...b,
      letter: String.fromCharCode(65 + i)
    })));
  };

  const updateBlock = (id: string, updates: Partial<TrainingBlock>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-176px)] mb-20">
      {/* Header Section */}
      <section className="bg-primary-cyan p-8 md:p-16">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="font-headline text-6xl md:text-[140px] font-black text-white italic leading-[0.8] tracking-tighter uppercase">
            EDITOR DE PLANIFICACIÓN
          </h1>
          <p className="mt-4 font-headline font-black text-xs md:text-sm tracking-[0.4em] text-primary-navy uppercase">
            CONFIGURACIÓN DE MISIÓN SEMANAL
          </p>
        </div>
      </section>

      {/* Editor Body */}
      <div className="flex-grow max-w-[1400px] mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Controls */}
        <aside className="lg:col-span-3 space-y-6">
           {/* Section 0: Week Selection */}
           <div className="bg-[#051224] border-l-4 border-white p-6 space-y-4">
              <h3 className="text-white font-headline font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                <Hash size={12} className="text-primary-cyan" />
                SEMANA PLANIFICACIÓN
              </h3>
              <input 
                type="number" 
                value={weekNumber}
                onChange={(e) => setWeekNumber(parseInt(e.target.value) || 1)}
                className="w-full bg-black/40 border border-white/10 text-primary-cyan font-headline text-2xl font-black p-4 outline-none focus:border-primary-cyan transition-all"
              />
           </div>

           {/* Section 1: Program Select */}
           <div className="bg-primary-cyan/5 border-l-4 border-primary-cyan p-6 space-y-4">
              <h3 className="text-primary-cyan font-headline font-black text-[10px] uppercase tracking-[0.2em]">SELECCIONAR PROGRAMA</h3>
              <p className="text-white/20 italic text-xs font-headline font-black uppercase">NINGÚN PROGRAMA ASIGNADO</p>
           </div>

           {/* Section 2: Day Selector */}
           <div className="bg-black/40 border-l-4 border-primary-cyan p-6 space-y-6">
              <h3 className="text-primary-cyan font-headline font-black text-[10px] uppercase tracking-[0.2em]">SELECCIONAR DÍA</h3>
              <div className="grid grid-cols-4 gap-2">
                 {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                   <button 
                     key={day}
                     onClick={() => setSelectedDay(day)}
                     className={cn(
                       "aspect-square border flex items-center justify-center font-headline font-black transition-all",
                       day === selectedDay 
                        ? "bg-primary-cyan border-primary-cyan text-primary-navy" 
                        : "border-white/40 text-white/40 hover:border-white hover:text-white"
                     )}
                   >
                     {day}
                   </button>
                 ))}
              </div>
           </div>

           {/* Section 3: Subscribers list */}
           <div className="bg-[#051224] border-l-4 border-primary-cyan p-6 space-y-4">
              <h3 className="text-primary-cyan font-headline font-black text-[10px] uppercase tracking-[0.2em]">SUSCRITOS AL PROGRAMA</h3>
              <p className="text-white/20 italic text-[9px] font-headline font-black uppercase">NO HAY ATLETAS SUSCRITOS</p>
           </div>
        </aside>

        {/* Main Workspace */}
        <main className="lg:col-span-9 space-y-8">
           <div className="bg-[#051224] p-8 md:p-12 relative border border-white/5 space-y-12">
              <div>
                 <label className="block text-primary-cyan font-headline font-black text-[10px] uppercase tracking-[0.2em] mb-4">TÍTULO DE LA SESIÓN</label>
                 <input 
                   type="text" 
                   placeholder="EJ: STRENGTH & POWER"
                   className="w-full bg-black/40 border-none text-white font-headline text-3xl md:text-5xl font-black uppercase p-6 outline-none focus:ring-2 ring-primary-cyan/30 transition-all placeholder:opacity-10"
                 />
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                 <h4 className="text-primary-cyan font-headline font-black text-[10px] uppercase tracking-[0.2em]">BLOQUES DE ENTRENAMIENTO</h4>
                 <button 
                  onClick={addBlock}
                  className="bg-primary-cyan text-primary-navy px-4 py-2 font-headline font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                 >
                    <Plus size={14} strokeWidth={4} />
                    AÑADIR BLOQUE
                 </button>
              </div>

              {blocks.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center opacity-10">
                   <LayoutGrid size={80} strokeWidth={1} />
                </div>
              ) : (
                <div className="space-y-6">
                  {blocks.map((block) => (
                    <div key={block.id} className="bg-black p-8 md:p-10 relative group border border-white/5 animate-in fade-in slide-in-from-top-4 duration-300">
                      <span className="absolute left-6 top-6 font-headline font-black text-6xl text-[#ea062c]/20 leading-none">{block.letter}</span>
                      
                      {/* Block Controls Header */}
                      <div className="flex flex-col md:flex-row justify-between gap-6 mb-10 pl-16">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => updateBlock(block.id, { type: 'estructura' })}
                            className={cn(
                              "px-6 py-2 font-headline font-black uppercase text-[10px] tracking-widest border transition-all",
                              block.type === 'estructura' ? "bg-[#ea062c] border-[#ea062c] text-white" : "border-white/20 text-white/40 hover:text-white"
                            )}
                          >
                            ESTRUCTURA
                          </button>
                          <button 
                            onClick={() => updateBlock(block.id, { type: 'gimnasticos' })}
                            className={cn(
                              "px-6 py-2 font-headline font-black uppercase text-[10px] tracking-widest border transition-all",
                              block.type === 'gimnasticos' ? "bg-[#ea062c] border-[#ea062c] text-white" : "border-white/20 text-white/40 hover:text-white"
                            )}
                          >
                            GIMNÁSTICOS
                          </button>
                          <button 
                            onClick={() => updateBlock(block.id, { type: 'endurance' })}
                            className={cn(
                              "px-6 py-2 font-headline font-black uppercase text-[10px] tracking-widest border transition-all",
                              block.type === 'endurance' ? "bg-[#ea062c] border-[#ea062c] text-white" : "border-white/20 text-white/40 hover:text-white"
                            )}
                          >
                            ENDURANCE
                          </button>
                        </div>
                        <button 
                          onClick={() => removeBlock(block.id)}
                          className="text-[#ea062c] opacity-40 hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={24} />
                        </button>
                      </div>

                      {/* Inputs Row */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8 pl-16">
                        <div className="md:col-span-6">
                           <input 
                            type="text"
                            placeholder="EJ: BACK SQUAT"
                            value={block.title}
                            onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                            className="w-full bg-transparent border-b border-white/20 p-2 text-white font-headline text-3xl font-black uppercase outline-none focus:border-primary-cyan transition-all"
                           />
                        </div>
                        <div className="md:col-span-2">
                           <div className="bg-[#0b0b0b] border border-white/10 p-2 flex flex-col items-center">
                              <span className="text-[8px] text-white/20 font-black tracking-widest uppercase mb-1">REPS</span>
                              <input 
                                type="text"
                                value={block.reps}
                                onChange={(e) => updateBlock(block.id, { reps: e.target.value })}
                                className="w-full bg-transparent text-center text-white font-headline font-black text-xl outline-none"
                              />
                           </div>
                        </div>
                        <div className="md:col-span-4">
                           <div className="bg-[#0b0b0b] border border-white/10 p-2 flex flex-col items-center">
                              <span className="text-[8px] text-white/20 font-black tracking-widest uppercase mb-1">CARGA</span>
                              <input 
                                type="text"
                                value={block.load}
                                onChange={(e) => updateBlock(block.id, { load: e.target.value })}
                                className="w-full bg-transparent text-center text-white font-headline font-black text-xl outline-none"
                              />
                           </div>
                        </div>
                      </div>

                      {/* Notes Section */}
                      <div className="pl-16">
                        <textarea 
                          placeholder="DETALLES TÉCNICOS / NOTAS"
                          value={block.notes}
                          onChange={(e) => updateBlock(block.id, { notes: e.target.value })}
                          className="w-full bg-[#0b0b0b] border border-white/10 p-6 text-white/60 font-body text-xs uppercase tracking-widest min-h-[120px] outline-none focus:border-white/30 transition-all resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Save Action */}
              <button 
                className="w-full bg-[#ea062c] text-white font-headline font-black py-8 uppercase text-2xl tracking-[0.4em] italic hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_20px_50px_rgba(234,6,44,0.2)]"
              >
                GUARDAR PLANIFICACIÓN
              </button>
           </div>
        </main>

      </div>
    </div>
  );
}
