import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Initialize Supabase client with logging
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate credentials are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials - check your environment variables');
}

// Log credentials (masked for security)
console.log('Supabase Configuration:', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 8)}...` : 'Missing',
  key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 5)}...` : 'Missing'
});

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Test connection on initialization
(async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('Supabase connection successful');
    }
  } catch (err) {
    console.error('Error testing Supabase connection:', err);
  }
})();

// Helper functions with improved error handling
export const saveUserData = async (userData: any) => {
  try {
    if (!userData) {
      throw new Error('User data is required');
    }
    
    // Log the data being sent (excluding sensitive fields)
    console.log('Saving user data:', {
      id: userData.id || 'New user (ID will be generated)',
      name: userData.name,
      age: userData.age,
      difficulty: userData.difficulty
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
      console.error('Supabase user data error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Failed to save user data: ${error.message}`);
    }
    
    console.log('User data saved successfully:', data?.[0]?.id);
    return data;
  } catch (error: any) {
    console.error('Error in saveUserData:', {
      message: error?.message || 'Unknown error',
      name: error?.name,
      stack: error?.stack?.split('\n')[0]
    });
    
    // Re-throw with clear message
    throw new Error(`User data save failed: ${error?.message || 'Unknown error'}`);
  }
};

export const saveGameMetrics = async (userId: string, gameData: any) => {
  try {
    // Validate required fields
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    if (!gameData || !gameData.name) {
      throw new Error('Game data with name is required');
    }
    
    // Log the data being sent to help debug
    console.log('Saving game metrics:', {
      user_id: userId,
      game_name: gameData.name,
      metrics_structure: typeof gameData.metrics,
      is_skipped: gameData.is_skipped || false
    });
    
    // Ensure metrics is properly formatted as JSON
    let cleanMetrics;
    try {
      // Convert to and from JSON to remove circular references
      cleanMetrics = JSON.parse(JSON.stringify(gameData.metrics || {}));
    } catch (jsonError) {
      console.error('Error stringifying metrics:', jsonError);
      cleanMetrics = { error: 'Failed to stringify metrics', partial: String(gameData.metrics).substring(0, 100) };
    }
    
    // Create the insert object with properly formatted data
    const insertData = {
      user_id: userId,
      game_name: gameData.name,
      metrics: cleanMetrics,
      completed_at: new Date().toISOString(),
      is_skipped: gameData.is_skipped || false,
    };
    
    console.log('Formatted insert data keys:', Object.keys(insertData));
    
    const { data, error } = await supabase
      .from('game_metrics')
      .insert(insertData)
      .select();

    if (error) {
      console.error('Supabase game metrics error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Failed to save game metrics: ${error.message}`);
    }
    
    console.log('Game metrics saved successfully for game:', gameData.name);
    return data;
  } catch (error: any) {
    // Better error handling with detailed diagnostics
    console.error('Error in saveGameMetrics:', {
      message: error?.message || 'Unknown error',
      name: error?.name,
      stack: error?.stack?.split('\n')[0]
    });
    
    // Re-throw with clear message
    throw new Error(`Game metrics save failed: ${error?.message || 'Unknown error'}`);
  }
};

export const saveUserReport = async (userId: string, reportData: any) => {
  try {
    // Validate input
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    if (!reportData) {
      throw new Error('Report data is required');
    }
    
    // Log the report being saved (summary only)
    console.log('Saving user report:', {
      user_id: userId,
      report_id: reportData.id || 'New report (ID will be generated)',
      overall_score: reportData.overallScore,
      summary_length: reportData.summary?.length || 0
    });
    
    // Format report data to ensure it can be properly serialized
    let cleanReportData;
    try {
      const reportToSave = {
        id: reportData.id || crypto.randomUUID(),
        user_id: userId,
        overall_score: reportData.overallScore || 0,
        summary: reportData.summary || '',
        strengths: JSON.parse(JSON.stringify(reportData.strengths || [])),
        weaknesses: JSON.parse(JSON.stringify(reportData.weaknesses || [])),
        domain_analyses: JSON.parse(JSON.stringify(reportData.domainAnalyses || {})),
        recommendations: JSON.parse(JSON.stringify(reportData.recommendations || [])),
        relationship_insights: JSON.parse(JSON.stringify(reportData.relationshipInsights || [])),
        learning_styles: JSON.parse(JSON.stringify(reportData.learningStyles || {})),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      cleanReportData = reportToSave;
    } catch (jsonError) {
      console.error('Error processing report data:', jsonError);
      throw new Error('Failed to process report data for saving');
    }
    
    const { data, error } = await supabase
      .from('cognitive_reports')
      .upsert(cleanReportData)
      .select();

    if (error) {
      console.error('Supabase report error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Failed to save report: ${error.message}`);
    }
    
    console.log('User report saved successfully:', data?.[0]?.id);
    return data;
  } catch (error: any) {
    console.error('Error in saveUserReport:', {
      message: error?.message || 'Unknown error',
      name: error?.name,
      stack: error?.stack?.split('\n')[0]
    });
    
    // Re-throw with clear message
    throw new Error(`Report save failed: ${error?.message || 'Unknown error'}`);
  }
};

export const getUserData = async (userId: string) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    console.log('Fetching user data for ID:', userId);
    
    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', {
        code: userError.code,
        message: userError.message
      });
      throw new Error(`Failed to fetch user: ${userError.message}`);
    }

    // Get game metrics
    const { data: gameMetrics, error: gameError } = await supabase
      .from('game_metrics')
      .select('*')
      .eq('user_id', userId);

    if (gameError) {
      console.error('Error fetching game metrics:', {
        code: gameError.code,
        message: gameError.message
      });
      throw new Error(`Failed to fetch game metrics: ${gameError.message}`);
    }

    // Get cognitive report - note that no report is not an error
    const { data: cognitiveReport, error: reportError } = await supabase
      .from('cognitive_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (reportError && reportError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" error, which is fine
      console.error('Error fetching cognitive report:', {
        code: reportError.code,
        message: reportError.message
      });
      // Don't throw here, just continue with null report
    }

    console.log('User data retrieved successfully', {
      user: userData?.id,
      gameMetricsCount: gameMetrics?.length || 0,
      hasReport: !!cognitiveReport
    });
    
    return {
      user: userData,
      gameMetrics,
      cognitiveReport,
    };
  } catch (error: any) {
    console.error('Error in getUserData:', {
      message: error?.message || 'Unknown error',
      name: error?.name,
      stack: error?.stack?.split('\n')[0]
    });
    
    throw new Error(`User data retrieval failed: ${error?.message || 'Unknown error'}`);
  }
};

export const getAllUserReports = async () => {
  try {
    console.log('Fetching all user reports');
    
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        cognitive_reports(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all user reports:', {
        code: error.code,
        message: error.message
      });
      throw new Error(`Failed to fetch user reports: ${error.message}`);
    }

    console.log('Retrieved reports for users:', data?.length || 0);
    return data;
  } catch (error: any) {
    console.error('Error in getAllUserReports:', {
      message: error?.message || 'Unknown error',
      name: error?.name,
      stack: error?.stack?.split('\n')[0]
    });
    
    throw new Error(`User reports retrieval failed: ${error?.message || 'Unknown error'}`);
  }
}; 