import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for data operations
export const saveUserData = async (userData: any) => {
  try {
    // Log the data being sent to help debug
    console.log('Saving user data:', {
      id: userData.id,
      name: userData.name,
      age: userData.age
    });
    
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

    if (error) {
      // Enhanced error logging with more detailed information
      console.error('Supabase error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    return data;
  } catch (error: any) {
    // Capture and format error information for better diagnostics
    const errorInfo = {
      message: error?.message || 'Unknown error',
      name: error?.name,
      stack: error?.stack?.split('\n')[0],
      cause: error?.cause
    };
    
    console.error('Error saving user data:', errorInfo);
    throw error;
  }
};

export const saveGameMetrics = async (userId: string, gameData: any) => {
  try {
    // Log the data being sent to help debug
    console.log('Saving game metrics:', {
      user_id: userId,
      game_name: gameData.name,
      metrics: gameData.metrics,
      is_skipped: gameData.is_skipped || false
    });
    
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

    if (error) {
      // Enhanced error logging with more detailed information
      console.error('Supabase error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    return data;
  } catch (error: any) {
    // Capture and format error information for better diagnostics
    const errorInfo = {
      message: error?.message || 'Unknown error',
      name: error?.name,
      stack: error?.stack,
      cause: error?.cause,
      // Handle potential circular references in error objects
      details: typeof error === 'object' ? JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error))) : error
    };
    
    console.error('Error saving game metrics:', errorInfo);
    
    // Also log raw error for development purposes
    console.error('Raw error object:', error);
    
    throw error;
  }
};

export const saveUserReport = async (userId: string, reportData: any) => {
  try {
    // Log the data being sent to help debug
    console.log('Saving user report:', {
      user_id: userId,
      report_id: reportData.id,
      overall_score: reportData.overallScore
    });
    
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
        learning_styles: reportData.learningStyles,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      // Enhanced error logging with more detailed information
      console.error('Supabase error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    return data;
  } catch (error: any) {
    // Capture and format error information for better diagnostics
    const errorInfo = {
      message: error?.message || 'Unknown error',
      name: error?.name,
      stack: error?.stack?.split('\n')[0],
      cause: error?.cause
    };
    
    console.error('Error saving user report:', errorInfo);
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