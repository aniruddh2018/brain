"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Brain, Puzzle, Award, BookOpen, LineChart, Target, Sparkles, Users, Clock, GraduationCap } from "lucide-react"
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

  return (
    <div className="min-h-screen bg-[#d9e3fd]">
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto bg-[#d9e3fd] rounded-xl overflow-hidden flex flex-col items-center justify-center py-12">
          {/* Logo */}
          <div className="w-32 h-32 rounded-full bg-[#e7efff] flex items-center justify-center mb-8">
            <Brain className="h-16 w-16 text-blue-600" />
          </div>
          
          {/* Title */}
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-8 tracking-tight text-center">
            IQLEVAL
          </h1>
          
          {/* Form Container */}
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 mx-4">
            <h2 className="text-2xl font-bold mb-6 text-center">Create Your Profile</h2>
            
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
      <div className="fixed bottom-0 w-full border-t border-gray-200 bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} IQLEVAL • All rights reserved
          </div>
        </div>
      </div>
    </div>
  )
}

