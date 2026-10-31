import { useEffect, useState } from 'react'
import { lines } from './data/song'

export type PracticeEvent = { lineId: number; at: string; action: '选句' | '点读' | '听原唱' | '听正音' }
export type Progress = { status: '未开始' | '练习中' | '已学会'; lastLineId: number | null; history: PracticeEvent[] }

const KEY = 'sandy-cantonese-progress-v1'
const EMPTY: Progress = { status: '未开始', lastLineId: null, history: [] }

function read(): Progress {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Progress | null
    if (value && Array.isArray(value.history) && ['未开始', '练习中', '已学会'].includes(value.status)) return value
  } catch { /* corrupt or unavailable storage */ }
  return EMPTY
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(read)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(progress)) } catch { /* browsing still works */ }
  }, [progress])

  function practice(lineId: number, action: PracticeEvent['action']) {
    setProgress(previous => ({
      status: lineId === lines.length || previous.status === '已学会' ? '已学会' : '练习中',
      lastLineId: lineId,
      history: [{ lineId, at: new Date().toISOString(), action }, ...previous.history].slice(0, 24),
    }))
  }

  function clear() { setProgress(EMPTY) }
  return { progress, practice, clear }
}
