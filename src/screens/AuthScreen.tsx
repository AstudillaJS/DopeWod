import React, { useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

export function AuthScreen({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dni, setDni] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthSuccess();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, dni: dni, role: 'athlete' }
          }
        });
        if (error) throw error;
        if (data.user && !data.session) {
            setSuccessMsg('REVISA TU EMAIL PARA VALIDAR TU CUENTA.');
        } else {
            onAuthSuccess();
        }
      }
    } catch (err: any) {
      setError(err.message.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#051224]">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col items-center">
        <img src="/lynx-logo.png" alt="Lynx Consulting" className="h-16 sm:h-20 object-contain mix-blend-screen" />
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-[#0a192f] p-6 sm:p-12 border-l-4 sm:border-l-8 border-lynx-orange shadow-2xl">
        <h2 className="font-outfit text-2xl sm:text-4xl font-black uppercase tracking-tighter mb-6 sm:mb-8 text-white">
          {isLogin ? 'INICIAR SESIÓN' : 'REGISTRO DE USUARIO'}
        </h2>
        <form onSubmit={handleAuth} className="space-y-4 sm:space-y-6">
          {!isLogin && (
            <>
              <div>
                <label className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-lynx-orange mb-1.5 sm:mb-2 block">Nombre Completo</label>
                <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-[#051224] border border-white/10 p-3 sm:p-4 text-white font-outfit text-base sm:text-xl focus:border-lynx-orange outline-none transition-all uppercase" />
              </div>
              <div>
                <label className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-lynx-orange mb-1.5 sm:mb-2 block">DNI</label>
                <input required type="text" value={dni} onChange={e => setDni(e.target.value)} className="w-full bg-[#051224] border border-white/10 p-3 sm:p-4 text-white font-outfit text-base sm:text-xl focus:border-lynx-orange outline-none transition-all" />
              </div>
            </>
          )}
          <div>
            <label className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-lynx-orange mb-1.5 sm:mb-2 block">Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#051224] border border-white/10 p-3 sm:p-4 text-white font-outfit text-base sm:text-xl focus:border-lynx-orange outline-none transition-all" />
          </div>
          <div>
            <label className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-lynx-orange mb-1.5 sm:mb-2 block">Contraseña</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#051224] border border-white/10 p-3 sm:p-4 text-white font-outfit text-base sm:text-xl focus:border-lynx-orange outline-none transition-all" />
          </div>
          {error && (
            <div className="p-3 sm:p-4 bg-red-500/10 border-l-4 border-red-500">
              <p className="text-[9px] sm:text-[10px] uppercase font-black tracking-tighter text-red-500">{error}</p>
            </div>
          )}
          {successMsg && (
            <div className="p-3 sm:p-4 bg-green-500/10 border-l-4 border-green-500">
              <p className="text-[9px] sm:text-[10px] uppercase font-black tracking-tighter text-green-500">{successMsg}</p>
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full bg-lynx-orange text-white font-outfit font-black py-3 sm:py-4 tracking-widest uppercase hover:bg-lynx-orange/90 transition-all text-xs sm:text-sm">
            {loading ? 'Procesando...' : isLogin ? 'Entrar' : 'Registrar'}
          </button>
        </form>
        <button onClick={() => { setIsLogin(!isLogin); setError(null); setSuccessMsg(null); }} className="mt-4 sm:mt-6 text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-white/40 hover:text-white transition-all w-full text-center">
          {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entrar'}
        </button>
      </motion.div>
    </div>
  );
}
