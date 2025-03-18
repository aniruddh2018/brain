"use client"

import type React from "react"
import { useState } from "react"
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
      <div className="relative bg-gradient-to-r from-blue-600/10 to-indigo-600/10 py-16 sm:py-24 overflow-hidden">
        {/* Brain Network Animation Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Nodes */}
            <div className="absolute h-4 w-4 rounded-full bg-indigo-600 animate-pulse top-1/4 left-1/4"></div>
            <div className="absolute h-5 w-5 rounded-full bg-blue-500 animate-pulse delay-300 top-1/3 right-1/3"></div>
            <div className="absolute h-3 w-3 rounded-full bg-indigo-400 animate-pulse delay-100 bottom-1/4 right-1/4"></div>
            <div className="absolute h-6 w-6 rounded-full bg-blue-600 animate-pulse delay-700 bottom-1/3 left-1/3"></div>
            <div className="absolute h-4 w-4 rounded-full bg-indigo-500 animate-pulse delay-500 top-2/5 left-2/5"></div>
            <div className="absolute h-3 w-3 rounded-full bg-blue-400 animate-pulse delay-200 bottom-2/5 right-2/5"></div>
            <div className="absolute h-5 w-5 rounded-full bg-indigo-300 animate-pulse delay-400 top-1/5 right-1/5"></div>
            <div className="absolute h-4 w-4 rounded-full bg-blue-300 animate-pulse delay-600 bottom-1/5 left-1/5"></div>
            
            {/* Connecting Lines */}
            <div className="absolute h-px w-[30%] bg-indigo-300 rotate-45 top-1/3 left-1/3 animate-fadeIn delay-100"></div>
            <div className="absolute h-px w-[25%] bg-blue-300 -rotate-45 top-1/2 left-1/3 animate-fadeIn delay-300"></div>
            <div className="absolute h-px w-[20%] bg-indigo-300 rotate-90 top-2/5 right-1/3 animate-fadeIn delay-200"></div>
            <div className="absolute h-px w-[30%] bg-blue-300 rotate-180 bottom-1/3 left-1/2 animate-fadeIn delay-150"></div>
            <div className="absolute h-px w-[25%] bg-indigo-300 rotate-135 bottom-2/5 right-1/3 animate-fadeIn delay-400"></div>
            <div className="absolute h-px w-[20%] bg-blue-300 rotate-[70deg] bottom-1/5 right-1/4 animate-fadeIn delay-350"></div>
            <div className="absolute h-px w-[28%] bg-indigo-300 rotate-[110deg] top-1/4 right-1/4 animate-fadeIn delay-250"></div>
            <div className="absolute h-px w-[22%] bg-blue-300 rotate-[150deg] top-1/5 left-1/4 animate-fadeIn delay-500"></div>

            {/* Central Brain (smaller and more subtle than the main brain) */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10">
              <Brain className="h-64 w-64 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Evaluate your</span>
                <span className="block text-indigo-600">Cognitive Abilities</span>
              </h1>
              <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                IQLEVAL provides a comprehensive assessment of your cognitive function through interactive challenges designed by experts in cognitive science.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <Button 
                  onClick={scrollToForm} 
                  className="bg-indigo-600 hover:bg-indigo-700 py-4 px-6 text-lg"
                >
                  Start Your Assessment <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              {/* Brain Animation - Now directly in the hero section without the white box */}
              <div className="brain-animation relative w-full h-full">
                {/* Nodes */}
                <div className="node absolute h-4 w-4 rounded-full bg-indigo-600 animate-pulse top-1/4 left-1/4"></div>
                <div className="node absolute h-5 w-5 rounded-full bg-blue-500 animate-pulse delay-300 top-1/3 right-1/3"></div>
                <div className="node absolute h-3 w-3 rounded-full bg-indigo-400 animate-pulse delay-100 bottom-1/4 right-1/4"></div>
                <div className="node absolute h-6 w-6 rounded-full bg-blue-600 animate-pulse delay-700 bottom-1/3 left-1/3"></div>
                <div className="node absolute h-4 w-4 rounded-full bg-indigo-500 animate-pulse delay-500 top-2/5 left-2/5"></div>
                <div className="node absolute h-3 w-3 rounded-full bg-blue-400 animate-pulse delay-200 bottom-2/5 right-2/5"></div>
                
                {/* Center Brain Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-white/80 p-6 shadow-xl z-10 animate-float">
                    <Brain className="h-16 w-16 text-indigo-600" />
                  </div>
                </div>
                
                {/* Connecting Lines */}
                <div className="absolute h-px w-1/4 bg-indigo-300 rotate-45 top-1/3 left-1/3 animate-fadeIn delay-100"></div>
                <div className="absolute h-px w-1/3 bg-blue-300 -rotate-45 top-1/2 left-1/3 animate-fadeIn delay-300"></div>
                <div className="absolute h-px w-1/4 bg-indigo-300 rotate-90 top-2/5 right-1/3 animate-fadeIn delay-200"></div>
                <div className="absolute h-px w-1/3 bg-blue-300 rotate-180 bottom-1/3 left-1/2 animate-fadeIn delay-150"></div>
                <div className="absolute h-px w-1/4 bg-indigo-300 rotate-135 bottom-2/5 right-1/3 animate-fadeIn delay-400"></div>
                
                {/* Pulsing Circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="pulse-circle animate-ping-slow opacity-40 absolute h-20 w-20 rounded-full border-2 border-indigo-400"></div>
                  <div className="pulse-circle animate-ping-slow delay-300 opacity-30 absolute h-32 w-32 rounded-full border-2 border-blue-300"></div>
                  <div className="pulse-circle animate-ping-slow delay-600 opacity-20 absolute h-44 w-44 rounded-full border-2 border-indigo-200"></div>
                </div>
                
                {/* Floating Particles */}
                <div className="particle absolute h-1 w-1 rounded-full bg-blue-300 animate-float-particle top-1/5 left-1/5"></div>
                <div className="particle absolute h-1 w-1 rounded-full bg-indigo-300 animate-float-particle-reverse delay-300 bottom-1/5 right-1/5"></div>
                <div className="particle absolute h-1 w-1 rounded-full bg-blue-200 animate-float-particle delay-600 top-3/5 right-2/5"></div>
                <div className="particle absolute h-1 w-1 rounded-full bg-indigo-200 animate-float-particle-reverse delay-900 bottom-2/5 left-2/5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="py-16 bg-white">
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
      <div className="py-16 bg-gray-50">
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
      <div className="py-16 bg-white">
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
      <div id="profile-form" className="py-16 bg-[#d9e3fd]">
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

