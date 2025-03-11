import { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

interface RecommendationCardProps {
  title: string
  description: string
  icon: LucideIcon
}

export default function RecommendationCard({ title, description, icon: Icon }: RecommendationCardProps) {
  return (
    <Card className="p-5 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-start">
        <div className="mr-4 bg-blue-100 p-3 rounded-full">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </Card>
  )
}

