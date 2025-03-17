/**
 * Date utility functions for formatting and working with dates
 */

/**
 * Format a date string or Date object into a localized string
 * @param dateInput Date string or Date object to format
 * @param locale Optional locale for formatting (defaults to 'en-US')
 * @returns Formatted date string
 */
export function formatDate(dateInput: string | Date, locale: string = 'en-US'): string {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Format the date 
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Get age group based on numeric age
 * @param age Age in years
 * @returns Age group classification
 */
export function getAgeGroup(age: number): string {
  if (age < 0) {
    return 'Invalid age';
  } else if (age < 13) {
    return 'Child';
  } else if (age < 18) {
    return 'Adolescent';
  } else if (age < 30) {
    return 'Young Adult';
  } else if (age < 50) {
    return 'Adult';
  } else if (age < 65) {
    return 'Mature Adult';
  } else {
    return 'Senior';
  }
}

/**
 * Calculate age from birthdate
 * @param birthdate Birthdate as string or Date object
 * @returns Age in years, or null if invalid
 */
export function calculateAge(birthdate: string | Date): number | null {
  try {
    const birthDate = typeof birthdate === 'string' ? new Date(birthdate) : birthdate;
    
    // Check if date is valid
    if (isNaN(birthDate.getTime())) {
      return null;
    }
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return null;
  }
} 