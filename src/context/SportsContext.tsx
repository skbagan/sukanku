import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppData, Athlete, Event, ScheduleItem, ResultLog, House, AppConfig, PointsConfig, ExternalPoints } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface SportsContextType {
  data: AppData;
  updateData: (newData: AppData) => Promise<void>;
  resetData: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const getDefaultData = (): AppData => ({
  config: {
    schoolName: 'Sukan Sekolah 2026',
    year: '2026',
    enableEventLimit: false,
    maxInd: 3,
    maxTeam: 2,
    championConfig: {
      main: { cats: ['A', 'L18', 'P18'], years: ['5', '6'], mode: 'OR' },
      hope: { cats: ['B', 'L15', 'P15'], years: ['3', '4'], mode: 'AND' }
    }
  },
  houses: [
    { id: 'Merah', name: 'Rumah Merah', active: true },
    { id: 'Biru', name: 'Rumah Biru', active: true },
    { id: 'Kuning', name: 'Rumah Kuning', active: true },
    { id: 'Hijau', name: 'Rumah Hijau', active: true }
  ],
  athletes: [],
  events: [],
  scheduleItems: [],
  resultsLog: [],
  pointsConfig: { gold: 7, silver: 5, bronze: 3, fourth: 1 },
  externalPoints: {
    merentasDesa: { enabled: false, scores: { 'Merah': 0, 'Biru': 0, 'Kuning': 0, 'Hijau': 0 } },
    sukantara: { enabled: false, scores: { 'Merah': 0, 'Biru': 0, 'Kuning': 0, 'Hijau': 0 } }
  }
});

const SportsContext = createContext<SportsContextType | undefined>(undefined);

export const SportsProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<AppData>(getDefaultData());
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (isSupabaseConfigured()) {
        try {
          const { data: remoteData, error } = await supabase
            .from('app_data')
            .select('data')
            .single();
          
          if (remoteData && remoteData.data) {
            setData(remoteData.data);
          } else if (error && error.code !== 'PGRST116') {
             console.error("Supabase load error:", error);
          }
        } catch (e) {
          console.error("Supabase connection failed:", e);
        }
      } else {
        const localData = localStorage.getItem('sukanData');
        if (localData) {
          try {
            setData(JSON.parse(localData));
          } catch (e) {
            console.error("Local storage parse error", e);
          }
        }
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const updateData = async (newData: AppData) => {
    setData(newData);
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('app_data')
          .upsert({ id: 1, data: newData });
        
        if (error) throw error;
      } catch (e) {
        console.error("Supabase save error:", e);
        localStorage.setItem('sukanData', JSON.stringify(newData));
      }
    } else {
      localStorage.setItem('sukanData', JSON.stringify(newData));
    }
  };

  const resetData = async () => {
    const newData = getDefaultData();
    await updateData(newData);
  };

  const login = (password: string) => {
    if (password === 'admin123') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
  };

  return (
    <SportsContext.Provider value={{ data, updateData, resetData, loading, isAdmin, login, logout }}>
      {children}
    </SportsContext.Provider>
  );
};

export const useSports = () => {
  const context = useContext(SportsContext);
  if (context === undefined) {
    throw new Error('useSports must be used within a SportsProvider');
  }
  return context;
};
