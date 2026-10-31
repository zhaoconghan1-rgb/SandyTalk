import rawLines from './lyrics.json'

export type Character = { char: string; jyutping: string }
export type LyricLine = { id: number; text: string; chars: Character[] }
export const lines = rawLines as LyricLine[]

export const song = {
  id: 'without-you-still-love-you',
  title: '没有你还是爱你',
  artist: '林忆莲',
  cover: '/images/song-cover.jpg',
  credits: [
    { role: '作词', name: '周礼茂' },
    { role: '作曲', name: 'Beverley Craven' },
    { role: '编曲', name: '杜自持' },
    { role: '监制', name: '许愿' },
  ],
  audio: '/audio/song.mp3',
  duration: 303,
}

export const collection = {
  title: '回响·终章粤语合辑',
  artist: '林忆莲',
  poster: '/images/resonance-poster.jpg',
  detail: '粤语歌学习 · 广州站 2026.12.19',
  songCount: 1,
}

// Line start markers for playback of the supplied song file.
export const originalStarts = [
  18, 21, 26, 30, 34, 38, 41, 55, 58, 63, 66, 71, 75, 80,
  83, 87, 93, 100, 104, 113, 125, 128, 134, 137, 142, 146, 150,
  154, 158, 164, 170, 174, 183, 208, 212, 216, 220, 224, 230,
  236, 240, 249, 261, 265, 271, 278, 282, 292,
]

export function originalRange(lineId: number) {
  const index = Math.max(0, Math.min(originalStarts.length - 1, lineId - 1))
  const start = originalStarts[index]
  const next = originalStarts[index + 1] ?? song.duration
  return { start, end: Math.min(song.duration, Math.max(start + 2, next - 0.15)) }
}

export function pronunciationLineUrl(lineId: number) {
  return `/audio/pronunciation/line-${String(lineId).padStart(3, '0')}.wav`
}

export function pronunciationCharUrl(char: string) {
  return `/audio/pronunciation/char-${char.codePointAt(0)!.toString(16).padStart(4, '0')}.wav`
}

export const concerts = [
  { city: '成都场', date: '2026-11-06', dateLabel: '11.06–11.07', note: '两场' },
  { city: '武汉场', date: '2026-11-21', dateLabel: '11.21', note: '19:00' },
  { city: '广州场', date: '2026-12-19', dateLabel: '12.19', note: '见演出信息' },
]

export function daysUntil(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  const target = Date.UTC(year, month - 1, day)
  const now = new Date()
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.ceil((target - today) / 86_400_000)
}
