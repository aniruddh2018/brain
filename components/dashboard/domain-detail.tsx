import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, AlertTriangle } from "lucide-react";
import { DomainAnalysis } from '@/lib/report-generator';

interface DomainDetailProps {
  domainData: DomainAnalysis;
}

export default function DomainDetail({ domainData }: DomainDetailProps) {
  const { domain, score, analysis, recommendations, strengths, weaknesses } = domainData;
  const [expanded, setExpanded] = useState(false);

  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  // Get badge color based on score
  const getScoreBadge = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-blue-100 text-blue-800";
    if (score >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Get score label
  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader 
        className="pb-2 cursor-pointer" 
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
              <span className={`text-lg font-bold ${getScoreColor(score)}`}>{score}</span>
            </div>
            {domain}
          </CardTitle>
          <span className={`text-xs px-2 py-1 rounded-full ${getScoreBadge(score)}`}>
            {getScoreLabel(score)}
          </span>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Analysis</h4>
              <p className="text-gray-600">{analysis}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strengths.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-1" /> Strengths
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 ml-1 space-y-1">
                    {strengths.map((strength, i) => (
                      <li key={i}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {weaknesses.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" /> Areas for Growth
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 ml-1 space-y-1">
                    {weaknesses.map((weakness, i) => (
                      <li key={i}>{weakness}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Recommendations</h4>
                <ul className="list-disc list-inside text-gray-600 ml-1 space-y-1">
                  {recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
} 