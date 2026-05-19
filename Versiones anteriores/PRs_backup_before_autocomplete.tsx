import { type Screen, type PRRecord } from '../App';
import { Dumbbell, Plus, X, Calendar, Activity, Weight } from 'lucide-react';
import { cn } from '../lib/utils';
import React, { useState } from 'react';

interface PRsProps {
  onNavigate: (screen: Screen) => void;
  prs: PRRecord[];
  onAddPR: (pr: Omit<PRRecord, 'id'>) => void;
}

export function PRs({ onNavigate, prs, onAddPR }: PRsProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [formData, setFormData] = useState({
    exercise: '',
    weight: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.exercise || !formData.weight) return;
    
    onAddPR({
      exercise: formData.exercise.toUpperCase(),
      weight: parseFloat(formData.weight),
      date: formData.date
    });
    
    setIsRecording(false);
    setFormData({ exercise: '', weight: '', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-176px)]">
      {/* Header Section */}
      <section className="bg-primary-cyan p-8 md:p-16">
        <div className="max-w-[1400px] mx-auto">
          <p className="font-headline font-black text-xs md:text-sm tracking-[0.4em] text-primary-navy uppercase mb-8">
            SISTEMAS ANALÍTICOS
          </p>
          <h1 className="font-headline text-6xl md:text-[140px] font-black text-white italic leading-[0.8] tracking-tighter uppercase">
            {isRecording ? 'REGISTRO RM' : 'RECORDS MÁXIMOS'}
          </h1>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col max-w-[1400px] mx-auto w-full p-4 md:p-8 space-y-8">
        {isRecording ? (
          <form onSubmit={handleSubmit} className="bg-[#051224] border-2 border-primary-cyan p-8 md:p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Exercise Selection */}
                <div className="space-y-4">
                   <label className="flex items-center gap-3 text-primary-cyan font-headline font-black text-[10px] uppercase tracking-[0.2em]">
                      <Activity size={16} />
                      EJERCICIO DEL RM
                   </label>
                   <input 
                     type="text"
                     value={formData.exercise}
                     onChange={e => setFormData({ ...formData, exercise: e.target.value })}
                     placeholder="EJ: BACK SQUAT"
                     className="w-full bg-black/40 border-b border-white/20 p-4 text-white font-headline text-2xl font-black uppercase outline-none focus:border-primary-cyan transition-all"
                     required
                   />
                </div>

                {/* Date Selection */}
                <div className="space-y-4">
                   <label className="flex items-center gap-3 text-primary-cyan font-headline font-black text-[10px] uppercase tracking-[0.2em]">
                      <Calendar size={16} />
                      FECHA DEL RM
                   </label>
                   <input 
                     type="date"
                     value={formData.date}
                     onChange={e => setFormData({ ...formData, date: e.target.value })}
                     className="w-full bg-black/40 border-b border-white/20 p-4 text-white font-headline text-2xl font-black uppercase outline-none focus:border-primary-cyan transition-all"
                     required
                   />
                </div>

                {/* Weight Input */}
                <div className="space-y-4 md:col-span-2">
                   <label className="flex items-center gap-3 text-primary-cyan font-headline font-black text-[10px] uppercase tracking-[0.2em]">
                      <Weight size={16} />
                      PESO DEL RM (KG)
                   </label>
                   <input 
                     type="number"
                     step="0.5"
                     value={formData.weight}
                     onChange={e => setFormData({ ...formData, weight: e.target.value })}
                     placeholder="0.0"
                     className="w-full bg-black/40 border-b border-white/20 p-4 text-white font-headline text-6xl md:text-8xl font-black outline-none focus:border-primary-cyan transition-all placeholder:opacity-10"
                     required
                   />
                </div>
             </div>

             <div className="flex flex-col md:flex-row gap-4 pt-8">
                <button 
                  type="submit"
                  className="flex-grow bg-primary-cyan text-primary-navy py-6 font-headline font-black uppercase text-xl italic tracking-widest hover:brightness-110 active:scale-95 transition-all"
                >
                  CONFIRMAR REGISTRO
                </button>
                <button 
                  type="button"
                  onClick={() => setIsRecording(false)}
                  className="px-12 bg-white/5 text-white/40 py-6 font-headline font-black uppercase text-sm tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3"
                >
                  <X size={18} />
                  CANCELAR
                </button>
             </div>
          </form>
        ) : prs.length === 0 ? (
          <div className="flex-grow bg-[#051224]/50 border border-white/5 flex flex-col items-center justify-center text-center p-12">
             <div className="text-white/5 mb-8">
                <Dumbbell size={120} strokeWidth={1} />
             </div>
             <p className="font-headline text-white/20 text-xs md:text-sm font-black uppercase tracking-[0.3em] leading-relaxed max-w-sm italic">
               No hay registros aún. Inicia secuencia de carga.
             </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {prs.map(pr => (
               <div key={pr.id} className="bg-[#051224] border border-white/5 p-8 flex flex-col justify-between group hover:border-primary-cyan/40 transition-all">
                  <div className="flex justify-between items-start mb-12">
                     <p className="font-headline font-black text-[10px] tracking-[0.2em] text-primary-cyan uppercase">{pr.date}</p>
                     <div className="bg-primary-cyan/10 p-2 text-primary-cyan opacity-20 group-hover:opacity-100 transition-all">
                        <Dumbbell size={16} />
                     </div>
                  </div>
                  <div>
                     <h3 className="font-headline font-black text-white/40 uppercase text-xs tracking-widest mb-2">{pr.exercise}</h3>
                     <span className="font-headline text-6xl font-black text-white italic tracking-tighter uppercase">{pr.weight}<small className="text-lg ml-2 opacity-20">KG</small></span>
                  </div>
               </div>
             ))}
          </div>
        )}

        {/* Action Button */}
        {!isRecording && (
          <button 
            onClick={() => setIsRecording(true)}
            className="bg-primary-cyan/10 border-2 border-primary-cyan/40 text-primary-cyan py-8 px-12 font-headline font-black uppercase text-sm tracking-[0.4em] hover:bg-primary-cyan hover:text-primary-navy transition-all active:scale-95 flex items-center justify-center gap-6 group mt-auto"
          >
            REGISTRAR NUEVO MÁXIMO
            <Plus size={24} strokeWidth={4} />
          </button>
        )}
      </div>
    </div>
  );
}
