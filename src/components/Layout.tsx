import { type Screen, type UserRole } from '../App';
import { Target, Dumbbell, Timer, History, User, Activity, Edit3, Users, Settings, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface LayoutProps {
  children: ReactNode;
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  dbRole: UserRole;
  hasPlanning: boolean;
}

export function Layout({ children, currentScreen, onNavigate, role, onRoleChange, dbRole, hasPlanning }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-primary-navy font-body">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-[80px] bg-primary-navy border-b border-primary-cyan/20 px-4 sm:px-6 flex justify-between items-center bg-surface/90 backdrop-blur-md">
        <div className="flex items-center gap-3 sm:gap-4 cursor-pointer" onClick={() => onNavigate('home')}>
          <img src="/lynx-logo.png" alt="Lynx" className="h-8 sm:h-10 object-contain drop-shadow-md" />
          <div className="flex flex-col border-l-2 border-white/10 pl-3">
            <span className="font-headline font-black text-lg sm:text-2xl tracking-tighter text-white italic uppercase leading-none">DOPE WOD</span>
            <span className="text-lynx-orange text-[7px] sm:text-[9px] font-black tracking-widest uppercase mt-1">System</span>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-12">
           {/* Role Segmented Control (Demo Switcher) */}
           {(dbRole === 'coach' || dbRole === 'admin') && (
             <div className="flex border border-white/20 p-1 bg-black/40">
                <button 
                  onClick={() => onRoleChange('athlete')}
                  className={cn(
                    "px-4 py-1.5 text-[9px] font-black tracking-widest uppercase transition-all whitespace-nowrap",
                    role === 'athlete' ? "bg-primary-cyan text-primary-navy" : "text-white/40 hover:text-white"
                  )}
                >
                  Atleta
                </button>
                <button 
                  onClick={() => onRoleChange('coach')}
                  className={cn(
                    "px-4 py-1.5 text-[9px] font-black tracking-widest uppercase transition-all whitespace-nowrap",
                    role === 'coach' ? "bg-primary-cyan text-primary-navy" : "text-white/40 hover:text-white"
                  )}
                >
                  Coach
                </button>
                <button 
                  onClick={() => onRoleChange('admin')}
                  className={cn(
                    "px-4 py-1.5 text-[9px] font-black tracking-widest uppercase transition-all whitespace-nowrap",
                    role === 'admin' ? "bg-primary-cyan text-primary-navy" : "text-white/40 hover:text-white"
                  )}
                >
                  Admin
                </button>
             </div>
           )}
           
           {/* System Info */}
           <div className="text-right">
              <p className="text-primary-cyan font-headline text-[10px] font-black tracking-[0.2em] uppercase leading-none mb-1">
                SISTEMA: {role.toUpperCase()}
              </p>
           </div>
           
           <div className="flex items-center gap-2">
             <div 
               onClick={() => role === 'admin' && onNavigate('admin-panel')}
               className={cn(
                 "w-10 h-10 border border-white/20 flex items-center justify-center p-2 group cursor-pointer hover:border-primary-cyan transition-colors",
                 currentScreen === 'admin-panel' && "border-primary-cyan"
               )}
               title="Admin Panel"
             >
                <User size={20} className={cn("text-white group-hover:text-primary-cyan", currentScreen === 'admin-panel' && "text-primary-cyan")} />
             </div>
             <div 
               onClick={() => supabase.auth.signOut()}
               className="w-10 h-10 border border-white/20 flex items-center justify-center p-2 group cursor-pointer hover:border-red-500 transition-colors"
               title="Cerrar Sesión"
             >
                <LogOut size={20} className="text-white group-hover:text-red-500" />
             </div>
           </div>
        </div>
        
        {/* Mobile Profile Only */}
        <div className="lg:hidden flex items-center gap-2">
           <div onClick={() => role === 'admin' && onNavigate('admin-panel')} className="w-9 h-9 border border-white/20 flex items-center justify-center p-2">
              <User size={18} className="text-white" />
           </div>
           <div onClick={() => supabase.auth.signOut()} className="w-9 h-9 border border-white/20 flex items-center justify-center p-2 text-red-500">
              <LogOut size={18} />
           </div>
        </div>
      </header>

      <main className="flex-grow pt-[80px] pb-20 sm:pb-28">
        {children}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 sm:h-24 bg-black border-t-2 border-primary-cyan/10 flex justify-around items-center px-2 sm:px-4 overflow-x-auto lg:overflow-visible scrollbar-none">
        <NavButton 
          active={currentScreen === 'home'} 
          icon={<Target className="w-5 h-5 sm:w-6 sm:h-6" />} 
          label="INICIO" 
          onClick={() => onNavigate('home')} 
        />
        {hasPlanning && (
          <NavButton 
            active={currentScreen === 'protocol-detail'} 
            icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6" />} 
            label="PLAN" 
            onClick={() => onNavigate('protocol-detail')} 
          />
        )}
        <NavButton 
          active={currentScreen === 'analytics'} 
          icon={<Dumbbell className="w-5 h-5 sm:w-6 sm:h-6" />} 
          label="RECORDS" 
          onClick={() => onNavigate('analytics')} 
        />
        <NavButton 
          active={currentScreen.includes('control') || currentScreen.includes('timer')} 
          icon={<Timer className="w-5 h-5 sm:w-6 sm:h-6" />} 
          label="CONTROL" 
          onClick={() => onNavigate('control')} 
        />
        
        {/* Role Specific Nav Items */}
        {(role === 'coach' || role === 'admin') && (
          <>
            <NavButton 
              active={currentScreen === 'planner-editor'} 
              icon={<Edit3 className="w-5 h-5 sm:w-6 sm:h-6" />} 
              label="PLANNER" 
              onClick={() => onNavigate('planner-editor')} 
            />
            <NavButton 
              active={currentScreen === 'athletes'} 
              icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />} 
              label="ATHLETES" 
              onClick={() => onNavigate('athletes')} 
            />
          </>
        )}

        {role === 'admin' && (
          <NavButton 
            active={currentScreen === 'admin-panel'} 
            icon={<Settings className="w-5 h-5 sm:w-6 sm:h-6" />} 
            label="ADMIN" 
            onClick={() => onNavigate('admin-panel')} 
          />
        )}
        
        <NavButton 
          active={currentScreen === 'archive'} 
          icon={<History className="w-5 h-5 sm:w-6 sm:h-6" />} 
          label="ARCHIVE" 
          onClick={() => onNavigate('archive')} 
        />
      </nav>
    </div>
  );
}

interface NavButtonProps {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

function NavButton({ active, icon, label, onClick }: NavButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center pt-1 sm:pt-2 transition-all duration-300 w-12 sm:w-20 md:w-24 gap-1 sm:gap-1.5 shrink-0 select-none",
        active 
          ? "text-primary-cyan opacity-100" 
          : "text-white/40 hover:text-white"
      )}
    >
      <div className={cn(
        "transition-colors",
        active ? "text-primary-cyan" : ""
      )}>
        {icon}
      </div>
      <span className="font-headline font-black text-[7px] sm:text-[9px] tracking-[0.05em] sm:tracking-[0.2em] uppercase truncate max-w-full text-center">{label}</span>
    </button>
  );
}
