"use client"

import { useEffect, useRef } from "react"
import { Chart as ChartJS, ArcElement, Tooltip, DoughnutController, type ChartData, type ChartOptions } from "chart.js"

// Register both ArcElement and DoughnutController
ChartJS.register(ArcElement, DoughnutController, Tooltip)

interface ScoreGaugeProps {
  score: number
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<ChartJS | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Determine color based on score
    let color = "#ef4444" // red
    if (score >= 85)
      color = "#22c55e" // green
    else if (score >= 70)
      color = "#3b82f6" // blue
    else if (score >= 50) color = "#f59e0b" // amber

    const data: ChartData<"doughnut"> = {
      datasets: [
        {
          data: [score, 100 - score],
          backgroundColor: [color, "#e5e7eb"],
          borderWidth: 0,
          circumference: 180,
          rotation: 270,
        },
      ],
    }

    const options: ChartOptions<"doughnut"> = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "75%",
      plugins: {
        tooltip: {
          enabled: false,
        },
      },
    }

    // Create new chart
    chartInstance.current = new ChartJS(ctx, {
      type: "doughnut",
      data,
      options,
    })

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [score])

  // Determine label color and text based on score
  let labelColor = "text-red-600"
  let labelText = "Needs Work"

  if (score >= 85) {
    labelColor = "text-green-600"
    labelText = "Excellent"
  } else if (score >= 70) {
    labelColor = "text-blue-600"
    labelText = "Good"
  } else if (score >= 50) {
    labelColor = "text-amber-600"
    labelText = "Average"
  }

  return (
    <div className="relative h-40 w-full">
      <canvas ref={chartRef} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold">{score}</span>
        <span className={`text-sm font-medium ${labelColor}`}>{labelText}</span>
      </div>
    </div>
  )
}

