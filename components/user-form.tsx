"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { saveUserData } from "@/lib/supabase-client" // Import directly from supabase-client

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
      // Calculate difficulty based on age
      let difficulty = "medium"
      const age = Number.parseInt(formData.age)

      if (age < 10) difficulty = "easy"
      else if (age >= 10 && age < 18) difficulty = "medium"
      else difficulty = "hard"

      // Create user data object
      const userData = {
        name: formData.name,
        age,
        education: formData.education,
        difficulty,
        id: crypto.randomUUID()
      }

      // Save to Supabase directly
      try {
        const savedUser = await saveUserData(userData)
        console.log("User saved to Supabase:", savedUser)
        
        // Store ID for future use
        if (savedUser?.[0]?.id) {
          localStorage.setItem('userId', savedUser[0].id)
        }
      } catch (supabaseError) {
        console.error("Failed to save to Supabase, continuing with local storage:", supabaseError)
      }

      // Also store in localStorage for backwards compatibility
      localStorage.setItem(
        "userData",
        JSON.stringify({
          ...userData,
          gameIndex: 0,
          metrics: {},
          startTime: new Date().toISOString(),
        }),
      )

      router.push("/games")
    } catch (error) {
      console.error("Error saving user data:", error)
      alert("There was an error saving your profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="education">Education Level</Label>
        <Select 
          value={formData.education} 
          onValueChange={handleEducationChange}
          disabled={isSubmitting}
        >
          <SelectTrigger>
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

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Profile...
          </>
        ) : (
          "Start Assessment"
        )}
      </Button>
    </form>
  )
}

