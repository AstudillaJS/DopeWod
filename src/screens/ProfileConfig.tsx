import React, { useEffect, useState } from 'react';
import { type Screen, type UserRole } from '../App';
import { User, LogOut, ArrowLeft, Mail, Shield, Target } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '../components/Skeleton';

interface ProfileConfigProps {
  onNavigate: (screen: Screen) => void;
  role: UserRole;
}

export function ProfileConfig({ onNavigate, role }: ProfileConfigProps) {
  const [profile, setProfile] = useState<any>(null);
  const [programName, setProgramName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, 'profiles', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);
          
          if (data.program_id) {
            const progSnap = await getDoc(doc(db, 'programs', data.program_id));
            if (progSnap.exists()) {
              setProgramName(progSnap.data().name);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="px-4 sm:px-6 md:px-12 py-6 sm:py-12 max-w-[800px] mx-auto space-y-8 select-none">
      <button 
         onClick={() => onNavigate('home')}
         className="p-2 -ml-2 text-white/40 hover:text-primary-cyan transition-colors flex items-center gap-2 font-headline font-black text-[10px] tracking-[0.3em] uppercase mb-8"
      >
        <ArrowLeft size={16} />
        VOLVER
      </button>

      <div className="bg-[#051224] border border-white/5 p-8 sm:p-12">
         <div className="flex items-center gap-6 mb-12">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary-cyan/10 border border-primary-cyan flex items-center justify-center shrink-0">
               <User size={40} className="text-primary-cyan" />
            </div>
            <div>
               <h1 className="font-headline text-3xl sm:text-5xl font-black text-white italic tracking-tighter uppercase mb-2 flex items-center h-[1em]">
                 {loading ? <Skeleton className="h-[0.8em] w-64 bg-white/20" /> : profile?.full_name || 'USUARIO'}
               </h1>
               <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1">
                 <Shield size={12} className="text-primary-cyan" />
                 <span className="font-headline text-[10px] font-black tracking-widest text-primary-cyan uppercase">
                    ROL: {role}
                 </span>
               </div>
            </div>
         </div>

         <div className="space-y-6 sm:space-y-8">
            <div className="border-l-2 border-white/10 pl-4 sm:pl-6">
               <div className="flex items-center gap-2 text-white/40 mb-2">
                 <Mail size={14} />
                 <span className="font-headline text-[10px] tracking-[0.2em] font-black uppercase">Correo Electrónico</span>
               </div>
               <p className="text-white font-medium text-sm sm:text-base">{auth.currentUser?.email}</p>
            </div>

            <div className="border-l-2 border-white/10 pl-4 sm:pl-6">
               <div className="flex items-center gap-2 text-white/40 mb-2">
                 <Shield size={14} />
                 <span className="font-headline text-[10px] tracking-[0.2em] font-black uppercase">Documento de Identidad (DNI)</span>
               </div>
               <p className="text-white font-medium text-sm sm:text-base flex items-center h-[1.5em]">
                 {loading ? <Skeleton className="h-[1em] w-32" /> : profile?.dni || 'NO REGISTRADO'}
               </p>
            </div>

            <div className="border-l-2 border-primary-cyan pl-4 sm:pl-6 bg-primary-cyan/5 py-4 pr-4">
               <div className="flex items-center gap-2 text-primary-cyan mb-2">
                 <Target size={14} />
                 <span className="font-headline text-[10px] tracking-[0.2em] font-black uppercase">Programa Asignado</span>
               </div>
               <p className="text-white font-medium text-sm sm:text-base font-headline italic tracking-wide flex items-center h-[1.5em]">
                 {loading ? <Skeleton className="h-[1em] w-48" /> : (programName || 'SIN ASIGNAR')}
               </p>
            </div>
         </div>

         <div className="mt-16 pt-8 border-t border-white/5 flex justify-end">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-colors font-headline font-black text-xs tracking-widest uppercase"
            >
               <LogOut size={16} />
               CERRAR SESIÓN
            </button>
         </div>
      </div>
    </div>
  );
}
