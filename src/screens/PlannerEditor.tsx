import { type Screen } from '../App';
import { Plus, LayoutGrid, Trash2, Hash, Settings, ChevronDown, Activity, ChevronRight, X, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';
import { ExerciseAutocomplete } from '../components/ExerciseAutocomplete';
import { CustomSelect } from '../components/CustomSelect';
import { supabase } from '../lib/supabase';

export type WodType = 'ESTRUCTURA / FUERZA' | 'FOR TIME' | 'AMRAP' | 'EMOM' | 'TABATA' | 'COMPLEX' | 'OTRO';
export type ImplementType = 'BARRA' | 'DB / KB' | 'BODYWEIGHT / GYM';
export type ProgressionType = 'PROGRESIVA' | 'ESTÁTICA';

export interface ProgressiveStage {
  id: string;
  reps: string;
  sets: string;
  percentage: string;
  weightMale?: string;
  weightFemale?: string;
}

export interface BlockExercise {
  id: string;
  name: string;
  implement: ImplementType;
  progressionType: ProgressionType;
  loadMeasureType?: 'PERCENTAGE' | 'WEIGHT';
  progressiveStages: ProgressiveStage[];
  staticPercentage: string;
  staticReps: string;
  weightMale: string;
  weightFemale: string;
  reps: string;
}

export interface TrainingBlock {
  id: string;
  letter: string;
  type: WodType;
  timecap: string;
  rounds: string;
  exercises: BlockExercise[];
  notes: string;
}

interface Program {
  id: string;
  name: string;
  description?: string;
}

interface PlannerEditorProps {
  onNavigate: (screen: Screen) => void;
  dbRole?: string;
  programId?: string | null;
}

const WOD_TYPES: WodType[] = ['ESTRUCTURA / FUERZA', 'FOR TIME', 'AMRAP', 'EMOM', 'TABATA', 'COMPLEX', 'OTRO'];

const TIMECAP_OPTIONS = [
  { value: "N/A", label: "N/A (SIN TIEMPO)" },
  ...Array.from({ length: 60 }, (_, i) => ({ value: `${i + 1} MIN`, label: `${i + 1} MIN` }))
];

const ROUNDS_OPTIONS = [
  { value: "AMRAP", label: "AMRAP (MÁXIMAS)" },
  { value: "N/A", label: "N/A" },
  ...Array.from({ length: 30 }, (_, i) => ({ value: `${i + 1}`, label: `${i + 1}` }))
];

const IMPLEMENT_OPTIONS = [
  { value: "BARRA", label: "CON BARRA" },
  { value: "DB / KB", label: "DB / KB" },
  { value: "BODYWEIGHT / GYM", label: "LIBRE / GYM" }
];

const DB_KB_WEIGHT_OPTIONS = [
  { value: "BW", label: "BODYWEIGHT" },
  { value: "5 KG", label: "5 KG" },
  { value: "7.5 KG", label: "7.5 KG" },
  { value: "10 KG", label: "10 KG (22 LBS)" },
  { value: "12.5 KG", label: "12.5 KG" },
  { value: "15 KG", label: "15 KG (35 LBS)" },
  { value: "17.5 KG", label: "17.5 KG" },
  { value: "20 KG", label: "20 KG" },
  { value: "22.5 KG", label: "22.5 KG (50 LBS)" },
  { value: "25 KG", label: "25 KG" },
  { value: "27.5 KG", label: "27.5 KG" },
  { value: "30 KG", label: "30 KG" },
  { value: "32.5 KG", label: "32.5 KG (70 LBS)" },
  { value: "35 KG", label: "35 KG" },
  { value: "40 KG", label: "40 KG" }
];

export function PlannerEditor({ onNavigate, dbRole, programId }: PlannerEditorProps) {
  const [selectedDay, setSelectedDay] = useState('L');
  const [weekNumber, setWeekNumber] = useState(1);
  const [sessionTitle, setSessionTitle] = useState('');
  const [blocks, setBlocks] = useState<TrainingBlock[]>([]);

  // Database Integration States
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('A');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const { data, error } = await supabase
          .from('programs')
          .select('*')
          .order('name', { ascending: true });
        
        if (data && !error) {
          if (dbRole === 'coach' && programId) {
             const coachProgram = data.filter(p => p.id === programId);
             setPrograms(coachProgram.length > 0 ? coachProgram : data);
             if (coachProgram.length > 0) {
               setSelectedProgramId(programId);
             } else if (data.length > 0) {
               setSelectedProgramId(data[0].id);
             }
          } else {
             setPrograms(data);
             if (data.length > 0) {
               setSelectedProgramId(data[0].id);
             }
          }
        }
      } catch (err) {
        console.error('Error fetching programs:', err);
      }
    };
    fetchPrograms();
  }, [dbRole, programId]);

  // Fetch existing plan for the active combination of day, week, program, group
  useEffect(() => {
    if (!selectedProgramId) return;

    const fetchPlan = async () => {
      setLoading(true);
      setMessage(null);
      try {
        const { data, error } = await supabase
          .from('weekly_plans')
          .select('*')
          .eq('program_id', selectedProgramId)
          .eq('group_id', selectedGroupId)
          .eq('week_number', weekNumber)
          .eq('day_code', selectedDay)
          .maybeSingle();

        if (error) {
          console.error('Error fetching plan:', error);
        } else if (data) {
          setSessionTitle(data.title || '');
          setBlocks(data.exercises || []);
        } else {
          // Reset to clean states if no record is found
          setSessionTitle('');
          setBlocks([]);
        }
      } catch (err) {
        console.error('Error in fetchPlan:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [selectedProgramId, selectedGroupId, weekNumber, selectedDay]);

  const handleSave = async () => {
    if (!selectedProgramId) {
      setMessage({ type: 'error', text: 'POR FAVOR, SELECCIONA UN PROGRAMA' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // Upsert into weekly_plans with conflict handling on UNIQUE (group_id, day_code, week_number)
      const { error } = await supabase
        .from('weekly_plans')
        .upsert({
          program_id: selectedProgramId,
          group_id: selectedGroupId,
          week_number: weekNumber,
          day_code: selectedDay,
          title: sessionTitle || 'SESIÓN SIN TÍTULO',
          exercises: blocks,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'group_id,day_code,week_number'
        });

      if (error) {
        throw error;
      }

      setMessage({ type: 'success', text: '¡PLANIFICACIÓN GUARDADA CON ÉXITO!' });
      // Clear message after 4 seconds
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      console.error('Error saving weekly plan:', err);
      setMessage({ type: 'error', text: `ERROR AL GUARDAR: ${err.message || 'INTENTE NUEVAMENTE'}` });
    } finally {
      setSaving(false);
    }
  };

  const addBlock = () => {
    const nextLetter = String.fromCharCode(65 + blocks.length); // A, B, C...
    const newBlock: TrainingBlock = {
      id: Math.random().toString(36).substr(2, 9),
      letter: nextLetter,
      type: 'ESTRUCTURA / FUERZA',
      timecap: '',
      rounds: '',
      exercises: [],
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

  const addExercise = (blockId: string) => {
    const newExercise: BlockExercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      implement: 'BARRA',
      progressionType: 'ESTÁTICA',
      loadMeasureType: 'PERCENTAGE',
      progressiveStages: [],
      staticPercentage: '',
      staticReps: '',
      weightMale: '',
      weightFemale: '',
      reps: ''
    };
    
    setBlocks(blocks.map(b => {
      if (b.id === blockId) {
        return { ...b, exercises: [...b.exercises, newExercise] };
      }
      return b;
    }));
  };

  const updateExercise = (blockId: string, exerciseId: string, updates: Partial<BlockExercise>) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId) {
        return {
          ...b,
          exercises: b.exercises.map(e => e.id === exerciseId ? { ...e, ...updates } : e)
        };
      }
      return b;
    }));
  };

  const removeExercise = (blockId: string, exerciseId: string) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId) {
        return {
          ...b,
          exercises: b.exercises.filter(e => e.id !== exerciseId)
        };
      }
      return b;
    }));
  };

  const addProgressiveStage = (blockId: string, exerciseId: string) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId) {
        return {
          ...b,
          exercises: b.exercises.map(e => {
            if (e.id === exerciseId) {
              return {
                ...e,
                progressiveStages: [...e.progressiveStages, { id: Math.random().toString(36).substr(2, 9), reps: '', sets: '', percentage: '', weightMale: '', weightFemale: '' }]
              };
            }
            return e;
          })
        };
      }
      return b;
    }));
  };

  const updateProgressiveStage = (blockId: string, exerciseId: string, stageId: string, updates: Partial<ProgressiveStage>) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId) {
        return {
          ...b,
          exercises: b.exercises.map(e => {
            if (e.id === exerciseId) {
              return {
                ...e,
                progressiveStages: e.progressiveStages.map(s => s.id === stageId ? { ...s, ...updates } : s)
              };
            }
            return e;
          })
        };
      }
      return b;
    }));
  };

  const removeProgressiveStage = (blockId: string, exerciseId: string, stageId: string) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId) {
        return {
          ...b,
          exercises: b.exercises.map(e => {
            if (e.id === exerciseId) {
              return {
                ...e,
                progressiveStages: e.progressiveStages.filter(s => s.id !== stageId)
              };
            }
            return e;
          })
        };
      }
      return b;
    }));
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-176px)] mb-20">
      {/* Header Section */}
      <section className="bg-primary-cyan p-6 sm:p-8 md:p-16">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="font-headline text-4xl sm:text-6xl md:text-[140px] font-black text-white italic leading-[0.9] md:leading-[0.8] tracking-tighter uppercase">
            EDITOR WOD
          </h1>
          <p className="mt-4 font-headline font-black text-[10px] sm:text-xs md:text-sm tracking-[0.2em] sm:tracking-[0.4em] text-primary-navy uppercase">
            ESTRUCTURACIÓN AVANZADA
          </p>
        </div>
      </section>

      {/* Editor Body */}
      <div className="flex-grow max-w-[1400px] mx-auto w-full p-3 sm:p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
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

           {/* Section 1: Program & Group Selectors */}
           <div className="bg-black/40 border-l-4 border-white p-6 space-y-4">
              <h3 className="text-white font-headline font-black text-[10px] uppercase tracking-[0.2em]">
                PROGRAMA & GRUPO
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                   <label className="text-[8px] text-white/40 font-black tracking-widest uppercase">PROGRAMA</label>
                   <CustomSelect 
                     value={selectedProgramId}
                     onChange={(val) => setSelectedProgramId(val)}
                     options={programs.map(p => ({ value: p.id, label: p.name }))}
                     placeholder="SELECCIONAR..."
                     className="bg-black/75 border border-white/10 p-3 text-white font-headline text-sm font-black uppercase"
                     disabled={dbRole === 'coach' && !!programId}
                   />
                </div>
                
                <div className="flex flex-col gap-1.5">
                   <label className="text-[8px] text-white/40 font-black tracking-widest uppercase">GRUPO DE ATLETAS</label>
                   <CustomSelect 
                     value={selectedGroupId}
                     onChange={(val) => setSelectedGroupId(val)}
                     options={[
                       { value: 'A', label: 'GRUPO A' },
                       { value: 'B', label: 'GRUPO B' },
                       { value: 'C', label: 'GRUPO C' },
                       { value: 'D', label: 'GRUPO D' }
                     ]}
                     placeholder="GRUPO A"
                     className="bg-black/75 border border-white/10 p-3 text-white font-headline text-sm font-black uppercase"
                   />
                </div>
              </div>
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
        </aside>

        {/* Main Workspace */}
        <main className="lg:col-span-9 space-y-8">
           {loading ? (
             <div className="bg-[#051224] p-12 border border-white/5 flex flex-col items-center justify-center min-h-[400px]">
                <div className="text-primary-cyan mb-4 animate-spin">
                   <Loader2 size={48} />
                </div>
                <p className="font-headline font-black text-white/45 text-xs tracking-[0.2em] uppercase">CARGANDO PLANIFICACIÓN DE LA BASE DE DATOS...</p>
             </div>
           ) : (
             <div className="bg-[#051224] p-8 md:p-12 relative border border-white/5 space-y-12 animate-in fade-in duration-300">
                <div>
                   <label className="block text-primary-cyan font-headline font-black text-[10px] uppercase tracking-[0.2em] mb-4">TÍTULO DE LA SESIÓN</label>
                   <input 
                     type="text" 
                     value={sessionTitle}
                     onChange={e => setSessionTitle(e.target.value)}
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
                  <div className="space-y-12">
                    {blocks.map((block) => (
                      <div key={block.id} className="bg-[#0a0a0a] p-6 md:p-8 relative group border border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="absolute top-0 left-0 w-2 h-full bg-[#ea062c]"></div>
                        <span className="absolute -left-12 top-6 font-headline font-black text-6xl text-white/20 leading-none">{block.letter}</span>
                        
                        {/* Block Controls Header */}
                        <div className="flex flex-col xl:flex-row justify-between gap-6 mb-8 pl-4">
                          <div className="flex flex-wrap gap-2">
                             {WOD_TYPES.map(type => (
                                <button 
                                  key={type}
                                  onClick={() => updateBlock(block.id, { type })}
                                  className={cn(
                                    "px-4 py-2 font-headline font-black uppercase text-[9px] tracking-widest border transition-all",
                                    block.type === type ? "bg-[#ea062c] border-[#ea062c] text-white" : "border-white/20 text-white/40 hover:text-white"
                                  )}
                                >
                                  {type}
                                </button>
                             ))}
                          </div>
                          <button 
                            onClick={() => removeBlock(block.id)}
                            className="text-[#ea062c] opacity-40 hover:opacity-100 transition-opacity ml-auto"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        {/* Block Context Inputs (Timecap, Rounds) if it's a WOD */}
                        {block.type !== 'ESTRUCTURA / FUERZA' && (
                           <div className="grid grid-cols-2 gap-4 mb-8 pl-4">
                              <div className="bg-black/40 border border-white/10 p-3 flex flex-col">
                                 <span className="text-[9px] text-white/40 font-black tracking-widest uppercase mb-2">TIMECAP / DURACIÓN</span>
                                 <CustomSelect 
                                   value={block.timecap}
                                   onChange={(val) => updateBlock(block.id, { timecap: val })}
                                   options={TIMECAP_OPTIONS}
                                   placeholder="SELECCIONAR..."
                                   className="text-white font-headline text-xl"
                                 />
                              </div>
                              <div className="bg-black/40 border border-white/10 p-3 flex flex-col">
                                 <span className="text-[9px] text-white/40 font-black tracking-widest uppercase mb-2">VUELTAS (ROUNDS)</span>
                                 <CustomSelect 
                                   value={block.rounds}
                                   onChange={(val) => updateBlock(block.id, { rounds: val })}
                                   options={ROUNDS_OPTIONS}
                                   placeholder="SELECCIONAR..."
                                   className="text-white font-headline text-xl"
                                 />
                              </div>
                           </div>
                        )}

                        {/* Exercises List */}
                        <div className="pl-4 space-y-6">
                           {block.exercises.map((exercise, index) => (
                              <div key={exercise.id} className="bg-[#111111] border border-white/5 p-6 relative">
                                 <button 
                                    onClick={() => removeExercise(block.id, exercise.id)}
                                    className="absolute top-4 right-4 text-white/20 hover:text-[#ea062c] transition-colors"
                                  >
                                    <X size={16} />
                                 </button>

                                 <div className="flex flex-col lg:flex-row gap-6 mb-6">
                                    {/* Exercise Name Autocomplete */}
                                    <div className="flex-grow">
                                       <label className="block text-[9px] text-white/40 font-black tracking-widest uppercase mb-2">EJERCICIO {index + 1}</label>
                                       <ExerciseAutocomplete 
                                          value={exercise.name}
                                          onChange={(val) => updateExercise(block.id, exercise.id, { name: val })}
                                          placeholder="BUSCAR MOVIMIENTO..."
                                          className="w-full bg-black/40 border-b border-white/20 p-3 text-white font-headline text-xl font-black uppercase outline-none focus:border-primary-cyan transition-all"
                                       />
                                    </div>
                                    
                                    {/* Implement Selection */}
                                    <div className="lg:w-48">
                                       <label className="block text-[9px] text-white/40 font-black tracking-widest uppercase mb-2">IMPLEMENTO</label>
                                       <CustomSelect 
                                          value={exercise.implement}
                                          onChange={(val) => updateExercise(block.id, exercise.id, { implement: val as ImplementType })}
                                          options={IMPLEMENT_OPTIONS}
                                          className="bg-black/40 border-b border-white/20 p-3 text-white font-headline text-sm font-black uppercase outline-none focus:border-primary-cyan transition-all"
                                       />
                                    </div>
                                 </div>

                                 {/* Dynamic Exercise Details based on Implement */}
                                 {exercise.implement === 'BARRA' && (
                                    <div className="bg-black/40 border border-white/5 p-4 space-y-6">
                                       <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                          <div className="flex gap-4">
                                             <button 
                                               onClick={() => updateExercise(block.id, exercise.id, { progressionType: 'ESTÁTICA' })}
                                               className={cn("px-4 py-2 font-headline font-black uppercase text-[10px] tracking-widest border transition-all", exercise.progressionType === 'ESTÁTICA' ? "bg-white text-black border-white" : "border-white/20 text-white/40 hover:text-white")}
                                             >
                                                CARGA ESTÁTICA
                                             </button>
                                             <button 
                                               onClick={() => updateExercise(block.id, exercise.id, { progressionType: 'PROGRESIVA' })}
                                               className={cn("px-4 py-2 font-headline font-black uppercase text-[10px] tracking-widest border transition-all", exercise.progressionType === 'PROGRESIVA' ? "bg-white text-black border-white" : "border-white/20 text-white/40 hover:text-white")}
                                             >
                                                CARGA PROGRESIVA
                                             </button>
                                          </div>

                                          <div className="flex gap-2">
                                             <button 
                                               onClick={() => updateExercise(block.id, exercise.id, { loadMeasureType: 'PERCENTAGE' })}
                                               className={cn("px-3 py-1.5 font-headline font-black uppercase text-[9px] tracking-wider border transition-all", (exercise.loadMeasureType || 'PERCENTAGE') === 'PERCENTAGE' ? "bg-primary-cyan border-primary-cyan text-primary-navy" : "border-white/10 text-white/30 hover:text-white")}
                                             >
                                                TRABAJAR CON %
                                             </button>
                                             <button 
                                               onClick={() => updateExercise(block.id, exercise.id, { loadMeasureType: 'WEIGHT' })}
                                               className={cn("px-3 py-1.5 font-headline font-black uppercase text-[9px] tracking-wider border transition-all", exercise.loadMeasureType === 'WEIGHT' ? "bg-primary-cyan border-primary-cyan text-primary-navy" : "border-white/10 text-white/30 hover:text-white")}
                                             >
                                                TRABAJAR CON KG
                                             </button>
                                          </div>
                                       </div>

                                       {exercise.progressionType === 'ESTÁTICA' ? (
                                          (exercise.loadMeasureType || 'PERCENTAGE') === 'PERCENTAGE' ? (
                                             <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                   <label className="text-[9px] text-white/40 font-black tracking-widest uppercase">REPS</label>
                                                   <input type="text" value={exercise.staticReps} onChange={e => updateExercise(block.id, exercise.id, { staticReps: e.target.value })} className="w-full bg-transparent border-b border-white/20 p-2 text-white font-headline text-lg outline-none" placeholder="EJ: 5" />
                                                </div>
                                                <div className="space-y-2">
                                                   <label className="text-[9px] text-white/40 font-black tracking-widest uppercase">% RM</label>
                                                   <input type="text" value={exercise.staticPercentage} onChange={e => updateExercise(block.id, exercise.id, { staticPercentage: e.target.value })} className="w-full bg-transparent border-b border-white/20 p-2 text-white font-headline text-lg outline-none" placeholder="EJ: 75%" />
                                                </div>
                                             </div>
                                          ) : (
                                             <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                   <label className="text-[9px] text-white/40 font-black tracking-widest uppercase">REPS</label>
                                                   <input type="text" value={exercise.staticReps} onChange={e => updateExercise(block.id, exercise.id, { staticReps: e.target.value })} className="w-full bg-transparent border-b border-white/20 p-2 text-white font-headline text-lg outline-none" placeholder="EJ: 5" />
                                                </div>
                                                <div className="space-y-2">
                                                   <label className="text-[9px] text-primary-cyan/60 font-black tracking-widest uppercase">PESO (H)</label>
                                                   <input type="text" value={exercise.weightMale} onChange={e => updateExercise(block.id, exercise.id, { weightMale: e.target.value })} className="w-full bg-transparent border-b border-primary-cyan/40 p-2 text-primary-cyan font-headline text-lg outline-none" placeholder="KG/LBS" />
                                                </div>
                                                <div className="space-y-2">
                                                   <label className="text-[9px] text-[#ea062c]/60 font-black tracking-widest uppercase">PESO (M)</label>
                                                   <input type="text" value={exercise.weightFemale} onChange={e => updateExercise(block.id, exercise.id, { weightFemale: e.target.value })} className="w-full bg-transparent border-b border-[#ea062c]/40 p-2 text-[#ea062c] font-headline text-lg outline-none" placeholder="KG/LBS" />
                                                </div>
                                             </div>
                                          )
                                       ) : (
                                          <div className="space-y-4">
                                             <div className="flex items-center justify-between">
                                                <label className="text-[10px] text-white/60 font-black tracking-widest uppercase flex items-center gap-2">
                                                  <Activity size={12} /> ETAPAS DE PROGRESIÓN
                                                </label>
                                                <button onClick={() => addProgressiveStage(block.id, exercise.id)} className="text-[9px] text-primary-cyan font-black tracking-widest uppercase flex items-center gap-1 hover:text-white transition-colors">
                                                  <Plus size={12} /> AÑADIR ETAPA
                                                </button>
                                             </div>
                                             
                                             {exercise.progressiveStages.map((stage, sIdx) => (
                                                 <div key={stage.id} className="flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-4 items-center bg-[#050505] p-4 sm:p-3 border border-white/5">
                                                    <div className="flex w-full sm:w-auto sm:col-span-1 justify-between sm:justify-center items-center border-b border-white/5 sm:border-none pb-2 sm:pb-0">
                                                       <span className="font-headline text-white/20 font-black text-sm sm:text-base">#{sIdx + 1}</span>
                                                       <button onClick={() => removeProgressiveStage(block.id, exercise.id, stage.id)} className="sm:hidden text-white/40 hover:text-[#ea062c] p-1">
                                                          <Trash2 size={16}/>
                                                       </button>
                                                    </div>
                                                    
                                                    {(exercise.loadMeasureType || 'PERCENTAGE') === 'PERCENTAGE' ? (
                                                       <div className="grid grid-cols-3 gap-2 w-full sm:col-span-10">
                                                          <div>
                                                             <label className="sm:hidden block text-[8px] text-white/45 font-black uppercase tracking-wider mb-1 text-center">SETS</label>
                                                             <input type="text" value={stage.sets} onChange={e => updateProgressiveStage(block.id, exercise.id, stage.id, { sets: e.target.value })} className="w-full bg-transparent border-b border-white/10 p-2 text-white font-headline text-sm outline-none text-center" placeholder="SETS" />
                                                          </div>
                                                          <div>
                                                             <label className="sm:hidden block text-[8px] text-white/45 font-black uppercase tracking-wider mb-1 text-center">REPS</label>
                                                             <input type="text" value={stage.reps} onChange={e => updateProgressiveStage(block.id, exercise.id, stage.id, { reps: e.target.value })} className="w-full bg-transparent border-b border-white/10 p-2 text-white font-headline text-sm outline-none text-center" placeholder="REPS" />
                                                          </div>
                                                          <div>
                                                             <label className="sm:hidden block text-[8px] text-white/45 font-black uppercase tracking-wider mb-1 text-center">% RM</label>
                                                             <input type="text" value={stage.percentage} onChange={e => updateProgressiveStage(block.id, exercise.id, stage.id, { percentage: e.target.value })} className="w-full bg-transparent border-b border-white/10 p-2 text-primary-cyan font-headline text-sm outline-none text-center" placeholder="% RM" />
                                                          </div>
                                                       </div>
                                                    ) : (
                                                       <div className="grid grid-cols-4 gap-2 w-full sm:col-span-10">
                                                          <div>
                                                             <label className="sm:hidden block text-[8px] text-white/45 font-black uppercase tracking-wider mb-1 text-center">SETS</label>
                                                             <input type="text" value={stage.sets} onChange={e => updateProgressiveStage(block.id, exercise.id, stage.id, { sets: e.target.value })} className="w-full bg-transparent border-b border-white/10 p-2 text-white font-headline text-sm outline-none text-center" placeholder="SETS" />
                                                          </div>
                                                          <div>
                                                             <label className="sm:hidden block text-[8px] text-white/45 font-black uppercase tracking-wider mb-1 text-center">REPS</label>
                                                             <input type="text" value={stage.reps} onChange={e => updateProgressiveStage(block.id, exercise.id, stage.id, { reps: e.target.value })} className="w-full bg-transparent border-b border-white/10 p-2 text-white font-headline text-sm outline-none text-center" placeholder="REPS" />
                                                          </div>
                                                          <div>
                                                             <label className="sm:hidden block text-[8px] text-primary-cyan/60 font-black uppercase tracking-wider mb-1 text-center">PESO (H)</label>
                                                             <input type="text" value={stage.weightMale || ''} onChange={e => updateProgressiveStage(block.id, exercise.id, stage.id, { weightMale: e.target.value })} className="w-full bg-transparent border-b border-white/10 p-2 text-primary-cyan font-headline text-sm outline-none text-center" placeholder="PESO (H)" />
                                                          </div>
                                                          <div>
                                                             <label className="sm:hidden block text-[8px] text-[#ea062c]/60 font-black uppercase tracking-wider mb-1 text-center">PESO (M)</label>
                                                             <input type="text" value={stage.weightFemale || ''} onChange={e => updateProgressiveStage(block.id, exercise.id, stage.id, { weightFemale: e.target.value })} className="w-full bg-transparent border-b border-white/10 p-2 text-[#ea062c] font-headline text-sm outline-none text-center" placeholder="PESO (M)" />
                                                          </div>
                                                       </div>
                                                    )}
                                                    
                                                    <div className="hidden sm:block sm:col-span-1 flex justify-center">
                                                       <button onClick={() => removeProgressiveStage(block.id, exercise.id, stage.id)} className="text-white/20 hover:text-[#ea062c]">
                                                          <Trash2 size={14}/>
                                                       </button>
                                                    </div>
                                                 </div>
                                             ))}
                                             {exercise.progressiveStages.length === 0 && (
                                                <p className="text-[10px] text-white/20 italic font-headline uppercase text-center py-4">No hay etapas configuradas</p>
                                             )}
                                          </div>
                                       )}
                                    </div>
                                 )}

                                 {exercise.implement === 'DB / KB' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-black/40 border border-white/5 p-4">
                                       <div className="space-y-2">
                                          <label className="text-[9px] text-white/40 font-black tracking-widest uppercase">CANTIDAD DE REPS</label>
                                          <input type="text" value={exercise.reps} onChange={e => updateExercise(block.id, exercise.id, { reps: e.target.value })} className="w-full bg-transparent border-b border-white/20 p-2 text-white font-headline text-lg outline-none" placeholder="EJ: 21-15-9" />
                                       </div>
                                       <div className="space-y-2">
                                          <label className="text-[9px] text-primary-cyan/60 font-black tracking-widest uppercase">PESO RECOMENDADO (H)</label>
                                          <CustomSelect 
                                            value={exercise.weightMale}
                                            onChange={(val) => updateExercise(block.id, exercise.id, { weightMale: val })}
                                            options={DB_KB_WEIGHT_OPTIONS}
                                            placeholder="EJ: 22.5 KG"
                                            className="border-b border-primary-cyan/40 p-2 text-primary-cyan font-headline text-lg"
                                          />
                                       </div>
                                       <div className="space-y-2">
                                          <label className="text-[9px] text-[#ea062c]/60 font-black tracking-widest uppercase">PESO RECOMENDADO (M)</label>
                                          <CustomSelect 
                                            value={exercise.weightFemale}
                                            onChange={(val) => updateExercise(block.id, exercise.id, { weightFemale: val })}
                                            options={DB_KB_WEIGHT_OPTIONS}
                                            placeholder="EJ: 15 KG"
                                            className="border-b border-[#ea062c]/40 p-2 text-[#ea062c] font-headline text-lg"
                                          />
                                       </div>
                                    </div>
                                 )}

                                 {exercise.implement === 'BODYWEIGHT / GYM' && (
                                    <div className="bg-black/40 border border-white/5 p-4">
                                       <div className="max-w-xs space-y-2">
                                          <label className="text-[9px] text-white/40 font-black tracking-widest uppercase">CANTIDAD DE REPS</label>
                                          <input type="text" value={exercise.reps} onChange={e => updateExercise(block.id, exercise.id, { reps: e.target.value })} className="w-full bg-transparent border-b border-white/20 p-2 text-white font-headline text-lg outline-none" placeholder="EJ: 50" />
                                       </div>
                                    </div>
                                 )}

                              </div>
                           ))}
                           
                           <button 
                             onClick={() => addExercise(block.id)}
                             className="w-full py-4 border border-dashed border-white/20 text-white/40 font-headline font-black text-[10px] uppercase tracking-widest hover:border-primary-cyan hover:text-primary-cyan transition-all flex justify-center items-center gap-2"
                           >
                              <Plus size={14} /> AÑADIR EJERCICIO
                           </button>
                        </div>

                        {/* Notes Section */}
                        <div className="pl-4 mt-8">
                          <textarea 
                            placeholder="NOTAS ADICIONALES PARA ESTE BLOQUE..."
                            value={block.notes}
                            onChange={(e) => updateBlock(block.id, { notes: e.target.value })}
                            className="w-full bg-[#050505] border border-white/10 p-4 text-white/60 font-body text-xs uppercase tracking-widest min-h-[80px] outline-none focus:border-white/30 transition-all resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Save Feedback message */}
                {message && (
                  <div className={cn(
                    "p-4 border font-headline font-black text-center text-sm tracking-widest uppercase animate-in fade-in duration-300",
                    message.type === 'success' 
                      ? "bg-green-500/10 border-green-500/30 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]" 
                      : "bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                  )}>
                    {message.text}
                  </div>
                )}

                {/* Save Action */}
                <button 
                  onClick={handleSave}
                  disabled={saving || loading}
                  className="w-full bg-[#ea062c] text-white font-headline font-black py-8 uppercase text-2xl tracking-[0.4em] italic hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_20px_50px_rgba(234,6,44,0.2)] flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                       <span className="inline-block animate-spin mr-2 border-2 border-t-transparent border-white rounded-full w-6 h-6" />
                       GUARDANDO...
                    </>
                  ) : 'GUARDAR PLANIFICACIÓN'}
                </button>
             </div>
           )}
        </main>

      </div>
    </div>
  );
}
