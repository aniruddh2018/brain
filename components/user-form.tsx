"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UserForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    education: "elementary",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEducationChange = (value: string) => {
    setFormData((prev) => ({ ...prev, education: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Calculate difficulty based on age
    let difficulty = "medium"
    const age = Number.parseInt(formData.age)

    if (age < 10) difficulty = "easy"
    else if (age >= 10 && age < 18) difficulty = "medium"
    else difficulty = "hard"

    // Store user data in localStorage
    localStorage.setItem(
      "userData",
      JSON.stringify({
        ...formData,
        difficulty,
        gameIndex: 0,
        metrics: {},
        startTime: new Date().toISOString(),
      }),
    )

    router.push("/games")
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
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="education">Education Level</Label>
        <Select value={formData.education} onValueChange={handleEducationChange}>
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

      <Button type="submit" className="w-full">
        Start Assessment
      </Button>
    </form>
  )
}

