'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { saveUserData, getUserData } from '@/lib'

export default function AuthSuccess() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Authenticating...')
  const [error, setError] = useState('')

  useEffect(() => {
    const userId = searchParams.get('userId')

    if (!userId) {
      setError('Missing user ID in URL parameters')
      setTimeout(() => router.push('/'), 2000)
      return
    }

    async function processUserData() {
      try {
        // First check if user exists in our database
        const existingUserData = await getUserData(userId as string)
        
        if (existingUserData && existingUserData.user) {
          // User exists, just update localStorage and redirect
          setStatus('User authenticated! Redirecting...')
          const userData = {
            ...existingUserData.user,
            metrics: existingUserData.gameMetrics || {},
            gameIndex: 0
          }
          
          localStorage.setItem('userId', userId as string)
          localStorage.setItem('userData', JSON.stringify(userData))
          
          // Remove temporary data if it exists
          localStorage.removeItem('temp_user_data')
          
          setTimeout(() => router.push('/games'), 1000)
          return
        }
        
        // New user - check for temporary form data
        setStatus('Setting up your account...')
        const tempUserData = localStorage.getItem('temp_user_data')
        
        if (!tempUserData) {
          // No form data found, redirect back to signup
          setError('Please complete the registration form')
          setTimeout(() => router.push('/'), 2000)
          return
        }
        
        // Parse the form data and combine with Google account info
        const formData = JSON.parse(tempUserData)
        
        // Save user to database
        const userToSave = {
          id: userId as string,
          ...formData,
          created_at: new Date().toISOString()
        }
        
        try {
          const savedUser = await saveUserData(userToSave)
          // Check if the response is an error by looking for common error properties
          if (savedUser && typeof savedUser === 'object' && ('error' in savedUser || 'code' in savedUser)) {
            throw new Error('Failed to save user data')
          }
        } catch (saveError) {
          console.error('Error saving user data:', saveError)
          throw new Error('Failed to save user data')
        }
        
        // Save to localStorage for app use
        const completeUserData = {
          ...userToSave,
          metrics: {},
          gameIndex: 0
        }
        
        localStorage.setItem('userId', userId as string)
        localStorage.setItem('userData', JSON.stringify(completeUserData))
        
        // Clean up temporary data
        localStorage.removeItem('temp_user_data')
        
        setStatus('Account created successfully! Redirecting...')
        setTimeout(() => router.push('/games'), 1000)
      } catch (error) {
        console.error('Error processing user data:', error)
        setError('Failed to set up your account. Please try again.')
        setTimeout(() => router.push('/'), 2000)
      }
    }

    processUserData()
  }, [router, searchParams])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800">{error || status}</h1>
        {!error && (
          <div className="flex justify-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        )}
        <p className="text-gray-600">
          {error 
            ? 'There was a problem with your sign-up process.'
            : 'Please wait while we set up your account.'}
        </p>
      </div>
    </div>
  )
} 