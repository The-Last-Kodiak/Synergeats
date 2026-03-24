import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { type UserProfile, type DailyLog, type MealPlan } from '../types';

interface AppContextType {
  user: User | null;
  profile: UserProfile | null;
  todayLogs: DailyLog[];
  mealPlans: MealPlan[];
  loading: boolean;
  refreshProfile: () => Promise<void>;
  refreshTodayLogs: () => Promise<void>;
  refreshMealPlans: () => Promise<void>;
  setProfile: (p: UserProfile | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayLogs, setTodayLogs] = useState<DailyLog[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (user) {
      refreshProfile();
      refreshTodayLogs();
      refreshMealPlans();
    } else {
      setProfile(null);
      setTodayLogs([]);
      setMealPlans([]);
    }
  }, [user]);

  async function refreshProfile() {
    if (!user) return;
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    setProfile(data);
  }

  async function refreshTodayLogs() {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('daily_logs')
      .select('*, food:foods(*)')
      .eq('user_id', user.id)
      .eq('log_date', today);
    setTodayLogs(data || []);
  }

  async function refreshMealPlans() {
    if (!user) return;
    const { data } = await supabase
      .from('meal_plans')
      .select('*, items:meal_plan_items(*, food:foods(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    setMealPlans(data || []);
  }

  return (
    <AppContext.Provider value={{
      user,
      profile,
      todayLogs,
      mealPlans,
      loading,
      refreshProfile,
      refreshTodayLogs,
      refreshMealPlans,
      setProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
