'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  saveUserData,
  saveGameMetrics,
  saveUserReport,
  getUserData
} from '@/lib';

// Define the types
export type UserData = {
  id?: string;
  name: string;
  age: number;
  education?: string;
  difficulty: string;
};

export type GameMetrics = {
  name: string;
  metrics: {
    score: number;
    accuracy: number;
    totalTime: number;
    [key: string]: any;
  };
  isSkipped?: boolean;
};

// Define the context shape
type SupabaseContextType = {
  userId: string | null;
  isLoading: boolean;
  error: Error | null;
  saveUser: (userData: UserData) => Promise<any>;
  saveGameResult: (gameData: GameMetrics) => Promise<any>;
  saveCognitiveReport: (reportData: any) => Promise<any>;
  getUserProfile: (userIdParam?: string) => Promise<any>;
  clearUserData: () => void;
};

// Create the context with a default value
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

// Provider component
export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize: Check if we have a userId in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
      }
    }
  }, []);

  // Save user profile and initialize session
  const saveUser = async (userData: UserData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate ID if not provided
      const userWithId = {
        ...userData,
        id: userData.id || crypto.randomUUID()
      };
      
      // Save to Supabase
      const savedUser = await saveUserData(userWithId);
      
      // Store ID for future use
      if (savedUser?.[0]?.id) {
        localStorage.setItem('userId', savedUser[0].id);
        setUserId(savedUser[0].id);
      }
      
      return savedUser?.[0];
    } catch (err: any) {
      setError(err);
      console.error('Error saving user data:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Save game metrics
  const saveGameResult = async (gameData: GameMetrics) => {
    if (!userId) {
      setError(new Error('No active user session. Please create a profile first.'));
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Save to Supabase
      const savedMetrics = await saveGameMetrics(userId, gameData);
      
      // Also update in localStorage for backward compatibility
      const existingMetrics = JSON.parse(localStorage.getItem('gameMetrics') || '[]');
      const updatedMetrics = [...existingMetrics, gameData];
      localStorage.setItem('gameMetrics', JSON.stringify(updatedMetrics));
      
      return savedMetrics?.[0];
    } catch (err: any) {
      setError(err);
      console.error('Error saving game metrics:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Save cognitive report
  const saveCognitiveReport = async (reportData: any) => {
    if (!userId) {
      setError(new Error('No active user session. Please create a profile first.'));
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Save to Supabase
      const savedReport = await saveUserReport(userId, reportData);
      
      // Also update in localStorage for backward compatibility
      localStorage.setItem('cognitiveReport', JSON.stringify(reportData));
      
      return savedReport?.[0];
    } catch (err: any) {
      setError(err);
      console.error('Error saving cognitive report:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get all user data including game metrics and reports
  const getUserProfile = async (userIdParam?: string) => {
    const id = userIdParam || userId;
    
    if (!id) {
      setError(new Error('No user ID provided'));
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = await getUserData(id);
      return userData;
    } catch (err: any) {
      setError(err);
      console.error('Error getting user data:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all user data (for logout)
  const clearUserData = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('gameMetrics');
    localStorage.removeItem('cognitiveReport');
    localStorage.removeItem('userProfile');
    setUserId(null);
  };
  
  const value = {
    userId,
    isLoading,
    error,
    saveUser,
    saveGameResult,
    saveCognitiveReport,
    getUserProfile,
    clearUserData
  };
  
  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

// Custom hook to use the context
export function useSupabase() {
  const context = useContext(SupabaseContext);
  
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  
  return context;
} 