import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with the database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for data operations
export async function saveUserData(userData: any) {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: userData.id || crypto.randomUUID(),
      name: userData.name,
      age: userData.age,
      education: userData.education,
      difficulty: userData.difficulty,
      created_at: userData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving user data:', error);
    throw error;
  }

  return data;
}

export async function saveGameMetrics(userId: string, gameData: any) {
  const { data, error } = await supabase
    .from('game_metrics')
    .insert({
      user_id: userId,
      game_name: gameData.gameName,
      metrics: gameData.metrics,
      completed_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving game metrics:', error);
    throw error;
  }

  return data;
}

export async function saveUserReport(userId: string, reportData: any) {
  const { data, error } = await supabase
    .from('cognitive_reports')
    .upsert({
      user_id: userId,
      overall_score: reportData.overallScore,
      summary: reportData.summary,
      strengths: reportData.strengths,
      weaknesses: reportData.weaknesses,
      domain_analyses: reportData.domainAnalyses,
      recommendations: reportData.recommendations,
      relationship_insights: reportData.relationshipInsights,
      learning_styles: reportData.learningStyles,
      created_at: reportData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving user report:', error);
    throw error;
  }

  return data;
}

export async function getUserData(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      game_metrics(*),
      cognitive_reports(*)
    `)
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }

  return data;
}

export async function getAllUserReports() {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      cognitive_reports(*)
    `);

  if (error) {
    console.error('Error fetching all user reports:', error);
    throw error;
  }

  return data;
} 