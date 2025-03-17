// Re-export types
export type {
  UserData, 
  DomainAnalysis, 
  LearningStyleAnalysis, 
  DashboardContent, 
  CognitiveReport 
} from './report-types';

// Re-export functions
export { generateReport } from './report-generator';
export { processDetailedMetrics } from './metrics-processor';
export { formatDate, getAgeGroup, calculateAge } from './date-utils';

// Re-export from supabase modules
export {
  supabase,
  saveUserData,
  saveGameMetrics,
  saveUserReport,
  getUserData,
  getAllUserReports
} from './supabase-client'; 