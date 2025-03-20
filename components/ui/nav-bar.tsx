"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Brain, FileText, Home, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isUserLoggedIn, logoutUser } from "@/lib"

export function NavBar() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  useEffect(() => {
    // Check if user is logged in
    setIsLoggedIn(isUserLoggedIn())
  }, [])
  
  const handleLogout = async () => {
    // Use the new logoutUser utility
    await logoutUser(router.push)
  }
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div 
              className="rounded-full bg-[#e7efff] p-2 mr-2 cursor-pointer" 
              onClick={() => router.push("/")}
            >
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <span 
              className="text-2xl font-bold text-gray-900 cursor-pointer" 
              onClick={() => router.push("/")}
            >
              IQLEVAL
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="flex items-center space-x-1"
              onClick={() => router.push("/")}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Button>
            
            {isLoggedIn && (
              <>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-1"
                  onClick={() => router.push("/my-profile")}
                >
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </Button>
                
                <Button
                  variant="ghost"
                  className="flex items-center space-x-1"
                  onClick={() => router.push("/my-reports")}
                >
                  <FileText className="h-4 w-4" />
                  <span>My Reports</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex items-center space-x-1"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 