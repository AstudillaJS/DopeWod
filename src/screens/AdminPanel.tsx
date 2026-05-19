import React, { useState, useEffect } from 'react';
import { type Screen } from '../App';
import { Shield, Settings, UserCheck, Key, UserMinus, Check, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface AdminPanelProps {
  onNavigate: (screen: Screen) => void;
}

export function AdminPanel({ onNavigate }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'requests' | 'logs'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const logError = async (origin: string, message: string) => {
    const newLog = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      type: 'ERROR',
      origin,
      message
    };
    setLogs(prev => [newLog, ...prev]);
    await supabase.from('system_logs').insert([{ type: 'ERROR', origin, message }]);
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('full_name');
      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      console.error(err);
      logError('DATABASE', `Error obteniendo usuarios: ${err.message}`);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase.from('system_logs').select('*').order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      if (data) setLogs(data);
    } catch (err: any) {
      console.error("Error fetching logs", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLogs();
  }, []);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!['athlete', 'coach', 'admin'].includes(newRole)) return;
    
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      await fetchUsers();
      
      // Registrar en log como info (opcional)
      await supabase.from('system_logs').insert([{ type: 'INFO', origin: 'ADMIN', message: `Rol actualizado a ${newRole} para usuario ${userId}` }]);
      fetchLogs();
    } catch (err: any) {
      alert("Error actualizando rol: " + err.message);
      logError('ADMIN', `Fallo al actualizar rol: ${err.message}`);
    }
  };

  const handleRevokeAccess = async (userId: string) => {
    if (!window.confirm("¿Seguro que deseas revocar el acceso de este usuario? (Se eliminará su perfil operativo).")) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      fetchUsers();
      await supabase.from('system_logs').insert([{ type: 'WARNING', origin: 'ADMIN', message: `Acceso revocado para usuario ${userId}` }]);
      fetchLogs();
    } catch (err: any) {
      alert("Error eliminando perfil: " + err.message);
      logError('ADMIN', `Fallo al revocar acceso: ${err.message}`);
    }
  };

  const adminsCount = users.filter(u => u.role === 'admin').length;
  const coachesCount = users.filter(u => u.role === 'coach').length;

  return (
    <div className="flex flex-col min-h-[calc(100vh-176px)]">
      {/* Header Section */}
      <section className="bg-primary-cyan p-6 sm:p-8 md:p-16">
        <div className="max-w-[1400px] mx-auto">
          <p className="font-headline font-black text-[10px] md:text-sm tracking-[0.4em] text-primary-navy uppercase mb-4 sm:mb-8">
            SUPER ADMIN CONSOLE
          </p>
          <h1 className="font-headline text-4xl sm:text-6xl md:text-[140px] font-black text-white italic leading-[0.9] md:leading-[0.8] tracking-tighter uppercase">
            SISTEMA CENTRAL
          </h1>
        </div>
      </section>

      {/* Admin Content */}
      <div className="flex-grow max-w-[1400px] mx-auto w-full p-4 md:p-8 space-y-8 sm:space-y-12">
        {/* Tabs */}
        <div className="flex border-b border-white/5 overflow-x-auto scrollbar-none">
           <button 
             onClick={() => setActiveTab('users')}
             className={cn(
               "px-4 sm:px-10 py-4 sm:py-6 font-headline font-black uppercase text-xs sm:text-sm tracking-widest border-b-4 transition-all whitespace-nowrap",
               activeTab === 'users' ? "border-primary-cyan text-white" : "border-transparent text-white/20 hover:text-white"
             )}
           >
             GESTIÓN DE ROLES
           </button>
           <button 
             onClick={() => setActiveTab('requests')}
             className={cn(
               "px-4 sm:px-10 py-4 sm:py-6 font-headline font-black uppercase text-xs sm:text-sm tracking-widest border-b-4 transition-all whitespace-nowrap",
               activeTab === 'requests' ? "border-primary-cyan text-white" : "border-transparent text-white/20 hover:text-white"
             )}
           >
             SOLICITUDES DE SUSCRIPCIÓN
           </button>
           <button 
             onClick={() => setActiveTab('logs')}
             className={cn(
               "px-4 sm:px-10 py-4 sm:py-6 font-headline font-black uppercase text-xs sm:text-sm tracking-widest border-b-4 transition-all whitespace-nowrap",
               activeTab === 'logs' ? "border-amber-500 text-amber-500" : "border-transparent text-white/20 hover:text-amber-500/50"
             )}
           >
             ERROR LOG
           </button>
        </div>

        {activeTab === 'users' ? (
          <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <AdminCard icon={<Shield className="text-primary-cyan w-5 h-5 sm:w-6 sm:h-6" />} title="SUPER ADMINS" count={adminsCount.toString().padStart(2, '0')} />
                  <AdminCard icon={<UserCheck className="text-primary-cyan w-5 h-5 sm:w-6 sm:h-6" />} title="COACHES ACTIVOS" count={coachesCount.toString().padStart(2, '0')} />
                  <AdminCard icon={<Key className="text-white/20 w-5 h-5 sm:w-6 sm:h-6" />} title="ROLES PENDIENTES" count="0" />
              </div>

              {/* User List Table Wrapper */}
              <div className="bg-[#051224] border border-white/5 overflow-x-auto">
                 <table className="w-full text-left font-headline min-w-[600px]">
                    <thead className="bg-black/40 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-primary-cyan border-b border-white/5">
                       <tr>
                          <th className="p-4 sm:p-6">Usuario</th>
                          <th className="p-4 sm:p-6">Email</th>
                          <th className="p-4 sm:p-6">Rol Actual</th>
                          <th className="p-4 sm:p-6 text-right">Acciones</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {users.length > 0 ? users.map((user) => (
                           <UserRow 
                             key={user.id} 
                             name={user.full_name || 'Sin Nombre'} 
                             email={user.email} 
                             role={user.role} 
                             onEdit={(newRole) => handleUpdateRole(user.id, newRole)}
                             onRevoke={() => handleRevokeAccess(user.id)}
                          />
                       )) : (
                         <tr>
                            <td colSpan={4} className="p-6 text-center text-white/20 uppercase font-black tracking-widest text-xs">
                              Cargando usuarios o lista vacía...
                            </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
          </div>
        ) : activeTab === 'requests' ? (
          <div className="bg-[#051224]/30 border border-white/5 border-dashed p-10 sm:p-20 flex flex-col items-center justify-center text-center">
             <p className="font-headline text-white/20 text-xs md:text-sm font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] italic">
               No hay solicitudes de suscripción pendientes de confirmación.
             </p>
          </div>
        ) : (
          <div className="bg-[#0c0800] border border-amber-500/30 p-6 sm:p-8 font-mono text-xs sm:text-sm shadow-[0_0_15px_rgba(245,158,11,0.05)]">
             <div className="flex justify-between items-center mb-6 border-b border-amber-500/20 pb-4">
               <h2 className="text-amber-500 font-black tracking-widest uppercase text-sm sm:text-base">7. REGISTRO TÉCNICO (ERROR LOG)</h2>
               <button 
                 onClick={async () => {
                   if(window.confirm('¿Borrar historial?')) {
                     await supabase.from('system_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                     setLogs([]);
                   }
                 }}
                 className="border border-amber-500/50 text-amber-500/80 px-4 py-2 hover:bg-amber-500/10 transition-colors uppercase text-[10px] tracking-widest font-black"
               >
                 Limpiar Logs
               </button>
             </div>
             
             <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-500/20 pr-4">
                <div className="grid grid-cols-[100px_120px_1fr] sm:grid-cols-[140px_140px_1fr] gap-4 text-amber-500/50 uppercase tracking-widest text-[9px] font-black border-b border-amber-500/10 pb-2 mb-4">
                   <span>Timestamp</span>
                   <span>Tipo Origen</span>
                   <span>Mensaje</span>
                </div>
                {logs.length > 0 ? logs.map((log, idx) => (
                   <div key={idx} className="grid grid-cols-[100px_120px_1fr] sm:grid-cols-[140px_140px_1fr] gap-4 text-amber-500/80 items-start border-b border-amber-500/5 pb-3">
                      <span className="whitespace-nowrap text-[10px] sm:text-xs">
                        {new Date(log.created_at).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className="whitespace-nowrap text-[10px] sm:text-xs">
                         <strong className={log.type === 'ERROR' ? 'text-red-500' : 'text-amber-500'}>{log.type}</strong> {log.origin}
                      </span>
                      <span className="break-words text-[10px] sm:text-xs">{log.message}</span>
                   </div>
                )) : (
                   <div className="text-amber-500/40 text-center py-10 uppercase tracking-widest font-black text-[10px]">
                     Sin registros en el sistema.
                   </div>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminCard({ icon, title, count }: { icon: any, title: string, count: string }) {
  return (
    <div className="bg-[#051224] p-4 sm:p-8 border border-white/5 flex items-center justify-between hover:border-primary-cyan/20 transition-all cursor-crosshair">
       <div className="flex items-center gap-4 sm:gap-6">
          <div className="p-3 sm:p-4 bg-black/40 rounded-sm">
             {icon}
          </div>
          <h3 className="font-headline font-black text-white/40 uppercase text-[9px] sm:text-xs tracking-widest">{title}</h3>
       </div>
       <span className="font-headline text-2xl sm:text-4xl font-black text-white italic tracking-tighter">{count}</span>
    </div>
  );
}

function UserRow({ name, email, role, onEdit, onRevoke }: { name: string, email: string, role: string, onEdit: (newRole: string) => void | Promise<void>, onRevoke: () => void | Promise<void>, key?: any }) {
  const [selectedRole, setSelectedRole] = useState(role);
  const [isSaving, setIsSaving] = useState(false);
  
  // Sincronizar el estado local si prop "role" cambia desde afuera
  useEffect(() => {
    setSelectedRole(role);
  }, [role]);

  const isChanged = selectedRole !== role;

  const handleSave = async () => {
    setIsSaving(true);
    await onEdit(selectedRole);
    setIsSaving(false);
  };

  return (
    <tr className="hover:bg-white/5 transition-colors group">
       <td className="p-4 sm:p-6 font-black text-2xs sm:text-xs uppercase tracking-widest text-white">{name}</td>
       <td className="p-4 sm:p-6 font-black text-[9px] sm:text-[10px] uppercase tracking-widest text-white/40">{email}</td>
       <td className="p-4 sm:p-6 flex items-center gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={isSaving}
            className={cn(
              "bg-[#051224] border p-2 text-white font-headline text-[10px] font-black uppercase tracking-widest outline-none transition-all cursor-pointer",
              selectedRole === 'admin' ? "border-primary-cyan text-primary-cyan focus:border-primary-cyan" : "border-white/20 text-white/60 focus:border-white/40 hover:border-white/40"
            )}
          >
            <option value="athlete">ATHLETE</option>
            <option value="coach">COACH</option>
            <option value="admin">ADMIN</option>
          </select>
          {isChanged && (
             <button 
               onClick={handleSave} 
               disabled={isSaving}
               className="p-1.5 sm:p-2 border border-primary-cyan text-primary-cyan hover:bg-primary-cyan hover:text-black transition-colors flex-shrink-0"
               title="Guardar Cambio"
             >
               <Check size={14} className="sm:w-4 sm:h-4" />
             </button>
          )}
          {isChanged && (
             <button 
               onClick={() => setSelectedRole(role)} 
               disabled={isSaving}
               className="p-1.5 sm:p-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex-shrink-0"
               title="Cancelar"
             >
               <X size={14} className="sm:w-4 sm:h-4" />
             </button>
          )}
       </td>
       <td className="p-4 sm:p-6 text-right space-x-1 sm:space-x-2">
          <button onClick={onRevoke} className="p-1.5 sm:p-2 text-white/20 hover:text-red-500 transition-colors" title="Revocar Accesos">
             <UserMinus size={14} className="sm:w-4 sm:h-4" />
          </button>
       </td>
    </tr>
  );
}
