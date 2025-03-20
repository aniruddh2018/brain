import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { getUserData } from './supabase-fixed'

/**
 * Check if a user is logged in by looking for userId in localStorage
 * @returns {boolean} True if user is logged in
 */
export function isUserLoggedIn(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  
  const userId = localStorage.getItem('userId')
  return !!userId
}

/**
 * Get the current user's ID from localStorage
 * @returns {string|null} The user ID or null if not logged in
 */
export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  
  return localStorage.getItem('userId')
}

/**
 * Get the current user's data from localStorage
 * @returns {any|null} The user data object or null if not found
 */
export function getCurrentUserData(): any | null {
  if (typeof window === 'undefined') {
    return null
  }
  
  const userData = localStorage.getItem('userData')
  if (!userData) {
    return null
  }
  
  try {
    return JSON.parse(userData)
  } catch (e) {
    console.error('Error parsing user data from localStorage:', e)
    return null
  }
}

/**
 * Refresh user data from the database and update localStorage
 * @param {string} userId - The user ID to refresh data for
 * @returns {Promise<any>} The updated user data
 */
export async function refreshUserData(userId: string): Promise<any> {
  try {
    // Get fresh data from the database
    const dbData = await getUserData(userId)
    
    if (dbData && dbData.user) {
      const updatedUserData = {
        ...dbData.user,
        metrics: dbData.gameMetrics || {}
      }
      
      // Update localStorage
      localStorage.setItem('userData', JSON.stringify(updatedUserData))
      return updatedUserData
    }
    
    return null
  } catch (error) {
    console.error('Error refreshing user data:', error)
    throw error
  }
}

/**
 * Log the user out and redirect to home page
 * @param {Function} redirectFn - The function to use for redirection (like router.push)
 */
export async function logoutUser(redirectFn: (path: string) => void): Promise<void> {
  try {
    // Sign out from Supabase
    const supabase = createClientComponentClient()
    await supabase.auth.signOut()
    
    // Clear localStorage
    localStorage.removeItem('userId')
    localStorage.removeItem('userData')
    
    // Redirect to home
    redirectFn('/')
  } catch (error) {
    console.error('Error logging out:', error)
    // Still clear localStorage and redirect even if there's an error with Supabase
    localStorage.removeItem('userId')
    localStorage.removeItem('userData')
    redirectFn('/')
  }
}

/**
 * Redirect to login if user is not authenticated
 * @param {Function} redirectFn - The function to use for redirection (like router.push)
 * @returns {boolean} True if user is logged in, false if redirected
 */
export function requireAuth(redirectFn: (path: string) => void): boolean {
  if (!isUserLoggedIn()) {
    redirectFn('/?error=' + encodeURIComponent('Please log in to access this page'))
    return false
  }
  
  return true
} 