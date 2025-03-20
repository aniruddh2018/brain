'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Brain } from "lucide-react"

export default function NotFoundPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#d9e3fd] flex items-center justify-center">
      <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#e7efff] flex items-center justify-center mb-6">
          <Brain className="h-10 w-10 text-blue-600" />
        </div>

        <h2 className="text-3xl font-bold mb-2 text-gray-900">Page Not Found</h2>

        <p className="mb-6 text-gray-600">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
        </p>

        <div className="flex flex-col space-y-3">
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            onClick={() => router.push('/')}
          >
            Return to Home
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
} 