import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for data operations
export const saveUserData = async (userData: any) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userData.id || crypto.randomUUID(),
        name: userData.name,
        age: userData.age,
        education: userData.education || '',
        difficulty: userData.difficulty,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

export const saveGameMetrics = async (userId: string, gameData: any) => {
  try {
    const { data, error } = await supabase
      .from('game_metrics')
      .insert({
        user_id: userId,
        game_name: gameData.name,
        metrics: gameData.metrics,
        completed_at: new Date().toISOString(),
        is_skipped: gameData.is_skipped || false,
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving game metrics:', error);
    throw error;
  }
};

export const saveUserReport = async (userId: string, reportData: any) => {
  try {
    const { data, error } = await supabase
      .from('cognitive_reports')
      .upsert({
        id: reportData.id || crypto.randomUUID(),
        user_id: userId,
        overall_score: reportData.overallScore,
        summary: reportData.summary,
        strengths: reportData.strengths,
        weaknesses: reportData.weaknesses,
        domain_analyses: reportData.domainAnalyses,
        recommendations: reportData.recommendations,
        relationship_insights: reportData.relationshipInsights,
        learning_styles: reportData.learningStyle,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving user report:', error);
    throw error;
  }
};

export const getUserData = async (userId: string) => {
  try {
    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Get game metrics
    const { data: gameMetrics, error: gameError } = await supabase
      .from('game_metrics')
      .select('*')
      .eq('user_id', userId);

    if (gameError) throw gameError;

    // Get cognitive report
    const { data: cognitiveReport, error: reportError } = await supabase
      .from('cognitive_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (reportError && reportError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" error, which is fine
      throw reportError;
    }

    return {
      user: userData,
      gameMetrics,
      cognitiveReport,
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

export const getAllUserReports = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        cognitive_reports(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting all user reports:', error);
    throw error;
  }
}; 