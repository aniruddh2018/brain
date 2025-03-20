"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { ChevronRight, Brain, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { saveUserData } from "@/lib/supabase-fixed"
import { toast } from "sonner"
import dynamic from "next/dynamic"

// Dynamically import the BrainInfographic component
const BrainInfographic = dynamic(() => import("@/app/components/brain-infographic"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-60 flex items-center justify-center">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-gray-200 h-24 w-24"></div>
        <div className="flex-1 space-y-6 py-1">
          <div className="h-2 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-2 bg-gray-200 rounded col-span-2"></div>
              <div className="h-2 bg-gray-200 rounded col-span-1"></div>
            </div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
})

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
  const [clickedFromHero, setClickedFromHero] = useState(true)

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
        difficulty
      }

      const result = await saveUserData(userData)
      // Use a simple check for error that avoids TypeScript issues
      if (result && typeof result === 'object' && 'error' in result) {
        throw new Error('Error saving user data')
      }

      // Store data locally too
      localStorage.setItem('user_data', JSON.stringify(userData))
      
      // Redirect to tests page
      router.push('/tests')
    } catch (error) {
      console.error(error)
      toast.error("Failed to save user data. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleButtonClick = (formType: 'newUser' | 'returningUser') => {
    setCurrentStep(formType)
    setClickedFromHero(true)
    
    // Scroll to form section
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleGoogleAuth = async (e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.preventDefault();

    // Only for new users, validate the form first
    if (currentStep === 'newUser') {
      if (!isFormValid) {
        toast.error("Please fill out all required fields correctly")
        return
      }
      
      // Store form data in local storage to retrieve after Google auth
      const age = Number.parseInt(formData.age)
      let difficulty = "medium"
      
      if (age < 10) difficulty = "easy"
      else if (age >= 10 && age < 18) difficulty = "medium"
      else difficulty = "hard"
      
      const userData = {
        name: formData.name,
        age,
        education: formData.education,
        difficulty
      }
      
      // Store data for retrieval after auth
      localStorage.setItem('temp_user_data', JSON.stringify(userData))
    }

    try {
    setIsGoogleLoading(true)
    
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        throw error
      }
    } catch (error: any) {
      console.error(error)
      toast.error("Google authentication failed. Please try again.")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      
      {/* Hero Section - Better centered with reduced blank space */}
      <div className="relative py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-[#f0f4ff] flex items-center justify-center">
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                Discover Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Cognitive Profile</span> With Scientific Accuracy
              </h1>
              
            <p className="text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl">
                Take our scientifically validated assessment tests to understand your cognitive strengths, 
                identify areas for improvement, and track your mental performance over time.
              </p>
              
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
                <Button
                  onClick={() => handleButtonClick('newUser')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white h-12 px-6 rounded-xl hover:opacity-90 shadow-lg transition-all w-full flex items-center justify-center gap-2"
                >
                  Start Your Assessment 
                <ChevronRight className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={() => handleButtonClick('returningUser')}
                  variant="outline"
                className="h-12 px-6 rounded-xl border-gray-300 hover:border-gray-400 transition-all w-full"
                >
                  Returning User? Sign In
                </Button>
            </div>
            
            <div className="mt-10 sm:mt-12 lg:mt-16 flex justify-center">
              <div className="relative w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] md:w-[300px] md:h-[300px]">
                <Image
                  src="/brain-illustration.png"
                  alt="Brain Illustration"
                  fill
                  className="object-contain drop-shadow-xl animate-float"
                  priority
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Form/Auth Section */}
      <div className="py-12 px-4 sm:px-6 lg:px-8 bg-white" ref={formSectionRef}>
        <div className="max-w-md mx-auto">
          {/* Welcome Step - Only show if not clicked from hero and current step is welcome */}
          {/* This section is now always skipped because clickedFromHero is always true */}
          <FormStep 
            isActive={currentStep === 'welcome' && !clickedFromHero} 
            showBackButton={false}
            onBack={() => {
              setCurrentStep('welcome')
              setClickedFromHero(false)
            }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to IQ Eval</h2>
              <p className="text-gray-600">This welcome content is skipped when clicked from hero section</p>
            </div>
          </FormStep>
          
          {/* New User Form */}
          <FormStep 
            isActive={currentStep === 'newUser'} 
            showBackButton={!clickedFromHero}
            onBack={() => {
              setCurrentStep('welcome')
              setClickedFromHero(false)
            }}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create Your Profile</h2>
              <p className="text-gray-600 max-w-sm mx-auto">
                To get started with your cognitive assessment, please provide your information below.
              </p>
            </div>
            
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleGoogleAuth(e);
              }} className="space-y-5">
                  <div>
                  <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                  <Label htmlFor="age" className="text-gray-700">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      placeholder="Enter your age"
                      value={formData.age}
                      onChange={handleChange}
                      className="mt-1"
                      min="1"
                      max="120"
                      required
                    />
                  </div>

                  <div>
                  <Label htmlFor="education" className="text-gray-700">Education Level</Label>
                    <Select 
                      value={formData.education} 
                      onValueChange={handleEducationChange}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="elementary">Elementary School</SelectItem>
                        <SelectItem value="middle">Middle School</SelectItem>
                        <SelectItem value="high">High School</SelectItem>
                        <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                        <SelectItem value="masters">Master's Degree</SelectItem>
                        <SelectItem value="doctorate">Doctorate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                    
                <div className="pt-4">
                  <Button 
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white h-12 hover:opacity-90 rounded-xl shadow transition-all"
                    disabled={isGoogleLoading || !isFormValid}
                  >
                    {isGoogleLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 262"><path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path><path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path><path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"></path><path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path></svg>
                        <span>Continue with Google</span>
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-500">
                    We'll connect your profile with Google for easy sign-in
                  </p>
                </div>
                </form>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Already have an account? 
                <button 
                  type="button" 
                  onClick={() => handleButtonClick('returningUser')} 
                  className="ml-1 text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          </FormStep>
          
          {/* Returning User */}
          <FormStep 
            isActive={currentStep === 'returningUser'} 
            showBackButton={!clickedFromHero}
            onBack={() => {
              setCurrentStep('welcome')
              setClickedFromHero(false)
            }}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600 max-w-sm mx-auto">
                Sign in to access your cognitive assessment results and continue your journey.
                </p>
              </div>
              
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-center mb-6">
                <div className="relative h-[60px] w-[60px]">
                  <Image
                    src="/logo.png"
                    alt="IQ Eval Logo"
                    width={60}
                    height={60}
                    className="rounded-lg"
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                </div>
                
                <div className="text-center mb-6">
                  <p className="text-gray-600">
                    Sign in with your Google account to access your assessments and reports.
                  </p>
                </div>
                
                <Button 
                  type="button"
                  onClick={handleGoogleAuth}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white h-12 hover:opacity-90 rounded-xl shadow transition-all"
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
                      onClick={() => handleButtonClick('newUser')} 
                    className="ml-1 text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Create one now
                    </button>
                  </p>
              </div>
            </div>
          </FormStep>
        </div>
      </div>

      {/* Comprehensive Cognitive Assessment Section - Always visible for SEO */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Comprehensive Cognitive Assessment</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Discover your cognitive strengths and areas for improvement with our scientifically-designed assessments
            </p>
          </div>
          
          {/* Brain Infographic - No bottom margin now */}
          <div className="mb-0">
            <BrainInfographic />
          </div>

          {/* Feature Cards - Added top margin to ensure proper spacing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-8">
            {/* Memory Assessment Card */}
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-blue-50 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900">Memory Assessment</h3>
              </div>
              <p className="text-sm sm:text-base text-gray-600">
                Evaluate your short-term memory capacity and recall abilities through engaging memory tasks
              </p>
            </div>

            {/* Problem Solving Card */}
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-purple-50 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900">Problem Solving</h3>
              </div>
              <p className="text-sm sm:text-base text-gray-600">
                Test your analytical thinking and problem-solving strategies with adaptive puzzles
              </p>
            </div>

            {/* Cognitive Flexibility Card */}
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-green-50 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900">Cognitive Flexibility</h3>
              </div>
              <p className="text-sm sm:text-base text-gray-600">
                Measure your ability to adapt to changing situations and switch between different concepts
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Additional SEO Content Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Use IQLEVAL for Cognitive Assessment?</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Scientifically Validated</h3>
                    <p className="text-gray-600">Our cognitive tests are designed based on established cognitive science research and validated methodologies.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Comprehensive Analysis</h3>
                    <p className="text-gray-600">Receive detailed insights into your cognitive strengths and areas for improvement across multiple domains.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Personalized Recommendations</h3>
                    <p className="text-gray-600">Get tailored recommendations to enhance your cognitive abilities based on your assessment results.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">How long does the assessment take?</h4>
                    <p className="text-gray-600 text-sm">The complete assessment takes approximately 20-30 minutes to complete, depending on your pace.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Is my data secure?</h4>
                    <p className="text-gray-600 text-sm">Yes, all assessment data is securely stored and used only for providing you with accurate results and recommendations.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Can I see my previous results?</h4>
                    <p className="text-gray-600 text-sm">Yes, you can access your assessment history and track your cognitive improvements over time in your profile.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-xl">
                <blockquote className="italic text-gray-700">
                  "Understanding your cognitive profile is the first step toward optimizing your mental performance and reaching your full potential."
              </blockquote>
                <div className="mt-4 text-sm font-medium text-gray-900">Dr. Sarah Chen, Cognitive Neuroscientist</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer - Always visible */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <div className="text-lg font-bold text-gray-900">IQLEVAL</div>
                <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Beta</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">© 2023 IQLEVAL. All rights reserved.</div>
            </div>
            
            <div className="flex gap-6">
              <a href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">Privacy Policy</a>
              <a href="/terms" className="text-sm text-gray-600 hover:text-gray-900">Terms of Service</a>
              <a href="/contact" className="text-sm text-gray-600 hover:text-gray-900">Contact Us</a>
          </div>
        </div>
      </div>
      </footer>
    </div>
  )
}



