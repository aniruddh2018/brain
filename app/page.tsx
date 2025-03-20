"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import UserForm from "@/components/user-form-fixed"
import { NavBar } from "@/components/ui/nav-bar"
import { isUserLoggedIn } from "@/lib"

export default function Home() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  
  useEffect(() => {
    // Check if user is already logged in
    if (typeof window !== "undefined") {
      if (isUserLoggedIn()) {
        // Redirect to games page if logged in
        router.push("/games")
      } else {
        // Not logged in, show the form
        setIsChecking(false)
      }
    }
  }, [router])

  // Show nothing while checking authentication status
  if (isChecking) {
    return <div className="min-h-screen bg-gray-50"></div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1">
        <UserForm />
      </main>
    </div>
  )
}

