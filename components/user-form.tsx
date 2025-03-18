"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Brain, Puzzle, Award, BookOpen, LineChart, Target, Sparkles, Users, Clock, GraduationCap, ChevronRight, Check } from "lucide-react"
import { saveUserData } from "@/lib"

export default function UserForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    education: "elementary",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  // Ref to track scroll animation sections
  const aboutSectionRef = useRef<HTMLDivElement>(null)
  const featuresSectionRef = useRef<HTMLDivElement>(null)
  const futurePlansSectionRef = useRef<HTMLDivElement>(null)
  const formSectionRef = useRef<HTMLDivElement>(null)

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      
      // Check for brain elements to animate on scroll
      document.querySelectorAll('.brain-scroll-animate').forEach((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect()
        if (rect.top <= window.innerHeight * 0.8) {
          el.classList.add('visible')
        }
      })
    }
    
    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check on initial load
    
    return () => window.removeEventListener('scroll', handleScroll)
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
        }),
      )
      
      // Navigate to games page
      router.push("/games")
    } catch (error) {
      console.error("Error saving user data:", error)
      alert("There was an error saving your profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const scrollToForm = () => {
    document.getElementById('profile-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#d9e3fd]">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="rounded-full bg-[#e7efff] p-2 mr-2">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">IQLEVAL</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600/10 to-indigo-600/10 py-20 sm:py-32 overflow-hidden">
        {/* Brain animation background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Glowing background orbs */}
          <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-2/3 left-1/4 w-72 h-72 rounded-full bg-purple-400/10 blur-3xl animate-pulse delay-300"></div>
          
          {/* Small brain particles with glow effects */}
          <div className="absolute h-5 w-5 top-1/4 left-1/4 opacity-70 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">
            <Brain className="h-full w-full text-indigo-500 animate-float-particle" />
          </div>
          <div className="absolute h-8 w-8 top-1/3 right-1/3 opacity-60 filter drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]">
            <Brain className="h-full w-full text-blue-500 animate-float-particle-reverse delay-200" />
          </div>
          <div className="absolute h-6 w-6 bottom-1/4 left-1/2 opacity-70 filter drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]">
            <Brain className="h-full w-full text-indigo-600 animate-float-particle delay-300" />
          </div>
          <div className="absolute h-9 w-9 bottom-1/3 right-1/4 opacity-60 filter drop-shadow-[0_0_12px_rgba(37,99,235,0.7)]">
            <Brain className="h-full w-full text-blue-600 animate-float-particle-reverse delay-100" />
          </div>
          <div className="absolute h-5 w-5 top-1/2 left-1/3 opacity-70 filter drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]">
            <Brain className="h-full w-full text-indigo-400 animate-float-particle delay-500" />
          </div>
          <div className="absolute h-7 w-7 top-2/3 right-1/4 opacity-65 filter drop-shadow-[0_0_10px_rgba(96,165,250,0.6)]">
            <Brain className="h-full w-full text-blue-400 animate-float-particle-reverse delay-400" />
          </div>
          <div className="absolute h-6 w-6 top-1/5 right-1/5 opacity-70 filter drop-shadow-[0_0_12px_rgba(167,139,250,0.7)]">
            <Brain className="h-full w-full text-purple-400 animate-float-particle delay-700" />
          </div>
          <div className="absolute h-8 w-8 bottom-1/5 left-1/5 opacity-65 filter drop-shadow-[0_0_10px_rgba(99,102,241,0.6)]">
            <Brain className="h-full w-full text-indigo-500 animate-float-particle-reverse delay-600" />
          </div>
          <div className="absolute h-10 w-10 top-2/5 right-2/5 opacity-40 filter drop-shadow-[0_0_15px_rgba(79,70,229,0.8)]">
            <Brain className="h-full w-full text-indigo-600 animate-float-particle delay-200" />
          </div>
          <div className="absolute h-4 w-4 bottom-2/5 left-2/5 opacity-75 filter drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]">
            <Brain className="h-full w-full text-indigo-300 animate-float-particle-reverse delay-800" />
          </div>
          
          {/* Neuron connections - animated lines with pulse and glow */}
          <div className="absolute h-0.5 w-40 bg-gradient-to-r from-indigo-300/0 via-indigo-400/50 to-indigo-300/0 -rotate-45 top-1/3 left-1/3 animate-pulse filter blur-[1px]"></div>
          <div className="absolute h-0.5 w-60 bg-gradient-to-r from-blue-300/0 via-blue-400/50 to-blue-300/0 rotate-45 bottom-1/3 right-1/3 animate-pulse delay-300 filter blur-[1px]"></div>
          <div className="absolute h-0.5 w-48 bg-gradient-to-r from-indigo-300/0 via-indigo-400/50 to-indigo-300/0 rotate-30 top-1/2 right-1/4 animate-pulse delay-500 filter blur-[1px]"></div>
          <div className="absolute h-0.5 w-52 bg-gradient-to-r from-blue-300/0 via-blue-400/50 to-blue-300/0 -rotate-30 bottom-1/2 left-1/4 animate-pulse delay-700 filter blur-[1px]"></div>
          <div className="absolute h-0.5 w-44 bg-gradient-to-r from-purple-300/0 via-purple-400/50 to-purple-300/0 rotate-15 top-1/4 right-1/3 animate-pulse delay-400 filter blur-[1px]"></div>
          <div className="absolute h-0.5 w-56 bg-gradient-to-r from-indigo-300/0 via-indigo-400/50 to-indigo-300/0 -rotate-15 bottom-1/4 left-1/3 animate-pulse delay-200 filter blur-[1px]"></div>
          
          {/* Light beams */}
          <div className="absolute top-0 left-1/4 w-1 h-48 bg-gradient-to-b from-indigo-500/0 via-indigo-500/30 to-indigo-500/0 animate-pulse delay-300"></div>
          <div className="absolute top-0 right-1/3 w-1 h-64 bg-gradient-to-b from-blue-500/0 via-blue-500/20 to-blue-500/0 animate-pulse delay-700"></div>
          <div className="absolute top-1/4 left-0 h-1 w-48 bg-gradient-to-r from-indigo-500/0 via-indigo-500/30 to-indigo-500/0 animate-pulse delay-500"></div>
          <div className="absolute bottom-1/3 right-0 h-1 w-64 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 animate-pulse delay-200"></div>
          
          {/* Large subtle brain in center with enhanced effects */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none filter drop-shadow-[0_0_30px_rgba(79,70,229,0.8)]">
            <Brain className="h-[32rem] w-[32rem] text-indigo-700 animate-brain-rotate" style={{ transform: `translateY(${scrollY * 0.05}px) translateX(${scrollY * -0.02}px)` }} />
          </div>
          
          {/* Particles effect */}
          <div className="absolute inset-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i}
                className={`absolute rounded-full bg-white/30 filter blur-sm animate-float-particle`}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 4 + 1}px`,
                  height: `${Math.random() * 4 + 1}px`,
                  animationDelay: `${Math.random() * 10}s`,
                  animationDuration: `${Math.random() * 10 + 10}s`
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="col-span-12 sm:text-center md:max-w-3xl md:mx-auto lg:col-span-10 lg:col-start-2 lg:text-center">
              <h1 className="text-5xl tracking-tight font-extrabold text-gray-900 sm:text-6xl md:text-7xl mb-6">
                <span className="block mb-2">Evaluate your</span>
                <span className="block text-indigo-600">Cognitive Abilities</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                IQLEVAL provides a comprehensive assessment of your cognitive function through interactive challenges designed by experts in cognitive science.
              </p>
              <div className="mt-10 flex justify-center">
                <Button 
                  onClick={scrollToForm} 
                  className="bg-indigo-600 hover:bg-indigo-700 py-6 px-8 text-lg font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Start Your Assessment <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div ref={aboutSectionRef} className="py-16 bg-white relative">
        {/* Left-side brain animation */}
        <div className="brain-scroll-animate opacity-0 transform -translate-x-16 transition-all duration-1000 absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10">
          <div className="brain-inner relative h-24 w-24 md:h-32 md:w-32 group animate-pop-in">
            {/* Ripple effects */}
            <div className="absolute inset-0 scale-[0.7] rounded-full bg-indigo-400/10 animate-ping-slow"></div>
            <div className="absolute inset-0 scale-[0.85] rounded-full bg-indigo-400/20 animate-ping-slow delay-700"></div>
            <div className="absolute inset-0 rounded-full bg-indigo-400/30 animate-ping-slow delay-300"></div>
            
            {/* Glowing brain */}
            <div className="absolute inset-0 flex items-center justify-center animate-glow-pulse">
            <Brain className="h-full w-full text-indigo-500 animate-brain-rotate" />
            </div>
            
            {/* Orbiting particles */}
            <div className="absolute top-1/2 left-1/2 h-3 w-3 opacity-0 group-hover:opacity-80 transition-opacity duration-500 animate-orbit" 
              style={{ transformOrigin: '0 0' }}>
              <div className="h-full w-full rounded-full bg-blue-400 filter blur-sm"></div>
            </div>
            <div className="absolute top-1/2 left-1/2 h-2 w-2 opacity-0 group-hover:opacity-70 transition-opacity duration-500 animate-orbit-reverse" 
              style={{ transformOrigin: '0 0', animationDelay: '0.5s' }}>
              <div className="h-full w-full rounded-full bg-indigo-300 filter blur-sm"></div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">About IQLEVAL</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to assess cognitive abilities
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              IQLEVAL combines traditional cognitive testing methods with modern interactive technologies to provide accurate, engaging assessments.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <Brain className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Scientifically Validated</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Our assessment methods are based on established cognitive science research and validated testing protocols.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <LineChart className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Detailed Analysis</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Receive comprehensive reports with insights into various cognitive domains and personalized recommendations.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <Puzzle className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Engaging Exercises</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Our interactive challenges are designed to be engaging while accurately measuring cognitive function.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Educational Insights</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Learn about different cognitive domains and how they impact learning, work, and daily activities.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div ref={featuresSectionRef} className="py-16 bg-gray-50 relative">
        {/* Right-side brain animation */}
        <div className="brain-scroll-animate opacity-0 transform translate-x-16 transition-all duration-1000 absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10">
          <div className="brain-inner relative h-24 w-24 md:h-32 md:w-32 group animate-pop-in">
            {/* Ripple effects */}
            <div className="absolute inset-0 scale-[0.7] rounded-full bg-blue-400/10 animate-ping-slow"></div>
            <div className="absolute inset-0 scale-[0.85] rounded-full bg-blue-400/20 animate-ping-slow delay-400"></div>
            <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping-slow delay-200"></div>
            
            {/* Glowing brain */}
            <div className="absolute inset-0 flex items-center justify-center animate-glow-pulse delay-300">
              <Brain className="h-full w-full text-blue-500 animate-brain-rotate delay-300" />
            </div>
            
            {/* Orbiting particles */}
            <div className="absolute top-1/2 left-1/2 h-3 w-3 opacity-0 group-hover:opacity-80 transition-opacity duration-500 animate-orbit-reverse" 
              style={{ transformOrigin: '0 0' }}>
              <div className="h-full w-full rounded-full bg-indigo-400 filter blur-sm"></div>
            </div>
            <div className="absolute top-1/2 left-1/2 h-2 w-2 opacity-0 group-hover:opacity-70 transition-opacity duration-500 animate-orbit" 
              style={{ transformOrigin: '0 0', animationDelay: '0.7s' }}>
              <div className="h-full w-full rounded-full bg-blue-300 filter blur-sm"></div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Comprehensive Cognitive Assessment
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform evaluates multiple cognitive domains through interactive challenges.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                        <Brain className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-medium text-gray-900">Memory Assessment</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Evaluate working memory and retention through pattern recognition and recall tasks.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                        <Puzzle className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-medium text-gray-900">Problem Solving</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Measure logical reasoning and problem-solving abilities with strategic challenges.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-lg">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                        <Target className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-medium text-gray-900">Attention & Focus</h3>
                    <p className="mt-2 text-base text-gray-500">
                      Test selective attention and concentration with interference challenges.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Future Plans Section */}
      <div ref={futurePlansSectionRef} className="py-16 bg-white relative">
        {/* Left-side brain animation */}
        <div className="brain-scroll-animate opacity-0 transform -translate-x-16 transition-all duration-1000 absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10">
          <div className="brain-inner relative h-24 w-24 md:h-32 md:w-32 group animate-pop-in">
            {/* Ripple effects */}
            <div className="absolute inset-0 scale-[0.7] rounded-full bg-purple-400/10 animate-ping-slow"></div>
            <div className="absolute inset-0 scale-[0.85] rounded-full bg-purple-400/20 animate-ping-slow delay-300"></div>
            <div className="absolute inset-0 rounded-full bg-purple-400/30 animate-ping-slow delay-600"></div>
            
            {/* Glowing brain */}
            <div className="absolute inset-0 flex items-center justify-center animate-glow-pulse delay-500">
              <Brain className="h-full w-full text-purple-500 animate-brain-rotate delay-200" />
            </div>
            
            {/* Orbiting particles */}
            <div className="absolute top-1/2 left-1/2 h-3 w-3 opacity-0 group-hover:opacity-80 transition-opacity duration-500 animate-orbit" 
              style={{ transformOrigin: '0 0', animationDuration: '3.5s' }}>
              <div className="h-full w-full rounded-full bg-purple-400 filter blur-sm"></div>
            </div>
            <div className="absolute top-1/2 left-1/2 h-2 w-2 opacity-0 group-hover:opacity-70 transition-opacity duration-500 animate-orbit-reverse" 
              style={{ transformOrigin: '0 0', animationDelay: '0.3s', animationDuration: '4.5s' }}>
              <div className="h-full w-full rounded-full bg-indigo-300 filter blur-sm"></div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Future Plans</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              What's Coming to IQLEVAL
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              We're continuously improving our platform with new features and capabilities.
            </p>
          </div>
          
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="bg-indigo-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Users className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Social Comparison</h3>
                <p className="mt-2 text-gray-600">Compare your results with peers in similar age groups and educational backgrounds.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-indigo-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Clock className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Progress Tracking</h3>
                <p className="mt-2 text-gray-600">Track your cognitive development over time with periodic assessments.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-indigo-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Learning Resources</h3>
                <p className="mt-2 text-gray-600">Access educational content to improve specific cognitive abilities.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-indigo-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Award className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Certification</h3>
                <p className="mt-2 text-gray-600">Receive certificates validating your cognitive assessment results.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div ref={formSectionRef} id="profile-form" className="py-16 bg-[#d9e3fd] relative">
        {/* Right-side brain animation */}
        <div className="brain-scroll-animate opacity-0 transform translate-x-16 transition-all duration-1000 absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10">
          <div className="brain-inner relative h-24 w-24 md:h-32 md:w-32 group animate-pop-in">
            {/* Ripple effects */}
            <div className="absolute inset-0 scale-[0.7] rounded-full bg-indigo-400/10 animate-ping-slow"></div>
            <div className="absolute inset-0 scale-[0.85] rounded-full bg-indigo-400/20 animate-ping-slow delay-500"></div>
            <div className="absolute inset-0 rounded-full bg-indigo-400/30 animate-ping-slow delay-800"></div>
            
            {/* Glowing brain */}
            <div className="absolute inset-0 flex items-center justify-center animate-glow-pulse delay-400">
              <Brain className="h-full w-full text-indigo-500 animate-brain-rotate delay-400" />
            </div>
            
            {/* Orbiting particles */}
            <div className="absolute top-1/2 left-1/2 h-3 w-3 opacity-0 group-hover:opacity-80 transition-opacity duration-500 animate-orbit-reverse" 
              style={{ transformOrigin: '0 0', animationDuration: '4s' }}>
              <div className="h-full w-full rounded-full bg-blue-400 filter blur-sm"></div>
            </div>
            <div className="absolute top-1/2 left-1/2 h-2 w-2 opacity-0 group-hover:opacity-70 transition-opacity duration-500 animate-orbit" 
              style={{ transformOrigin: '0 0', animationDelay: '0.6s', animationDuration: '5s' }}>
              <div className="h-full w-full rounded-full bg-purple-300 filter blur-sm"></div>
            </div>
          </div>
        </div>
        
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-2 text-center">Create Your Profile</h2>
            <p className="text-gray-600 text-center mb-6">
              Start your cognitive assessment by creating a profile
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
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
                  disabled={isSubmitting}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Education Level</Label>
                <Select 
                  value={formData.education} 
                  onValueChange={handleEducationChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-12">
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

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 h-12 text-lg" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  "Start Assessment"
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-gray-500">
              Your data is used only for assessment purposes and to provide personalized insights.
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} IQLEVAL • All rights reserved
          </div>
        </div>
      </div>
    </div>
  )
}

