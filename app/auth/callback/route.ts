import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { saveUserData, getUserData } from '@/lib'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // If no code is present, redirect to home page
  if (!code) {
    return NextResponse.redirect(new URL('/', requestUrl.origin))
  }

  // Create a Supabase client configured for the request
  const supabase = createRouteHandlerClient({ cookies })
  
  // Exchange the code for a session
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  
  if (error) {
    console.error('Error during OAuth code exchange:', error)
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent('Authentication failed')}`, requestUrl.origin)
    )
  }

  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('No session found after authentication')
    }

    // Get user data from the session
    const { user } = session
    
    // Check if this is an existing user
    console.log('Checking if user already exists in database:', user.id)
    const existingUserData = await getUserData(user.id)
    
    // If user exists in database, use that data instead of requiring form data
    if (existingUserData && existingUserData.user) {
      console.log('User exists in database, using existing data')
      
      const userData = {
        id: user.id,
        name: existingUserData.user.name,
        age: existingUserData.user.age,
        education: existingUserData.user.education,
        difficulty: existingUserData.user.difficulty,
        email: user.email,
        google_id: user.id,
        avatar_url: user.user_metadata?.avatar_url || existingUserData.user.avatar_url
      }
      
      console.log('Found existing user:', userData.name)
      
      // Redirect to success page with existing user data
      return NextResponse.redirect(
        new URL(`/auth/success?userId=${encodeURIComponent(user.id)}&userData=${encodeURIComponent(JSON.stringify({
          ...userData,
          gameIndex: 0,
          metrics: existingUserData.gameMetrics || {},
          startTime: new Date().toISOString(),
        }))}`, requestUrl.origin)
      )
    }
    
    // For new users, try to extract form data from the form_state parameter
    const formStateParam = requestUrl.searchParams.get('form_state')
    let formData = null
    
    if (formStateParam) {
      try {
        // Base64 decode and parse the form state
        const decodedState = atob(formStateParam)
        formData = JSON.parse(decodedState)
      } catch (e) {
        console.error('Error parsing form_state parameter:', e)
      }
    }
    
    // If no form data from form_state, try the state parameter as fallback
    if (!formData) {
      const stateParam = requestUrl.searchParams.get('state')
      if (stateParam) {
        try {
          const state = JSON.parse(decodeURIComponent(stateParam))
          formData = state.formData
        } catch (e) {
          console.error('Error parsing state parameter:', e)
        }
      }
    }
    
    // We no longer require form data in the URL since it's stored in localStorage
    // before Google authentication, but we'll keep this for backwards compatibility
    
    // Redirect to the success page, which will handle the temp_user_data from localStorage
    return NextResponse.redirect(
      new URL(`/auth/success?userId=${encodeURIComponent(user.id)}`, requestUrl.origin)
    )
  } catch (error) {
    console.error('Error in OAuth callback processing:', error)
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent('Failed to process authentication')}`, requestUrl.origin)
    )
  }
} 