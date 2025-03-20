import { useState, useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, AlertTriangle } from "lucide-react";
import { DomainAnalysis } from '@/lib';

interface DomainDetailProps {
  domainData: DomainAnalysis;
}

function DomainDetail({ domainData }: DomainDetailProps) {
  const { domain, score, analysis, recommendations, strengths, weaknesses } = domainData;
  const [expanded, setExpanded] = useState(false);

  // Memoize score-based styles to prevent recalculation on each render
  const scoreStyles = useMemo(() => {
    // Get color based on score
    const getScoreColor = () => {
      if (score >= 80) return "text-green-600";
      if (score >= 60) return "text-blue-600";
      if (score >= 40) return "text-yellow-600";
      return "text-red-600";
    };

    // Get badge color based on score
    const getScoreBadge = () => {
      if (score >= 80) return "bg-green-100 text-green-800";
      if (score >= 60) return "bg-blue-100 text-blue-800";
      if (score >= 40) return "bg-yellow-100 text-yellow-800";
      return "bg-red-100 text-red-800";
    };

    // Get score label
    const getScoreLabel = () => {
      if (score >= 80) return "Excellent";
      if (score >= 60) return "Good";
      if (score >= 40) return "Fair";
      return "Needs Improvement";
    };

    return {
      color: getScoreColor(),
      badge: getScoreBadge(),
      label: getScoreLabel()
    };
  }, [score]);

  // Memoize the domain header to prevent re-renders when only the expanded state changes
  const DomainHeader = useMemo(() => (
    <CardHeader 
      className="pb-2 cursor-pointer" 
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex justify-between items-center">
        <CardTitle className="text-lg flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
            <span className={`text-lg font-bold ${scoreStyles.color}`}>{score}</span>
          </div>
          {domain}
        </CardTitle>
        <span className={`text-xs px-2 py-1 rounded-full ${scoreStyles.badge}`}>
          {scoreStyles.label}
        </span>
      </div>
    </CardHeader>
  ), [domain, score, scoreStyles, expanded]);

  // Memoize content to prevent unnecessary re-rendering when expanded state doesn't change
  const ExpandedContent = useMemo(() => {
    if (!expanded) return null;
    
    return (
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
                  {strengths.map((strength: string, i: number) => (
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
                  {weaknesses.map((weakness: string, i: number) => (
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
                {recommendations.map((rec: string, i: number) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    );
  }, [expanded, analysis, strengths, weaknesses, recommendations]);

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      {DomainHeader}
      {ExpandedContent}
    </Card>
  );
}

// Wrap component with memo to prevent re-renders when props haven't changed
export default memo(DomainDetail); 