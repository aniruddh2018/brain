"use client"

import { useEffect, useRef } from "react"
import {
  Chart,
  type ChartData,
  type ChartOptions,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js"

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface CognitiveRadarChartProps {
  data: ChartData<"radar">
}

export default function CognitiveRadarChart({ data }: CognitiveRadarChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const options: ChartOptions<"radar"> = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            showLabelBackdrop: false,
            color: "#6b7280",
            font: {
              size: 10,
            },
          },
          pointLabels: {
            font: {
              size: 12,
            },
            color: "#374151",
          },
          grid: {
            color: "rgba(226, 232, 240, 0.6)",
          },
          angleLines: {
            color: "rgba(226, 232, 240, 0.8)",
          },
        },
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 12,
            padding: 20,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(17, 24, 39, 0.8)",
          titleFont: {
            size: 13,
          },
          bodyFont: {
            size: 12,
          },
          padding: 10,
          cornerRadius: 4,
        },
      },
    }

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: "radar",
      data,
      options,
    })

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return <canvas ref={chartRef} />
}

