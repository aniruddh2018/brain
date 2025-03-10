import type { LucideIcon } from "lucide-react"

interface RecommendationCardProps {
  title: string
  description: string
  icon: LucideIcon
}

export default function RecommendationCard({ title, description, icon: Icon }: RecommendationCardProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
      <div className="bg-indigo-50 p-4 flex items-center">
        <div className="bg-indigo-100 p-2 rounded-full mr-3">
          <Icon className="h-5 w-5 text-indigo-600" />
        </div>
        <h3 className="font-semibold text-indigo-900">{title}</h3>
      </div>
      <div className="p-4">
        <p className="text-gray-600 text-sm">{description}</p>
        <div className="mt-4 flex justify-end">
          <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800 flex items-center">
            Learn more
            <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

