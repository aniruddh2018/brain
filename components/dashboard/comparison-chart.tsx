"use client"

import { useEffect, useRef } from "react"
import {
  Chart as ChartJS,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js"

ChartJS.register(BarController, CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface ComparisonChartProps {
  data: ChartData<"bar">
}

export default function ComparisonChart({ data }: ComparisonChartProps) {
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

    const options: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
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
    chartInstance.current = new ChartJS(ctx, {
      type: "bar",
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

