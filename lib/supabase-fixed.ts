import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// More detailed logging of Supabase initialization
console.log('Supabase initialization:', { 
  url: supabaseUrl ? `${supabaseUrl.substring(0, 12)}...` : 'MISSING', 
  key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 5)}...` : 'MISSING',
  environment: typeof window !== 'undefined' ? 'client' : 'server'
});

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Test the Supabase connection and log the result
if (typeof window !== 'undefined') {
  // Only run this in browser environments
  (async () => {
    try {
      const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
      if (error) {
        console.error('Supabase connection test failed:', error.message);
      } else {
        console.log('Supabase connection test successful!');
      }
    } catch (e) {
      console.error('Error testing Supabase connection:', e);
    }
  })();
}

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
    const metricsObject = gameData.metrics || {};
    
    // Create a sanitized version of the metrics to avoid circular references
    const cleanMetrics = JSON.parse(JSON.stringify(metricsObject));
    
    // Create the insert object with properly formatted data
    const insertData = {
      user_id: userId,
      game_name: gameData.name,
      metrics: cleanMetrics,
      completed_at: new Date().toISOString(),
      is_skipped: gameData.is_skipped || false,
    };
    
    console.log('Formatted insert data:', insertData);
    
    const { data, error } = await supabase
      .from('game_metrics')
      .insert(insertData)
      .select();

    if (error) {
      console.error('Supabase error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // Try a direct fetch to verify connectivity
      try {
        const testResponse = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
        console.log('Supabase connectivity test:', {
          status: testResponse.status,
          ok: testResponse.ok
        });
      } catch (connErr) {
        console.error('Connection test failed:', connErr);
      }
      
      throw error;
    }
    
    console.log('Successfully saved game metrics with response:', data);
    return data;
  } catch (error: any) {
    // Better error handling with detailed diagnostics
    let errorMessage = 'Unknown error';
    let errorDetails = {};
    
    try {
      errorMessage = error?.message || 'Unknown error';
      errorDetails = {
        name: error?.name,
        code: error?.code,
        // Safe stringify of just the first line of stack trace
        stackTrace: error?.stack?.toString().split('\n')[0] || 'No stack trace'
      };
    } catch (e) {
      console.error('Error while formatting error details:', e);
    }
    
    console.error('Error saving game metrics:', {
      message: errorMessage,
      details: errorDetails
    });
    
    throw new Error(`Failed to save game metrics: ${errorMessage}`);
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
        learning_styles: reportData.learningStyle,
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
  // Initialize with empty array to ensure consistent return type
  let userData: any[] = [];
  
  try {
    // Check if Supabase client is properly initialized
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase configuration is missing:', { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!supabaseAnonKey 
      });
      return []; // Return empty array instead of throwing
    }

    // Log that we're starting the query
    console.log('Fetching all user reports...');
    
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        cognitive_reports(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      // Don't throw, just return empty array
      return [];
    }
    
    // Check if data is present and valid
    if (!data || !Array.isArray(data)) {
      console.error('Invalid data structure returned from Supabase:', data);
      return [];
    }
    
    // Log success and data length
    console.log(`Successfully fetched data for ${data.length} users`);
    
    // Process the data before returning
    userData = data.map(user => {
      // Extract cognitive reports
      const reports = Array.isArray(user.cognitive_reports) 
        ? user.cognitive_reports 
        : [];
      
      // Log reports per user to debug
      console.log(`User ${user.id} has ${reports.length} reports`);
      
      return {
        ...user,
        cognitive_reports: reports,
      };
    });
    
    return userData;
  } catch (error) {
    // Capture and log any unexpected errors
    console.error('Unexpected error getting all user reports:', error);
    // Return empty array instead of throwing to avoid crashing the UI
    return [];
  }
};

// Enhanced getAllCognitiveReports function
export const getAllCognitiveReports = async () => {
  try {
    // Check if Supabase client is properly initialized
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase configuration is missing:', { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!supabaseAnonKey 
      });
      return []; 
    }

    console.log(`Directly fetching cognitive reports using URL: ${supabaseUrl.substring(0, 12)}...`);
    
    // Additional safety check for Supabase instance
    if (!supabase || typeof supabase.from !== 'function') {
      console.error('Supabase client is improperly initialized');
      return [];
    }
    
    const { data, error } = await supabase
      .from('cognitive_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cognitive reports:', {
        code: error.code,
        message: error.message,
        details: error.details
      });
      return [];
    }
    
    if (!data) {
      console.log('No cognitive reports data returned');
      return [];
    }
    
    console.log(`Successfully fetched ${data.length} cognitive reports`);
    return data;
  } catch (error) {
    console.error('Unexpected error getting cognitive reports:', error);
    // Provide more details about the error
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}, message: ${error.message}`);
      console.error(`Stack trace: ${error.stack}`);
    }
    return [];
  }
};

// Add a new utility function to verify connection
export const verifySupabaseConnection = async () => {
  try {
    console.log('Verifying Supabase connection...');
    
    // Check environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return {
        success: false,
        error: 'Missing environment variables'
      };
    }
    
    // Test a simple query
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
      
    if (error) {
      console.error('Supabase connection test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    console.log('Supabase connection verified successfully');
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error verifying Supabase connection:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Add a new function to get reports for a specific user
export const getUserCognitiveReports = async (userId: string) => {
  try {
    // Check if Supabase client is properly initialized
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase configuration is missing when getting user reports', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey
      });
      return { success: false, error: 'Missing Supabase configuration', data: [] };
    }

    console.log(`Fetching cognitive reports for user ID: ${userId}`);
    
    if (!userId) {
      console.error('No user ID provided for getUserCognitiveReports');
      return { success: false, error: 'No user ID provided', data: [] };
    }
    
    // Additional safety check for Supabase instance
    if (!supabase || typeof supabase.from !== 'function') {
      console.error('Supabase client is improperly initialized in getUserCognitiveReports');
      return { success: false, error: 'Supabase client not initialized', data: [] };
    }
    
    // Log more details about the Supabase client
    console.log('Supabase client status:', {
      hasFrom: typeof supabase.from === 'function',
      hasAuth: typeof supabase.auth === 'object',
      url: supabaseUrl ? `${supabaseUrl.substring(0, 12)}...` : 'MISSING'
    });
    
    // Direct query for this user's reports
    console.log('Executing query for cognitive_reports table...');
    const { data, error, status, statusText } = await supabase
      .from('cognitive_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Log response details
    console.log('Query response status:', status, statusText);
    
    if (error) {
      console.error('Error fetching user\'s cognitive reports:', {
        code: error.code,
        message: error.message,
        details: error.details,
        status,
        statusText
      });
      return { success: false, error: error.message, data: [], status, details: error.details };
    }
    
    if (!data) {
      console.log(`No data returned for user ${userId} (data is null or undefined)`);
      return { success: true, data: [] };
    }
    
    if (!Array.isArray(data)) {
      console.error(`Unexpected data format for user ${userId}:`, typeof data);
      return { success: false, error: 'Invalid data format', data: [] };
    }
    
    if (data.length === 0) {
      console.log(`No cognitive reports found for user ${userId} (empty array)`);
    } else {
      console.log(`Successfully fetched ${data.length} cognitive reports for user ${userId}`);
      console.log('First report:', {
        id: data[0]?.id,
        user_id: data[0]?.user_id,
        created_at: data[0]?.created_at
      });
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error getting user cognitive reports:', error);
    // More detailed error logging
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}, message: ${error.message}`);
      console.error(`Stack trace: ${error.stack}`);
      return { 
        success: false, 
        error: `${error.name}: ${error.message}`,
        data: [],
        stack: error.stack
      };
    }
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    };
  }
}; 