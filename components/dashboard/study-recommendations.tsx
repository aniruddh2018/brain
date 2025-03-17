import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Lightbulb, Users, Clock, Brain, Sparkles } from "lucide-react";
import { DomainAnalysis, LearningStyleAnalysis } from "@/lib";

interface StudyRecommendationsProps {
  domainAnalyses: DomainAnalysis[];
  strengths: { name: string; score: number }[];
  weaknesses: { name: string; score: number }[];
  learningStyle: LearningStyleAnalysis & {
    description?: string;
    teachingStrategies?: string[];
    accommodations?: string[];
  };
}

export default function StudyRecommendations({ 
  domainAnalyses, 
  strengths, 
  weaknesses,
  learningStyle
}: StudyRecommendationsProps) {
  
  // Map learning style to icon
  const getLearningStyleIcon = () => {
    const styleIconMap: Record<string, React.ElementType> = {
      "Sequential Learner": Clock,
      "Logical Learner": Brain,
      "Verbal/Linguistic Learner": Book,
      "Visual Learner": Sparkles,
      "Visual-Spatial Learner": Sparkles,
      "Kinesthetic Learner": Users,
      "Multimodal Learner": Lightbulb
    };
    
    return styleIconMap[learningStyle.primaryStyle] || Lightbulb;
  };
  
  // Generate teaching strategies based on profile
  const getAdditionalTeachingStrategies = () => {
    // Add strategies based on weaknesses
    const strategies = [];
    
    for (const weakness of weaknesses.slice(0, 2)) {
      const domain = weakness.name;
      let strategy = "";
      
      switch(domain) {
        case "Memory":
          strategy = "Use mnemonic devices, spaced repetition, and visual associations to support information retention.";
          break;
        case "Problem Solving":
          strategy = "Scaffold complex problems, provide guided examples, and encourage verbalization of thought processes.";
          break;
        case "Vocabulary":
          strategy = "Pre-teach key terminology, create word walls, and incorporate vocabulary games into instruction.";
          break;
        case "Spatial Reasoning":
          strategy = "Incorporate diagrams, mind maps, and spatial organizers to help visualize concepts and relationships.";
          break;
        case "Navigation":
          strategy = "Use manipulatives, hands-on activities, and physical models to make abstract concepts concrete.";
          break;
        case "Cognitive Flexibility":
          strategy = "Practice transitions between activities, use multiple representations of concepts, and teach explicit strategies for shifting focus.";
          break;
        default:
          strategy = "Provide additional support and practice in this area through targeted activities.";
      }
      
      strategies.push({
        title: `Support ${domain} Development`,
        description: strategy,
        primary: false
      });
    }
    
    // Add general recommendation for balanced development
    strategies.push({
      title: "Multimodal Learning Activities",
      description: "Incorporate variety in instructional approaches to develop all cognitive domains while emphasizing strengths.",
      primary: false
    });
    
    return strategies;
  };
  
  const LearningStyleIcon = getLearningStyleIcon();
  const additionalStrategies = getAdditionalTeachingStrategies();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <LearningStyleIcon className="h-5 w-5 text-indigo-500" />
            Learning Style: {learningStyle.primaryStyle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">{learningStyle.description}</p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Teaching Strategies
              </h3>
              <ul className="space-y-3">
                {learningStyle.teachingStrategies?.map((strategy: string, index: number) => (
                  <li key={index} className="p-3 rounded-md bg-indigo-50 border border-indigo-100">
                    <p className="text-sm text-gray-700">{strategy}</p>
                  </li>
                ))}
                {additionalStrategies.map((strategy: { title: string; description: string; primary?: boolean }, index: number) => (
                  <li key={`additional-${index}`} className="p-3 rounded-md bg-gray-50">
                    <p className="font-medium text-sm">{strategy.title}</p>
                    <p className="text-sm text-gray-600">{strategy.description}</p>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Classroom Accommodations
              </h3>
              <ul className="space-y-2">
                {learningStyle.accommodations?.map((accommodation: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="mt-1 min-w-4">
                      <div className="h-2 w-2 rounded-full bg-blue-400" />
                    </div>
                    <p className="text-sm text-gray-700">{accommodation}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 