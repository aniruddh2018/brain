"use client"

import { useEffect, useRef } from "react"
import {
  Chart,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js"

Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

interface PerformanceTimelineProps {
  data: ChartData<"line">
}

export default function PerformanceTimeline({ data }: PerformanceTimelineProps) {
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

    const options: ChartOptions<"line"> = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: false,
          min: Math.max(0, Math.min(...data.datasets[0].data) - 10),
          max: 100,
          ticks: {
            stepSize: 10,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
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
      elements: {
        line: {
          tension: 0.3,
        },
        point: {
          radius: 4,
          hoverRadius: 6,
        },
      },
    }

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: "line",
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

