import { useState, useEffect } from 'react';
import { type Screen } from '../App';
import { Users, Search, UserPlus, Loader2, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface AthleteManagementProps {
  onNavigate: (screen: Screen) => void;
  dbRole?: string;
  programId?: string | null;
}

export function AthleteManagement({ onNavigate, dbRole, programId }: AthleteManagementProps) {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: progData } = await supabase.from('programs').select('*').order('name');
      if (progData) setPrograms(progData);

      let query = supabase.from('profiles').select('*').eq('role', 'athlete').order('full_name');
      if (dbRole === 'coach' && programId) {
        query = query.eq('program_id', programId);
      }
      
      const { data: athData } = await query;
      if (athData) setAthletes(athData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dbRole, programId]);

  const handleUpdateAthlete = async (id: string, field: string, value: string | null) => {
    setSavingId(id);
    const { error } = await supabase.from('profiles').update({ [field]: value }).eq('id', id);
    if (!error) {
      setAthletes(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
    } else {
      alert("Error actualizando atleta: " + error.message);
    }
    setSavingId(null);
  };

  const filteredAthletes = athletes.filter(a => 
    (a.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAdmin = dbRole === 'admin';

  return (
    <div className="flex flex-col min-h-[calc(100vh-176px)]">
      {/* Header Section */}
      <section className="bg-primary-cyan p-6 sm:p-8 md:p-16">
        <div className="max-w-[1400px] mx-auto">
          <p className="font-headline font-black text-[10px] md:text-sm tracking-[0.4em] text-primary-navy uppercase mb-4 sm:mb-8">
            CONTROL DE OPERACIONES
          </p>
          <h1 className="font-headline text-4xl sm:text-6xl md:text-[140px] font-black text-white italic leading-[0.9] md:leading-[0.8] tracking-tighter uppercase">
            GESTIÓN ATLETAS
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-grow max-w-[1400px] mx-auto w-full p-4 md:p-8 space-y-6 sm:space-y-8 flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
           <div className="flex-grow relative group">
              <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary-cyan transition-colors sm:w-5 sm:h-5" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="BUSCAR ATLETA POR NOMBRE O EMAIL..."
                className="w-full bg-[#051224] border border-white/5 p-4 sm:p-6 pl-12 sm:pl-16 text-white font-headline font-black uppercase text-xs sm:text-sm tracking-widest outline-none focus:border-primary-cyan/40 transition-all"
              />
           </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex-grow bg-[#051224]/30 border border-white/5 border-dashed flex flex-col items-center justify-center text-center p-8 sm:p-20">
             <Loader2 size={48} className="text-primary-cyan animate-spin mb-4" />
             <p className="font-headline text-white/40 text-xs md:text-sm font-black uppercase tracking-[0.2em] italic">
               CARGANDO ATLETAS...
             </p>
          </div>
        ) : filteredAthletes.length === 0 ? (
          <div className="flex-grow bg-[#051224]/30 border border-white/5 border-dashed flex flex-col items-center justify-center text-center p-8 sm:p-20">
             <div className="text-white/5 mb-6 sm:mb-12">
                <Users size={80} className="sm:w-40 sm:h-40" strokeWidth={0.5} />
             </div>
             <p className="font-headline text-white/20 text-xs md:text-sm font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] italic">
               No hay atletas asignados a tu mando o que coincidan con la búsqueda.
             </p>
          </div>
        ) : (
          <div className="bg-[#051224] border border-white/5 overflow-x-auto">
             <table className="w-full text-left font-headline min-w-[800px]">
                <thead className="bg-black/40 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-primary-cyan border-b border-white/5">
                   <tr>
                      <th className="p-4 sm:p-6">Atleta</th>
                      <th className="p-4 sm:p-6">Email</th>
                      <th className="p-4 sm:p-6 w-48">Programa (Planificación)</th>
                      <th className="p-4 sm:p-6 w-32">Grupo</th>
                      <th className="p-4 sm:p-6 text-right w-16">Estado</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {filteredAthletes.map((athlete) => (
                     <tr key={athlete.id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-4 sm:p-6">
                           <div className="font-black text-xs sm:text-sm uppercase tracking-widest text-white">
                             {athlete.full_name || 'Sin Nombre'}
                           </div>
                        </td>
                        <td className="p-4 sm:p-6 font-black text-[9px] sm:text-[10px] uppercase tracking-widest text-white/40">
                           {athlete.email}
                        </td>
                        <td className="p-4 sm:p-6">
                           <select 
                             value={athlete.program_id || ''}
                             onChange={e => handleUpdateAthlete(athlete.id, 'program_id', e.target.value || null)}
                             disabled={!isAdmin}
                             className={cn(
                               "w-full bg-black/40 border border-white/10 p-2 text-white font-headline text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary-cyan transition-all",
                               !isAdmin && "opacity-50 cursor-not-allowed"
                             )}
                           >
                             <option value="">SIN PLANIFICACIÓN</option>
                             {programs.map(p => (
                               <option key={p.id} value={p.id}>{p.name}</option>
                             ))}
                           </select>
                        </td>
                        <td className="p-4 sm:p-6">
                           <select 
                             value={athlete.group_id || 'A'}
                             onChange={e => handleUpdateAthlete(athlete.id, 'group_id', e.target.value)}
                             className="w-full bg-black/40 border border-white/10 p-2 text-white font-headline text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary-cyan transition-all"
                           >
                             {['A', 'B', 'C', 'D'].map(g => (
                               <option key={g} value={g}>GRUPO {g}</option>
                             ))}
                           </select>
                        </td>
                        <td className="p-4 sm:p-6 text-right">
                           {savingId === athlete.id ? (
                             <Loader2 size={16} className="text-primary-cyan animate-spin inline-block" />
                           ) : (
                             <Save size={16} className="text-white/10 group-hover:text-primary-cyan transition-colors inline-block" />
                           )}
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  );
}
