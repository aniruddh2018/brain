import { SimpleMetrics } from '@/types/cognitive'

export function Test() {
  const metrics: SimpleMetrics = { score: 100 }
  return <div>{metrics.score}</div>
} 