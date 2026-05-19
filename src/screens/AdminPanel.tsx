import React, { useState, useEffect } from 'react';
import { type Screen } from '../App';
import { Shield, Settings, UserCheck, Key, UserMinus, Check, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface AdminPanelProps {
  onNavigate: (screen: Screen) => void;
}

export function AdminPanel({ onNavigate }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'requests'>('users');
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('full_name');
    if (!error && data) {
      setUsers(data);
    } else {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId: string, currentRole: string) => {
    const newRole = window.prompt("Ingresa el nuevo rol (athlete, coach, admin):", currentRole);
    if (!newRole || !['athlete', 'coach', 'admin'].includes(newRole)) {
      if (newRole !== null) alert("Rol inválido.");
      return;
    }
    
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (!error) {
       fetchUsers();
    } else {
       alert("Error actualizando rol: " + error.message);
    }
  };

  const handleRevokeAccess = async (userId: string) => {
    if (!window.confirm("¿Seguro que deseas revocar el acceso de este usuario? (Se eliminará su perfil operativo).")) return;
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (!error) {
       fetchUsers();
    } else {
       alert("Error eliminando perfil: " + error.message);
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
                            onEdit={() => handleUpdateRole(user.id, user.role)}
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
        ) : (
          <div className="bg-[#051224]/30 border border-white/5 border-dashed p-10 sm:p-20 flex flex-col items-center justify-center text-center">
             <p className="font-headline text-white/20 text-xs md:text-sm font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] italic">
               No hay solicitudes de suscripción pendientes de confirmación.
             </p>
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

function UserRow({ name, email, role, onEdit, onRevoke }: { name: string, email: string, role: string, onEdit: () => void | Promise<void>, onRevoke: () => void | Promise<void>, key?: any }) {
  return (
    <tr className="hover:bg-white/5 transition-colors group">
       <td className="p-4 sm:p-6 font-black text-2xs sm:text-xs uppercase tracking-widest text-white">{name}</td>
       <td className="p-4 sm:p-6 font-black text-[9px] sm:text-[10px] uppercase tracking-widest text-white/40">{email}</td>
       <td className="p-4 sm:p-6">
          <span className={cn(
            "text-[8px] sm:text-[9px] font-black tracking-widest border px-2 sm:px-3 py-0.5 sm:py-1 uppercase",
            role === 'admin' ? "border-primary-cyan text-primary-cyan" : "border-white/20 text-white/40"
          )}>
            {role}
          </span>
       </td>
       <td className="p-4 sm:p-6 text-right space-x-1 sm:space-x-2">
          <button onClick={onEdit} className="p-1.5 sm:p-2 text-white/20 hover:text-primary-cyan transition-colors" title="Editar Rol">
             <Settings size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button onClick={onRevoke} className="p-1.5 sm:p-2 text-white/20 hover:text-red-500 transition-colors" title="Revocar Accesos">
             <UserMinus size={14} className="sm:w-4 sm:h-4" />
          </button>
       </td>
    </tr>
  );
}
