/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout } from './components/Layout';
import { Dashboard } from './screens/Dashboard';
import { Timers } from './screens/Timers';
import { TimerActive } from './screens/TimerActive';
import { TimerConfig } from './screens/TimerConfig';
import { PRs } from './screens/PRs';
import { Planner } from './screens/Planner';
import { ProtocolDetail } from './screens/ProtocolDetail';
import { PlannerEditor } from './screens/PlannerEditor';
import { AthleteManagement } from './screens/AthleteManagement';
import { AdminPanel } from './screens/AdminPanel';
import { AuthScreen } from './screens/AuthScreen';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

export type UserRole = 'athlete' | 'coach' | 'admin';
export type Screen = 'home' | 'analytics' | 'archive' | 'control' | 'timer-active' | 'timer-config' | 'protocol-detail' | 'planner-editor' | 'athletes' | 'admin-panel';

export interface PRRecord {
  id: string;
  exercise: string;
  weight: number;
  date: string;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  
  // Persist screen to avoid resetting to 'home' when alt-tabbing or HMR triggers
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    return (sessionStorage.getItem('currentScreen') as Screen) || 'home';
  });

  const [role, setRole] = useState<UserRole>('athlete');
  const [dbRole, setDbRole] = useState<UserRole>('athlete');
  const [programId, setProgramId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [prs, setPrs] = useState<PRRecord[]>([]);

  useEffect(() => {
    sessionStorage.setItem('currentScreen', currentScreen);
  }, [currentScreen]);

  const fetchProfile = async (userId: string, user: any) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data && !error) {
      const userRole = data.role as UserRole || 'athlete';
      setRole(userRole);
      setDbRole(userRole);
      setProgramId(data.program_id || null);
      setUserName(data.full_name || user.user_metadata?.full_name || 'USUARIO');
    } else if (user.email === 'astudillajuansimon@hotmail.com.ar') {
      setRole('admin');
      setDbRole('admin');
      setProgramId(null);
      setUserName(user.user_metadata?.full_name || 'JUAN SIMON');
    } else {
      const userRole = (user.user_metadata?.role as UserRole) || 'athlete';
      setRole(userRole);
      setDbRole(userRole);
      setProgramId(null);
      setUserName(user.user_metadata?.full_name || 'USUARIO');
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id, session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id, session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const addPR = (pr: Omit<PRRecord, 'id'>) => {
    const newPR = { ...pr, id: Math.random().toString(36).substr(2, 9) };
    setPrs(prev => [newPR, ...prev]);
  };

  if (!session) {
    return <AuthScreen onAuthSuccess={() => setCurrentScreen('home')} />;
  }

  const hasPlanning = role === 'coach' || role === 'admin' || !!programId;

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Dashboard onNavigate={setCurrentScreen} role={role} userName={userName} hasPlanning={hasPlanning} />;
      case 'control':
        return <Timers onNavigate={setCurrentScreen} />;
      case 'timer-active':
        return <TimerActive onNavigate={setCurrentScreen} />;
      case 'timer-config':
        return <TimerConfig onNavigate={setCurrentScreen} />;
      case 'analytics':
        return <PRs onNavigate={setCurrentScreen} prs={prs} onAddPR={addPR} />;
      case 'archive':
        return <Planner onNavigate={setCurrentScreen} />;
      case 'planner-editor':
        return <PlannerEditor onNavigate={setCurrentScreen} dbRole={dbRole} programId={programId} />;
      case 'athletes':
        return <AthleteManagement onNavigate={setCurrentScreen} dbRole={dbRole} programId={programId} />;
      case 'protocol-detail':
        return <ProtocolDetail onNavigate={setCurrentScreen} prs={prs} />;
      case 'admin-panel':
        return <AdminPanel onNavigate={setCurrentScreen} />;
      default:
        return <Dashboard onNavigate={setCurrentScreen} role={role} userName={userName} hasPlanning={hasPlanning} />;
    }
  };

  return (
    <Layout 
      currentScreen={currentScreen} 
      onNavigate={setCurrentScreen} 
      role={role} 
      onRoleChange={setRole}
      dbRole={dbRole}
      hasPlanning={hasPlanning}
    >
      <AnimatePresence mode="wait">
        <motion.div
           key={currentScreen + role}
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 1.02 }}
           transition={{ duration: 0.2, ease: "easeOut" }}
           className="min-h-screen"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
