"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronRight, Brain, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { saveUserData } from "@/lib/supabase-fixed"
import { toast } from "sonner"

// Animated background component
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-blue-50 to-white"></div>
      
      {/* Animated circles */}
      <div className="absolute top-1/4 left-1/4 w-60 h-60 rounded-full bg-blue-200 opacity-20 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-300 opacity-20 blur-3xl animate-pulse delay-700"></div>
      <div className="absolute top-3/4 left-1/3 w-40 h-40 rounded-full bg-purple-200 opacity-20 blur-3xl animate-pulse delay-1000"></div>
      
      {/* Floating brain icons */}
      <div className="absolute top-20 right-[20%] text-indigo-300 opacity-30 animate-float-particle">
        <Brain size={40} />
      </div>
      <div className="absolute bottom-20 left-[15%] text-blue-300 opacity-30 animate-float-particle-reverse delay-700">
        <Brain size={30} />
      </div>
      <div className="absolute top-1/2 right-[10%] text-purple-300 opacity-30 animate-float-particle delay-300">
        <Brain size={35} />
      </div>
    </div>
  )
}

// Form step component
const FormStep = ({ 
  isActive, 
  children, 
  onBack,
  showBackButton = false
}: { 
  isActive: boolean, 
  children: React.ReactNode,
  onBack?: () => void,
  showBackButton?: boolean
}) => {
  if (!isActive) return null
  
  return (
    <div className="animate-fadeIn">
      {showBackButton && (
        <button 
          onClick={onBack} 
          className="mb-4 text-sm flex items-center text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span className="mr-1">←</span> Back
        </button>
      )}
      {children}
    </div>
  )
}

export default function UserForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    education: "elementary",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'welcome' | 'newUser' | 'returningUser'>('welcome')
  const [clickedFromHero, setClickedFromHero] = useState(false)

  // Refs for scrolling
  const welcomeSectionRef = useRef<HTMLDivElement>(null)
  const formSectionRef = useRef<HTMLDivElement>(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    // Show error toast if one was passed in the URL
    const error = searchParams.get("error")
    if (error) {
      toast.error(decodeURIComponent(error))
    }
  }, [searchParams])

  // Validate form
  useEffect(() => {
    const isNameValid = formData.name.trim().length >= 2
    const isAgeValid = /^\d+$/.test(formData.age) && parseInt(formData.age) > 0 && parseInt(formData.age) < 120
    const isValid = isNameValid && isAgeValid
    
    setIsFormValid(isValid)
  }, [formData])

  // Animation on scroll
  useEffect(() => {
    const handleScrollAnimation = () => {
      document.querySelectorAll('.animate-on-scroll').forEach((element) => {
        const rect = element.getBoundingClientRect()
        const isVisible = (rect.top <= window.innerHeight * 0.8)
        
        if (isVisible) {
          element.classList.add('animate-visible')
        }
      })
    }
    
    window.addEventListener('scroll', handleScrollAnimation)
    handleScrollAnimation() // Check on initial load
    
    return () => window.removeEventListener('scroll', handleScrollAnimation)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEducationChange = (value: string) => {
    setFormData((prev) => ({ ...prev, education: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid) {
      toast.error("Please fill out all required fields correctly")
      return
    }
    
    setIsSubmitting(true)

    try {
    let difficulty = "medium"
    const age = Number.parseInt(formData.age)

    if (age < 10) difficulty = "easy"
    else if (age >= 10 && age < 18) difficulty = "medium"
    else difficulty = "hard"

      const userData = {
        name: formData.name,
        age,
        education: formData.education,
        difficulty,
        id: crypto.randomUUID()
      }

      try {
        const savedUser = await saveUserData(userData)
        
        if (savedUser?.[0]?.id) {
          localStorage.setItem('userId', savedUser[0].id)
        }
      } catch (supabaseError) {
        console.error("Failed to save to Supabase, continuing with local storage:", supabaseError)
      }

    localStorage.setItem(
      "userData",
      JSON.stringify({
          ...userData,
        gameIndex: 0,
        metrics: {},
        startTime: new Date().toISOString(),
        })
    )

      // Navigate to games page
    router.push("/games")
    } catch (error) {
      console.error("Error saving user data:", error)
      toast.error("There was an error saving your profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    // Only allow Google login if form is valid
    if (!isFormValid) {
      toast.error("Please fill out all required fields first")
      return
    }

    setIsGoogleLoading(true)
    
    try {
      // Package form data to be sent in the state parameter
      const formState = {
        name: formData.name,
        age: formData.age,
        education: formData.education
      }
      
      // Create a base64 encoded state to pass in URL
      const encodedState = btoa(JSON.stringify(formState))
      
      // Start Google OAuth login process
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?form_state=${encodedState}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      
      if (error) {
        throw error
      }
    } catch (error) {
      console.error("Error with Google login:", error)
      toast.error("Google login failed. Please try again.")
      setIsGoogleLoading(false)
    }
  }

  const handleExistingUserLogin = async () => {
    setIsGoogleLoading(true)
    
    try {
      // Start Google OAuth login process without form data
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      
      if (error) {
        throw error
      }
    } catch (error) {
      console.error("Error with existing user Google login:", error)
      toast.error("Google login failed. Please try again.")
      setIsGoogleLoading(false)
    }
  }

  const scrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: "smooth" })
    setCurrentStep('welcome')
  }

  // Function to handle button clicks from hero section
  const handleButtonClick = (step: 'newUser' | 'returningUser') => {
    setCurrentStep(step)
    setClickedFromHero(true) // Track that user clicked from hero
    scrollToForm()
  }

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Hero Section */}
      <div 
        ref={welcomeSectionRef}
        className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-6 mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg flex items-center justify-center">
            <Brain className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Cognitive Profile</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            IQLEVAL provides a comprehensive assessment of your cognitive abilities through 
            interactive challenges designed by experts in cognitive science.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              onClick={() => handleButtonClick('newUser')}
              className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 overflow-hidden text-white rounded-full py-6 px-8 shadow-lg hover:shadow-xl transition-all"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="relative flex items-center justify-center text-lg">
                Create New Profile
                <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleButtonClick('returningUser')}
              className="rounded-full border-blue-500 text-blue-700 py-6 px-8 hover:bg-blue-50 transition-colors"
            >
              <span className="flex items-center justify-center text-lg">
                I Already Have an Account
              </span>
            </Button>
          </div>
        </div>
        
        {/* Animated scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-gray-400 flex items-start justify-center p-1">
            <div className="w-1 h-3 bg-gray-400 rounded-full animate-ping"></div>
          </div>
        </div>
      </div>
      
      {/* Registration/Login Section with multi-step form */}
      <div 
        ref={formSectionRef}
        id="form-section" 
        className="py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-2xl mx-auto">
          {/* Welcome step - only show if not clicked from hero */}
          {!clickedFromHero && (
            <FormStep isActive={currentStep === 'welcome'}>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to IQLEVAL</h2>
                <p className="text-gray-600 max-w-xl mx-auto">
                  Get started with our cognitive assessment platform. Choose an option below to continue.
                </p>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    onClick={() => handleButtonClick('newUser')}
                    className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-transparent hover:border-blue-200"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                        <path d="M16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">New User</h3>
                    <p className="text-gray-500">Create your profile and start your assessment journey</p>
                  </div>
                  
                  <div 
                    onClick={() => handleButtonClick('returningUser')}
                    className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-transparent hover:border-green-200"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Returning User</h3>
                    <p className="text-gray-500">Sign in with your existing account to continue</p>
                  </div>
                </div>
              </div>
            </FormStep>
          )}
          
          {/* New User Registration Form */}
          <FormStep 
            isActive={currentStep === 'newUser'} 
            onBack={() => setCurrentStep('welcome')}
            showBackButton={true}
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-600 to-indigo-600">
                <h2 className="text-2xl font-bold text-white mb-2">Create Your Profile</h2>
                <p className="text-blue-100">
                  Fill in your details to get personalized assessment results
                </p>
              </div>
              
              <div className="p-6 sm:p-8">
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
          required
                      disabled={isSubmitting || isGoogleLoading}
                      className="h-12 rounded-xl focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
                    <Label htmlFor="age" className="text-sm font-medium text-gray-700">Age</Label>
        <Input
          id="age"
          name="age"
          type="number"
          placeholder="Enter your age"
          value={formData.age}
          onChange={handleChange}
          min="5"
          max="99"
          required
                      disabled={isSubmitting || isGoogleLoading}
                      className="h-12 rounded-xl focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
                    <Label htmlFor="education" className="text-sm font-medium text-gray-700">Education Level</Label>
                    <Select 
                      value={formData.education} 
                      onValueChange={handleEducationChange}
                      disabled={isSubmitting || isGoogleLoading}
                    >
                      <SelectTrigger className="h-12 rounded-xl focus:ring-blue-500 focus:border-blue-500">
            <SelectValue placeholder="Select education level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="elementary">Elementary School</SelectItem>
            <SelectItem value="middle">Middle School</SelectItem>
            <SelectItem value="high">High School</SelectItem>
            <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
            <SelectItem value="master">Master's Degree</SelectItem>
            <SelectItem value="phd">PhD or Higher</SelectItem>
          </SelectContent>
        </Select>
      </div>

                  <div className="pt-4">
                    <Button 
                      type="button"
                      onClick={handleGoogleLogin}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white h-12 hover:opacity-90 rounded-xl shadow transition-all"
                      disabled={isSubmitting || isGoogleLoading || !isFormValid}
                    >
                      {isGoogleLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 262"><path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path><path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path><path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"></path><path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path></svg>
                          <span>Sign up with Google</span>
                        </>
                      )}
      </Button>
                    
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-500">
                        By creating an account, you agree to our Terms of Service and Privacy Policy.
                      </p>
                    </div>
                  </div>
    </form>
              </div>
            </div>
          </FormStep>
          
          {/* Returning User Login */}
          <FormStep 
            isActive={currentStep === 'returningUser'} 
            onBack={() => setCurrentStep('welcome')}
            showBackButton={true}
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 sm:p-8 bg-gradient-to-r from-green-600 to-teal-600">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-green-100">
                  Sign in to continue your cognitive assessment journey
                </p>
              </div>
              
              <div className="p-6 sm:p-8">
                <div className="mb-8 flex justify-center">
                  <img 
                    src="/assets/login-illustration.svg" 
                    alt="Login" 
                    className="w-48 h-auto"
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                
                <div className="text-center mb-6">
                  <p className="text-gray-600">
                    Sign in with your Google account to access your assessments and reports.
                  </p>
                </div>
                
                <Button 
                  type="button"
                  onClick={handleExistingUserLogin}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 text-white h-12 hover:opacity-90 rounded-xl shadow transition-all"
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 262"><path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path><path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path><path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"></path><path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path></svg>
                      <span>Sign in with Google</span>
                    </>
                  )}
                </Button>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    Don't have an account yet? 
                    <button 
                      type="button" 
                      onClick={() => setCurrentStep('newUser')} 
                      className="ml-1 text-green-600 hover:text-green-800 hover:underline"
                    >
                      Create one now
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </FormStep>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Cognitive Assessment</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              IQLEVAL uses scientifically validated cognitive tests to measure and analyze different domains of your cognitive abilities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Memory Assessment",
                description: "Evaluate your short-term and working memory capabilities through engaging memory games.",
                icon: "💭"
              },
              {
                title: "Problem Solving",
                description: "Measure your ability to think critically and solve complex problems under time constraints.",
                icon: "🧩"
              },
              {
                title: "Cognitive Flexibility",
                description: "Assess your mental agility and ability to adapt to changing rules and circumstances.",
                icon: "🔄"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow animate-on-scroll opacity-0 translate-y-4"
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="py-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p className="mb-1">© {new Date().getFullYear()} IQLEVAL • All rights reserved</p>
            <p>Your data is securely stored and used only for assessment purposes.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
