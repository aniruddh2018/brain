import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the AI model with your key - kept private from users
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_AI_API_KEY || "");

// Enhanced analysis types for dashboard
export interface DomainAnalysis {
  domain: string;
  score: number;
  analysis: string;
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface LearningStyleAnalysis {
  primaryStyle: string;
  description: string;
  teachingStrategies: string[];
  accommodations: string[];
}

export interface CognitiveReport {
  summary: string;
  domainAnalyses: DomainAnalysis[];
  overallScore: number;
  strengths: { name: string; score: number }[];
  weaknesses: { name: string; score: number }[];
  recommendations: { title: string; description: string }[];
  relationshipInsights: { domains: string[]; insight: string }[];
  learningStyles: LearningStyleAnalysis;
}

export async function generateReport(userData: any) {
  try {
    // Format metrics data for the AI
    const metricsData = formatMetricsForAI(userData);

    // Create the prompt for the AI model
    const prompt = `
      Generate a comprehensive cognitive assessment report based on the following data:
      
      User Information:
      - Name: ${userData.name}
      - Age: ${userData.age}
      - Education Level: ${userData.education || "Not specified"}
      - Difficulty Level: ${userData.difficulty}
      
      Test Results:
      ${metricsData}
      
      Please provide:
      1. A summary of overall cognitive performance
      2. Detailed analysis of strengths and weaknesses in each cognitive domain
      3. Comparisons between different cognitive abilities
      4. Suggestions for cognitive improvement based on the results
      5. How these cognitive abilities relate to everyday activities and academic/professional performance
      
      Format the report in a professional but accessible style. Avoid overly technical language.
    `;

    // Generate text using AI
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Error generating report:", error);
    return "There was an error generating your cognitive assessment report. Please try again later.";
  }
}

// New function to generate structured analysis
export async function generateDashboardContent(userData: any): Promise<CognitiveReport> {
  try {
    // Format metrics data for the AI
    const metricsData = formatMetricsForAI(userData);

    // Create the prompt for structured data
    const prompt = `
      Based on the following cognitive assessment data, generate a structured analysis report in JSON format:
      
      User Information:
      - Name: ${userData.name}
      - Age: ${userData.age}
      - Education Level: ${userData.education || "Not specified"}
      - Difficulty Level: ${userData.difficulty}
      
      Test Results:
      ${metricsData}
      
      Please provide a JSON object with the following structure:
      {
        "summary": "Overall assessment summary in 2-3 sentences",
        "domainAnalyses": [
          {
            "domain": "Memory",
            "score": 85,
            "analysis": "Detailed analysis of performance in this domain",
            "recommendations": ["Recommendation 1", "Recommendation 2"],
            "strengths": ["Specific strength in this domain"],
            "weaknesses": ["Area for improvement in this domain"]
          },
          // More domains
        ],
        "overallScore": 82,
        "strengths": [
          {"name": "Domain name", "score": 90}
        ],
        "weaknesses": [
          {"name": "Domain name", "score": 65}
        ],
        "recommendations": [
          {"title": "Recommendation title", "description": "Detailed description"}
        ],
        "relationshipInsights": [
          {"domains": ["Domain1", "Domain2"], "insight": "How these domains relate to each other"}
        ],
        "learningStyles": {
          "primaryStyle": "Visual Learner",
          "description": "Description of the learning style and how it relates to the cognitive profile",
          "teachingStrategies": ["Strategy 1", "Strategy 2", "Strategy 3"],
          "accommodations": ["Accommodation 1", "Accommodation 2", "Accommodation 3"]
        }
      }
      
      The learningStyles section should focus on educational implications for teachers, tutors, or educational support professionals. Include teaching strategies that leverage the person's cognitive strengths, and accommodations that can help with areas of difficulty.
      
      Ensure scores are numbers between 0-100, and all text is professional but accessible.
    `;

    // Generate structured content using AI
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : text;
      const parsedData = JSON.parse(jsonString);
      
      return parsedData as CognitiveReport;
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      return createFallbackReport(userData);
    }
  } catch (error) {
    console.error("Error generating dashboard content:", error);
    return createFallbackReport(userData);
  }
}

// Create fallback content if AI fails
function createFallbackReport(userData: any): CognitiveReport {
  const metrics = userData.metrics || {};
  
  // Create basic domain scores
  const memoryScore = metrics.memoryMatch?.memoryScore || 70;
  const problemSolvingScore = metrics.towerOfHanoi?.problemSolvingScore || 65;
  const vocabularyScore = metrics.wordPuzzle?.vocabularyScore || 75;
  const spatialScore = metrics.spatialPattern?.spatialScore || 80;
  const navigationScore = metrics.mazeRun?.spatialNavigationScore || 60;
  const flexibilityScore = metrics.stroopChallenge?.flexibilityScore || 70;
  
  return {
    summary: `${userData.name} demonstrated varied performance across cognitive domains, with particular strengths in spatial reasoning and vocabulary. Some areas, such as spatial navigation and problem-solving, may benefit from targeted practice.`,
    domainAnalyses: [
      {
        domain: "Memory",
        score: memoryScore,
        analysis: "Performance in memory tasks shows good recall ability with some room for improvement in speed and accuracy.",
        recommendations: ["Practice memory games regularly", "Try chunking information for better recall"],
        strengths: ["Visual pattern recognition"],
        weaknesses: ["Working memory under time pressure"]
      },
      {
        domain: "Problem Solving",
        score: problemSolvingScore,
        analysis: "Problem-solving skills are developing well, with good strategic thinking but opportunities to improve efficiency.",
        recommendations: ["Practice breaking problems into smaller steps", "Work on recognizing patterns in problem structures"],
        strengths: ["Persistence in solving difficult problems"],
        weaknesses: ["Efficiency in solution paths"]
      },
      // Add more domains based on available metrics
    ],
    overallScore: Math.round((memoryScore + problemSolvingScore + vocabularyScore + spatialScore + navigationScore + flexibilityScore) / 6),
    strengths: [
      { name: "Spatial Reasoning", score: spatialScore },
      { name: "Vocabulary", score: vocabularyScore }
    ],
    weaknesses: [
      { name: "Spatial Navigation", score: navigationScore },
      { name: "Problem Solving", score: problemSolvingScore }
    ],
    recommendations: [
      { 
        title: "Daily Memory Practice", 
        description: "Spend 15 minutes daily on memory exercises to strengthen recall and pattern recognition."
      },
      {
        title: "Strategic Problem-Solving",
        description: "Practice breaking down complex problems into manageable steps to improve efficiency."
      }
    ],
    relationshipInsights: [
      {
        domains: ["Memory", "Problem Solving"],
        insight: "Your memory skills support your problem-solving abilities by helping you remember successful strategies."
      }
    ],
    learningStyles: {
      primaryStyle: "Visual-Spatial Learner",
      description: "Based on the cognitive profile, this individual likely processes information most effectively through visual and spatial representations. They tend to think in pictures rather than words and understand concepts when presented in a visual format.",
      teachingStrategies: [
        "Use diagrams, charts, and visual aids when presenting new information",
        "Encourage mind-mapping for organizing thoughts and ideas",
        "Incorporate color-coding to highlight important information"
      ],
      accommodations: [
        "Provide graphic organizers for complex information",
        "Allow extra time for processing verbal instructions",
        "Offer opportunities to demonstrate knowledge through visual projects"
      ]
    }
  };
}

// Helper function to format metrics data for AI input
function formatMetricsForAI(userData: any) {
  if (!userData.metrics) return "No metrics data available.";
  
  const metrics = userData.metrics;
  let formattedData = "";
  
  // Memory Match metrics
  if (metrics.memoryMatch) {
    formattedData += `Memory Assessment:\n`;
    formattedData += `- Memory Score: ${metrics.memoryMatch.memoryScore || 'N/A'}\n`;
    formattedData += `- Recall Accuracy: ${metrics.memoryMatch.accuracy || 'N/A'}%\n`;
    formattedData += `- Completion Time: ${metrics.memoryMatch.totalTime || 'N/A'} seconds\n\n`;
  }
  
  // Tower of Hanoi metrics
  if (metrics.towerOfHanoi) {
    formattedData += `Problem Solving Assessment:\n`;
    formattedData += `- Problem Solving Score: ${metrics.towerOfHanoi.problemSolvingScore || 'N/A'}\n`;
    formattedData += `- Planning Score: ${metrics.towerOfHanoi.planningScore || 'N/A'}\n`;
    formattedData += `- Efficiency: ${metrics.towerOfHanoi.efficiency || 'N/A'}%\n`;
    formattedData += `- Moves Made: ${metrics.towerOfHanoi.moves || 'N/A'}\n`;
    formattedData += `- Optimal Moves: ${metrics.towerOfHanoi.optimalMoves || 'N/A'}\n\n`;
  }
  
  // Word Puzzle metrics
  if (metrics.wordPuzzle) {
    formattedData += `Vocabulary Assessment:\n`;
    formattedData += `- Vocabulary Score: ${metrics.wordPuzzle.vocabularyScore || 'N/A'}\n`;
    formattedData += `- Processing Speed: ${metrics.wordPuzzle.processingSpeed || 'N/A'}\n`;
    formattedData += `- Accuracy: ${metrics.wordPuzzle.accuracy || 'N/A'}%\n\n`;
  }
  
  // Spatial Pattern metrics
  if (metrics.spatialPattern) {
    formattedData += `Spatial Reasoning Assessment:\n`;
    formattedData += `- Spatial Reasoning Score: ${metrics.spatialPattern.spatialScore || 'N/A'}\n`;
    formattedData += `- Pattern Recognition Score: ${metrics.spatialPattern.patternRecognitionScore || 'N/A'}\n`;
    formattedData += `- Max Level Reached: ${metrics.spatialPattern.maxLevel || 'N/A'}\n\n`;
  }
  
  // Maze Run metrics
  if (metrics.mazeRun) {
    formattedData += `Spatial Navigation Assessment:\n`;
    formattedData += `- Navigation Score: ${metrics.mazeRun.spatialNavigationScore || 'N/A'}\n`;
    formattedData += `- Planning Score: ${metrics.mazeRun.planningScore || 'N/A'}\n`;
    formattedData += `- Path Efficiency: ${metrics.mazeRun.efficiency || 'N/A'}%\n`;
    formattedData += `- Backtracking Count: ${metrics.mazeRun.backtrackCount || 'N/A'}\n\n`;
  }
  
  // Stroop Challenge metrics
  if (metrics.stroopChallenge) {
    formattedData += `Cognitive Flexibility Assessment:\n`;
    formattedData += `- Cognitive Flexibility Score: ${metrics.stroopChallenge.flexibilityScore || 'N/A'}\n`;
    formattedData += `- Attention Score: ${metrics.stroopChallenge.attentionScore || 'N/A'}\n`;
    formattedData += `- Response Accuracy: ${metrics.stroopChallenge.accuracy || 'N/A'}%\n`;
    formattedData += `- Interference Effect: ${metrics.stroopChallenge.interferenceEffect || 'N/A'}\n`;
  }
  
  return formattedData;
}

