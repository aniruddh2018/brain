"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { NavBar } from "@/components/ui/nav-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { requireAuth, getCurrentUserId, refreshUserData, getUserData, saveUserData } from "@/lib"

export default function MyProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<Record<string, any> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    education: "",
    email: ""
  })

  useEffect(() => {
    // Check if user is authenticated
    checkAuth()
  }, [])

  const checkAuth = () => {
    // Use the auth utility to check if user is logged in and redirect if not
    if (!requireAuth(router.push)) {
      return
    }

    // Fetch user data
    const userId = getCurrentUserId()
    if (userId) {
      fetchUserData(userId)
    } else {
      setError("User ID not found")
      setIsLoading(false)
    }
  }

  const fetchUserData = async (userId: string) => {
    try {
      setIsLoading(true)
      // Get user data from localStorage first for immediate display
      const localUserData = localStorage.getItem("userData")
      let userData = localUserData ? JSON.parse(localUserData) : null

      // Then fetch from DB to ensure we have the latest
      const dbData = await getUserData(userId)
      
      // Combine data sources, prioritizing DB data
      if (dbData && dbData.user) {
        userData = {
          ...userData,
          ...dbData.user,
          // Keep metrics if they exist in localStorage
          metrics: userData?.metrics || {}
        }
        
        // Update localStorage with the latest data
        localStorage.setItem("userData", JSON.stringify(userData))
      }

      if (!userData) {
        throw new Error("User data not found")
      }

      setUser(userData)
      setFormData({
        name: userData.name || "",
        age: userData.age?.toString() || "",
        education: userData.education || "",
        email: userData.email || ""
      })
    } catch (error) {
      console.error("Error fetching user data:", error)
      setError("Failed to load user profile")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true)
      
      const userId = getCurrentUserId()
      if (!userId) {
        setError("User ID not found")
        return
      }
      
      const updatedUserData = {
        id: userId,
        name: formData.name,
        age: parseInt(formData.age) || user?.age,
        education: formData.education,
        email: formData.email,
        google_id: user?.google_id,
        avatar_url: user?.avatar_url
      }
      
      // Save to database
      await saveUserData(updatedUserData)
      
      // Refresh user data to ensure we have the latest
      await refreshUserData(userId)
      
      // Update local state with the form data
      setUser((prev: Record<string, any> | null) => {
        return { ...prev, ...updatedUserData };
      })
      
      setIsEditing(false)
      
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error saving profile:", error)
      setError("Failed to save profile changes")
      toast.error("Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const goToReports = () => {
    router.push("/my-reports")
  }

  const goToAssessments = () => {
    router.push("/games")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">My Profile</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500">
            <p>{error}</p>
            <Button
              onClick={checkAuth}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="max-w-xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>
                  View and manage your profile information
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="flex justify-center mb-6">
                      <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
                        {user?.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            alt="Profile" 
                            className="h-24 w-24 rounded-full"
                          />
                        ) : (
                          <div className="text-3xl font-bold text-blue-500">
                            {user?.name?.charAt(0) || "U"}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium text-gray-500">Name</h3>
                        <p>{user?.name || "Not provided"}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-500">Age</h3>
                        <p>{user?.age || "Not provided"}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-500">Education</h3>
                        <p>{user?.education || "Not provided"}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-500">Email</h3>
                        <p>{user?.email || "Not provided"}</p>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        onClick={() => setIsEditing(true)}
                        className="w-full"
                      >
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        value={formData.age}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="education">Education</Label>
                      <Select 
                        value={formData.education} 
                        onValueChange={(value) => handleSelectChange("education", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select education level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">Primary School</SelectItem>
                          <SelectItem value="secondary">Secondary School</SelectItem>
                          <SelectItem value="college">College</SelectItem>
                          <SelectItem value="undergraduate">Undergraduate</SelectItem>
                          <SelectItem value="graduate">Graduate</SelectItem>
                          <SelectItem value="postgraduate">Post Graduate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={true}
                        className="bg-gray-100"
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                    
                    <div className="flex space-x-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      
                      <Button
                        onClick={handleSaveProfile}
                        className="flex-1"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-2">
                <Button
                  variant="outline"
                  onClick={goToReports}
                  className="w-full"
                >
                  View My Reports
                </Button>
                
                <Button
                  variant="default"
                  onClick={goToAssessments}
                  className="w-full"
                >
                  My Assessments
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
} 