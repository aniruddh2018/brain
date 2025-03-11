import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with your key
const genAI = new GoogleGenerativeAI("AIzaSyBV1-LQMAl_WlyRNjMOf5D0qq21xFfOGhI");

export async function generateReport(userData: any) {
  try {
    // Format metrics data for the AI
    const metricsData = formatMetricsForAI(userData);

    // Create the prompt for Gemini
    const prompt = `
      Generate a comprehensive cognitive assessment report based on the following data:
      
      User Information:
      - Name: ${userData.name}
      - Age: ${userData.age}
      - Education Level: ${userData.education}
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

    // Generate text using Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Error generating report with Gemini:", error);
    return "There was an error generating your cognitive assessment report. Please try again later.";
  }
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

