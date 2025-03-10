import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function generateReport(userData: any) {
  try {
    // Format metrics data for the AI
    const metricsData = formatMetricsForAI(userData)

    // Generate report using Gemini API
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
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
      maxTokens: 1500,
    })

    return text
  } catch (error) {
    console.error("Error generating report:", error)
    return "There was an error generating your cognitive assessment report. Please try again later."
  }
}

function formatMetricsForAI(userData: any) {
  const metrics = userData.metrics

  return `
    Memory Match:
    - Memory Score: ${metrics.memoryMatch.memoryScore}/100
    - Accuracy: ${metrics.memoryMatch.accuracy.toFixed(1)}%
    - Average Reaction Time: ${metrics.memoryMatch.avgReactionTime.toFixed(2)} seconds
    - Total Time: ${metrics.memoryMatch.totalTime.toFixed(1)} seconds
    
    Tower of Hanoi:
    - Problem Solving Score: ${metrics.towerOfHanoi.problemSolvingScore}/100
    - Planning Score: ${metrics.towerOfHanoi.planningScore}/100
    - Efficiency: ${metrics.towerOfHanoi.efficiency.toFixed(1)}%
    - Moves Used: ${metrics.towerOfHanoi.moves} (Optimal: ${metrics.towerOfHanoi.optimalMoves})
    
    Word Puzzle:
    - Vocabulary Score: ${metrics.wordPuzzle.vocabularyScore}/100
    - Processing Speed: ${metrics.wordPuzzle.processingSpeed}/100
    - Accuracy: ${metrics.wordPuzzle.accuracy.toFixed(1)}%
    - Average Word Time: ${metrics.wordPuzzle.avgWordTime.toFixed(2)} seconds
    
    Spatial Pattern:
    - Spatial Reasoning Score: ${metrics.spatialPattern.spatialScore}/100
    - Pattern Recognition Score: ${metrics.spatialPattern.patternRecognitionScore}/100
    - Maximum Pattern Length: ${metrics.spatialPattern.maxPatternLength}
    - Reaction Time: ${metrics.spatialPattern.reactionTime.toFixed(2)} seconds
    
    Maze Run:
    - Spatial Navigation Score: ${metrics.mazeRun.spatialNavigationScore}/100
    - Planning Score: ${metrics.mazeRun.planningScore}/100
    - Efficiency: ${metrics.mazeRun.efficiency.toFixed(1)}%
    - Backtrack Count: ${metrics.mazeRun.backtrackCount}
    
    Stroop Challenge:
    - Cognitive Flexibility Score: ${metrics.stroopChallenge.cognitiveFlexibilityScore}/100
    - Attention Control Score: ${metrics.stroopChallenge.attentionControlScore}/100
    - Accuracy: ${metrics.stroopChallenge.accuracy.toFixed(1)}%
    - Interference Effect: ${metrics.stroopChallenge.interferenceEffect.toFixed(2)} seconds
  `
}

