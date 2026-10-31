import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, BookOpen, ChevronRight, Clock3, Headphones,
  Home as HomeIcon, Library, MicOff, MoreHorizontal, Music2, Pause, Play, Repeat2, RotateCcw,
  Search as SearchIcon, Settings2, Share2, Shuffle, UserRound, X,
} from 'lucide-react'
import { collection, concerts, daysUntil, lines, originalRange, pronunciationCharUrl, pronunciationLineUrl, song } from './data/song'
import { useProgress } from './state'
import type { PracticeEvent, Progress } from './state'

type Store = ReturnType<typeof useProgress>

function Cover({ className = '' }: { className?: string }) {
  return <img src={song.cover} alt="《没有你还是爱你》专辑封面" className={`aspect-square rounded-2xl object-cover ${className}`} />
}

function Header({ title, back = false }: { title: string; back?: boolean }) {
  const navigate = useNavigate()
  const location = useLocation()
  return <header className="safe-top sticky top-0 z-30 border-b border-black/5 bg-canvas/95 backdrop-blur-xl">
    <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:px-6">
      {back ? <button aria-label="返回" onClick={() => location.key === 'default' ? navigate('/') : navigate(-1)} className="rounded-full p-2 text-accent hover:bg-soft"><ArrowLeft size={23} /></button> : <span className="grid size-10 place-items-center rounded-full bg-accent text-white"><Music2 size={21} fill="currentColor" /></span>}
      <h1 className="min-w-0 flex-1 truncate text-xl font-bold tracking-tight">{title}</h1>
      <button aria-label="前往个人学习页" onClick={() => navigate('/profile')} className="grid size-10 place-items-center rounded-full bg-accent text-white"><UserRound size={20} /></button>
    </div>
  </header>
}

const tabs = [
  { to: '/', label: '首页', Icon: HomeIcon },
  { to: '/study', label: '学习', Icon: Headphones },
  { to: '/profile', label: '我的', Icon: Library },
  { to: '/search', label: '搜索', Icon: SearchIcon },
]

function BottomNav({ dark = false }: { dark?: boolean }) {
  const location = useLocation()
  return <nav aria-label="主导航" className={`safe-bottom fixed inset-x-0 bottom-0 z-30 border-t backdrop-blur-xl ${dark ? 'border-white/10 bg-[#241d22]/95' : 'border-black/5 bg-canvas/95'}`}>
    <div className="mx-auto flex h-17 max-w-lg items-center justify-around">
      {tabs.map(({ to, label, Icon }) => <NavLink key={to} end={to === '/'} to={to} className={({ isActive }) => `flex min-h-12 min-w-15 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${(isActive || (location.pathname === '/collection' && to === '/')) ? dark ? 'text-[#ff718d]' : 'text-accent' : dark ? 'text-white/65' : 'text-muted'}`}><Icon size={22} /><span>{label}</span></NavLink>)}
    </div>
  </nav>
}

function Status({ status }: { status: Progress['status'] }) {
  const tones = status === '已学会' ? 'bg-accent text-white' : status === '练习中' ? 'bg-accent-soft text-[#8c1530]' : 'bg-soft text-muted'
  return <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${tones}`}>{status}</span>
}

function Recent({ history, compact = false }: { history: PracticeEvent[]; compact?: boolean }) {
  const navigate = useNavigate()
  const items = history.slice(0, compact ? 1 : 8)
  if (!items.length) return <div className="rounded-3xl bg-white p-6 text-sm text-muted">还没有练习记录。进入歌曲，点一句歌词开始学习。</div>
  return <div className="space-y-3">{items.map((entry, index) => {
    const line = lines[entry.lineId - 1]
    return <button key={`${entry.at}-${index}`} onClick={() => navigate(`/study?line=${entry.lineId}`)} className="w-full rounded-3xl bg-white p-5 text-left shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between gap-3"><strong className="truncate text-base">{song.title}</strong><span className="shrink-0 text-xs text-muted">{new Date(entry.at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
      <div className="mt-3 rounded-2xl bg-soft p-3"><p className="text-xs text-accent">第 {entry.lineId} 句 · {entry.action}</p><p className="mt-1 line-clamp-2 text-base font-semibold">{line?.text}</p></div>
      <div className="mt-3 flex items-center justify-between text-sm text-muted"><span>继续练这句</span><ArrowRight size={17} className="text-accent" /></div>
    </button>
  })}</div>
}

function Home({ progress }: { progress: Progress }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  return <><Header title="莲話SandyTalk" /><main className="mx-auto max-w-5xl space-y-8 px-4 pb-28 pt-5 sm:px-6">
    <form onSubmit={event => { event.preventDefault(); navigate(`/search?q=${encodeURIComponent(query)}`) }} className="flex h-14 items-center gap-3 rounded-full bg-[#e7e9eb] px-5 shadow-sm"><SearchIcon size={22} className="text-muted" /><input aria-label="搜索歌名或歌词" value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索歌名或歌词…" className="min-w-0 flex-1 border-0 bg-transparent outline-none placeholder:text-muted" /><button type="submit" className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted">搜索</button></form>
    <section className="rounded-[2rem] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <Clock3 size={18} className="self-center text-accent" />
        <h2 className="text-lg font-bold">演出倒计时</h2>
        <span className="text-sm text-muted">Countdown</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {concerts.map(item => {
          const days = daysUntil(item.date)
          return <div key={item.city} className="rounded-2xl bg-soft px-2 py-3 text-center">
            <p className="text-xs text-muted sm:text-sm">{item.city}</p>
            <p className={`mt-1 text-xl font-bold sm:text-2xl ${days > 0 ? 'text-accent' : 'text-ink'}`}>{days > 0 ? days : days === 0 ? '今天' : '已过'}</p>
            <p className="text-xs text-muted">{days > 0 ? '天后' : item.note}</p>
            <p className="mt-1 text-xs font-semibold text-ink">{item.dateLabel}</p>
          </div>
        })}
      </div>
    </section>
    <section>
      <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h2 className="text-xl font-bold">{collection.title}</h2>
        <span className="text-sm text-muted">Resonance 2.0 Cantonese</span>
      </div>
      <button onClick={() => navigate('/collection')} aria-label={`查看${collection.title}`} className="relative flex h-72 w-full overflow-hidden rounded-[2rem] bg-[#a5411e] text-left shadow-sm transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-accent sm:h-80">
        <img src={collection.poster} alt="回响·终章广州站海报" className="absolute inset-0 h-full w-full object-cover object-[center_24%]" />
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
        <span className="relative mt-auto flex w-full items-end justify-between gap-3 p-5 text-white sm:p-7">
          <span><strong className="block text-lg">林忆莲 · 回响·终章</strong><span className="mt-1 block text-sm text-white/85">目前收录 {collection.songCount} 首粤语歌</span></span>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-2 text-sm font-semibold text-accent">查看合辑 <ChevronRight size={16} /></span>
        </span>
      </button>
    </section>
    <section><div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-bold">热门学习 <span className="ml-1 text-sm font-normal text-muted">Top picks</span></h2><span className="rounded-full bg-soft px-3 py-1 text-xs text-muted">第 1 首 / 共 1 首</span></div><button onClick={() => navigate('/study')} className="w-full rounded-[2rem] bg-white p-5 text-left shadow-sm transition hover:shadow-md"><div className="flex gap-4"><Cover className="size-24 shrink-0" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h3 className="text-lg font-bold">{song.title}</h3><Status status={progress.status} /></div><p className="mt-1 text-sm text-muted">{song.artist} · 粤语精选</p><p className="mt-5 text-sm text-muted">逐字粤拼 · 单字点读 · 逐句循环</p></div></div><div className="mt-4 flex items-center justify-between rounded-full bg-soft px-4 py-3 font-semibold text-accent"><span>进入学习</span><ChevronRight size={18} /></div></button></section>
    <section><div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-bold">最近跟唱 <span className="ml-1 text-sm font-normal text-muted">Recently Played</span></h2><span className="text-xs text-muted">本机文字记录</span></div><Recent history={progress.history} compact /></section>
  </main><BottomNav /></>
}

function CollectionPage({ progress }: { progress: Progress }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [actionsOpen, setActionsOpen] = useState(false)
  const [notice, setNotice] = useState('')

  function back() {
    if (location.key === 'default') navigate('/')
    else navigate(-1)
  }

  function randomLine() {
    navigate(`/study?line=${Math.floor(Math.random() * lines.length) + 1}`)
  }

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setNotice('合辑链接已复制')
    } catch {
      setNotice('复制失败，请从浏览器地址栏复制链接')
    }
  }

  return <div className="min-h-screen bg-[#241d22] text-white">
    <header className="safe-top mx-auto flex max-w-lg items-center justify-between px-5 pt-5">
      <button aria-label="返回上一页" onClick={back} className="grid size-11 place-items-center rounded-full border border-white/20 bg-white/10 transition hover:bg-white/20"><ArrowLeft size={24} /></button>
      <div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 p-1">
        <button aria-label="复制合辑链接" onClick={() => void share()} className="grid size-9 place-items-center rounded-full transition hover:bg-white/15"><Share2 size={19} /></button>
        <button aria-label="更多合辑操作" onClick={() => setActionsOpen(true)} className="grid size-9 place-items-center rounded-full transition hover:bg-white/15"><MoreHorizontal size={23} /></button>
      </div>
    </header>
    <main className="mx-auto max-w-lg px-5 pb-44 pt-2">
      <img src={collection.poster} alt="林忆莲回响·终章广州站海报" className="mx-auto mt-2 aspect-square w-[min(72vw,22rem)] rounded-2xl object-cover object-top shadow-[0_20px_50px_rgba(0,0,0,0.35)]" />
      <h1 className="mx-auto mt-7 max-w-sm text-center text-[clamp(1.7rem,7vw,2.25rem)] font-bold leading-tight tracking-tight">{collection.title}</h1>
      <p className="mt-2 text-center text-xl text-white/85">{collection.artist}</p>
      <p className="mt-3 text-center text-sm text-white/55">{collection.detail}</p>
      <div className="mx-auto mt-6 flex max-w-sm items-center justify-center gap-4">
        <button aria-label="随机练一句" onClick={randomLine} className="grid size-14 shrink-0 place-items-center rounded-full bg-white/12 transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"><Shuffle size={24} /></button>
        <button onClick={() => navigate('/study')} className="flex h-14 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-white px-5 text-lg font-bold text-[#241d22] transition hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-white"><Play size={22} fill="currentColor" />开始学习</button>
        <button aria-label="查看我的学习" onClick={() => navigate('/profile')} className="grid size-14 shrink-0 place-items-center rounded-full bg-white/12 transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"><Library size={24} /></button>
      </div>
      {notice && <p role="status" className="mt-4 text-center text-sm text-white/75">{notice}</p>}
      <section aria-label="合辑歌曲" className="mt-8 border-t border-white/20">
        <div className="flex items-center gap-4 border-b border-white/20 py-5">
          <span className="w-5 text-center text-lg text-white/45">1</span>
          <button onClick={() => navigate('/study')} className="min-w-0 flex-1 text-left focus-visible:outline-2 focus-visible:outline-white"><span className="block truncate text-lg font-medium">{song.title}</span><span className="mt-1 block text-sm text-white/55">{song.artist} · {progress.status}</span></button>
          <button aria-label={`更多《${song.title}》操作`} onClick={() => setActionsOpen(true)} className="grid size-9 shrink-0 place-items-center rounded-full text-white/65 transition hover:bg-white/10"><MoreHorizontal size={22} /></button>
        </div>
      </section>
    </main>
    <button onClick={() => navigate('/study')} className="fixed inset-x-4 bottom-18 z-30 mx-auto flex h-15 max-w-lg items-center gap-3 rounded-2xl border border-white/15 bg-[#3d3439]/95 px-3 text-left shadow-xl backdrop-blur-xl"><Cover className="size-11 shrink-0 rounded-lg" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{song.title}</span><span className="block text-xs text-white/60">{song.artist} · 进入学习</span></span><ChevronRight size={22} className="shrink-0 text-white/75" /></button>
    <BottomNav dark />
    {actionsOpen && <div role="dialog" aria-modal="true" aria-label="合辑操作" className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4"><div className="w-full max-w-lg rounded-3xl bg-[#3d3439] p-5 text-white shadow-2xl"><h2 className="text-lg font-bold">合辑操作</h2><div className="mt-4 space-y-2"><button onClick={() => navigate('/study')} className="w-full rounded-2xl bg-white/10 px-4 py-3 text-left">练习《{song.title}》</button><button onClick={randomLine} className="w-full rounded-2xl bg-white/10 px-4 py-3 text-left">随机练一句</button><button onClick={() => setActionsOpen(false)} className="w-full rounded-2xl bg-white px-4 py-3 font-semibold text-[#241d22]">关闭</button></div></div></div>}
  </div>
}

function SearchPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [filter, setFilter] = useState<'all' | 'title' | 'lyrics'>('all')
  const normalized = query.trim().toLocaleLowerCase()
  const titleMatch = normalized && song.title.toLocaleLowerCase().includes(normalized)
  const lyricMatches = useMemo(() => normalized ? lines.filter(line => line.text.toLocaleLowerCase().includes(normalized)) : [], [normalized])
  useEffect(() => { setQuery(params.get('q') ?? '') }, [params])
  return <><Header title="Search" /><main className="mx-auto max-w-3xl px-4 pb-28 pt-5 sm:px-6">
    <form onSubmit={event => { event.preventDefault(); setParams(query ? { q: query } : {}) }} className="flex items-center gap-2"><div className="flex h-13 flex-1 items-center gap-3 rounded-full bg-[#e7e9eb] px-4"><SearchIcon size={20} className="text-muted" /><input autoFocus aria-label="搜索歌名或歌词" value={query} onChange={event => { setQuery(event.target.value); setParams(event.target.value ? { q: event.target.value } : {}, { replace: true }) }} placeholder="搜索歌名或歌词…" className="min-w-0 flex-1 bg-transparent outline-none" />{query && <button type="button" aria-label="清除搜索" onClick={() => { setQuery(''); setParams({}) }}><X size={18} className="text-muted" /></button>}</div><button type="button" onClick={() => navigate('/')} className="font-semibold text-accent">取消</button></form>
    <div className="mt-5 flex gap-2">{([['all', '全部'], ['title', '按歌名'], ['lyrics', '按歌词']] as const).map(([key, label]) => <button key={key} onClick={() => setFilter(key)} className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === key ? 'bg-accent text-white' : 'bg-soft text-muted'}`}>{label}</button>)}</div>
    {!normalized ? <div className="mt-10 rounded-3xl bg-white p-7 text-center text-muted"><SearchIcon size={28} className="mx-auto mb-3" /><p>输入歌名或一句歌词，开始查找。</p></div> : <div className="mt-8 space-y-7">
      {(filter === 'all' || filter === 'title') && titleMatch && <section><h2 className="mb-3 font-bold">歌曲匹配</h2><button onClick={() => navigate('/study')} className="flex w-full items-center gap-4 rounded-3xl bg-white p-4 text-left shadow-sm"><Cover className="size-16 shrink-0" /><span className="flex-1"><strong className="block">{song.title}</strong><span className="text-sm text-muted">{song.artist}</span></span><ChevronRight size={19} /></button></section>}
      {(filter === 'all' || filter === 'lyrics') && lyricMatches.length > 0 && <section><h2 className="mb-3 font-bold">歌词匹配 · {lyricMatches.length} 句</h2><div className="space-y-3">{lyricMatches.map(line => <button key={line.id} onClick={() => navigate(`/study?line=${line.id}`)} className="w-full rounded-3xl bg-white p-5 text-left shadow-sm"><div className="flex items-center justify-between text-xs text-muted"><span>{song.title} · {song.artist}</span><span>第 {line.id} 句</span></div><p className="mt-3 text-lg font-bold">{line.text}</p><p className="mt-1 line-clamp-1 text-xs text-muted">{line.chars.map(item => item.jyutping).filter(Boolean).join(' ')}</p><div className="mt-4 flex items-center justify-between text-sm font-semibold text-accent"><span>定位到这句</span><ArrowRight size={18} /></div></button>)}</div></section>}
      {!((filter === 'all' || filter === 'title') && titleMatch) && !((filter === 'all' || filter === 'lyrics') && lyricMatches.length > 0) && <div className="rounded-3xl bg-white p-8 text-center"><SearchIcon size={28} className="mx-auto text-muted" /><h2 className="mt-3 font-bold">没有找到相关内容</h2><p className="mt-2 text-sm text-muted">第一版仅收录《{song.title}》。</p><button onClick={() => navigate('/study')} className="mt-5 rounded-full bg-accent px-5 py-3 font-semibold text-white">查看这首歌</button></div>}
    </div>}
  </main><BottomNav /></>
}

function Study({ store }: { store: Store }) {
  const [params] = useSearchParams()
  const location = useLocation()
  const requested = Number(params.get('line'))
  const initialId = Number.isInteger(requested) && requested >= 1 && requested <= lines.length ? requested : 1
  const [selected, setSelected] = useState(initialId)
  const [source, setSource] = useState<'original' | 'pronunciation'>('original')
  const [playing, setPlaying] = useState(false)
  const [repeat, setRepeat] = useState(true)
  const [playerOpen, setPlayerOpen] = useState(true)
  const [error, setError] = useState('')
  const [position, setPosition] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const wordRef = useRef<HTMLAudioElement>(null)
  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const current = lines[selected - 1]
  const range = originalRange(selected)
  const url = source === 'original' ? song.audio : pronunciationLineUrl(selected)

  useEffect(() => {
    const id = Number(new URLSearchParams(location.search).get('line'))
    if (Number.isInteger(id) && id >= 1 && id <= lines.length) {
      setSelected(id)
      requestAnimationFrame(() => lineRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
    }
  }, [location.search])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    setPlaying(false)
    setPosition(0)
    audio.src = url
    audio.load()
    if (source === 'original') {
      const seek = () => { audio.currentTime = range.start }
      audio.addEventListener('loadedmetadata', seek, { once: true })
      return () => audio.removeEventListener('loadedmetadata', seek)
    }
  }, [url, selected, source, range.start])

  function chooseLine(id: number) {
    wordRef.current?.pause()
    setSelected(id)
    setPlayerOpen(true)
    store.practice(id, '选句')
    lineRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  async function playWord(char: string) {
    store.practice(selected, '点读')
    audioRef.current?.pause()
    setPlaying(false)
    const audio = wordRef.current
    if (!audio) return
    audio.src = pronunciationCharUrl(char)
    try { await audio.play(); setError('') } catch { setError('这个字的声音暂时无法播放。') }
  }

  async function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false); return }
    wordRef.current?.pause()
    store.practice(selected, source === 'original' ? '听原唱' : '听正音')
    try { await audio.play(); setPlaying(true); setError('') } catch { setError('音频暂时无法播放，请检查浏览器声音设置。') }
  }

  function handleTime() {
    const audio = audioRef.current
    if (!audio) return
    setPosition(source === 'original' ? Math.max(0, audio.currentTime - range.start) : audio.currentTime)
    if (source !== 'original' || audio.currentTime < range.end) return
    if (repeat) { audio.currentTime = range.start; void audio.play() }
    else { audio.pause(); setPlaying(false); audio.currentTime = range.start }
  }

  function handleEnd() {
    const audio = audioRef.current
    if (!audio) return
    if (repeat) { audio.currentTime = source === 'original' ? range.start : 0; void audio.play() }
    else setPlaying(false)
  }

  function replayLine() {
    const audio = audioRef.current
    if (!audio) return
    wordRef.current?.pause()
    audio.currentTime = source === 'original' ? range.start : 0
    setPosition(0)
    store.practice(selected, source === 'original' ? '听原唱' : '听正音')
    void audio.play().then(() => { setPlaying(true); setError('') }).catch(() => setError('音频暂时无法播放。'))
  }

  const duration = source === 'original' ? range.end - range.start : audioRef.current?.duration ?? 0
  const percent = duration > 0 ? Math.max(0, Math.min(100, position / duration * 100)) : 0

  return <><Header title="歌曲学习" back /><main className="mx-auto max-w-3xl px-4 pb-80 pt-5 sm:px-6">
    <div className="flex items-center gap-4"><Cover className="size-16 shrink-0" /><div className="min-w-0 flex-1"><h2 className="truncate text-xl font-bold">{song.title}</h2><p className="text-sm text-muted">{song.artist} · 全曲 {lines.length} 句</p></div><Status status={store.progress.status} /></div>
    <section aria-label="创作团队" className="mt-6 space-y-1.5 px-4 text-xs font-semibold text-muted">{song.credits.map(person => <p key={person.role}>{person.role}：{person.name}</p>)}</section>
    <div className="mt-6 space-y-5">{lines.map(line => <div key={line.id} ref={element => { lineRefs.current[line.id] = element }} className={`rounded-[2rem] p-4 transition ${selected === line.id ? 'bg-white shadow-lg ring-1 ring-accent/10' : 'bg-transparent'}`}>
      <button onClick={() => chooseLine(line.id)} className="w-full text-left" aria-label={`选择第${line.id}句：${line.text}`}><span className="text-xs font-semibold text-muted">第 {line.id} 句 {line.id === lines.length ? '· 最后一句' : ''}</span></button>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-4">{line.chars.map((entry, index) => entry.jyutping ? selected === line.id ? <button key={`${line.id}-${index}`} onClick={() => void playWord(entry.char)} aria-label={`点读 ${entry.char}，${entry.jyutping}`} className="flex min-w-9 flex-col items-center rounded-xl px-1 py-1 transition hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-accent"><span className="text-[11px] text-accent">{entry.jyutping}</span><span className="text-2xl font-semibold">{entry.char}</span></button> : <button key={`${line.id}-${index}`} onClick={() => chooseLine(line.id)} className="flex min-w-7 flex-col items-center text-muted transition hover:text-ink"><span className="text-[10px]">{entry.jyutping}</span><span className="text-xl">{entry.char}</span></button> : <span key={`${line.id}-${index}`} className="self-end text-lg text-muted">{entry.char}</span>)}</div>
      {selected === line.id && <button onClick={() => { setPlayerOpen(true); replayLine() }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-soft px-4 py-3 text-sm font-semibold text-accent">{playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}{playing ? '正在播放这一句' : '练习这一句'}</button>}
    </div>)}</div>
  </main>
    <audio ref={audioRef} onTimeUpdate={handleTime} onEnded={handleEnd} onPause={() => setPlaying(false)} />
    <audio ref={wordRef} />
    {playerOpen && <section aria-label="单句练习播放栏" className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/98 shadow-[0_-12px_40px_rgba(0,0,0,0.1)] backdrop-blur-xl"><div className="mx-auto max-w-3xl p-4 pb-5 sm:px-6"><div className="mb-3 flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold text-accent">第 {selected} 句 · {current.text}</span><button aria-label="收起播放栏" onClick={() => { audioRef.current?.pause(); setPlaying(false); setPlayerOpen(false) }} className="rounded-full bg-soft p-2 text-muted"><X size={18} /></button></div>
      <div className="grid grid-cols-2 rounded-full bg-soft p-1"><button onClick={() => setSource('original')} className={`rounded-full px-2 py-2 text-sm font-semibold ${source === 'original' ? 'bg-white text-ink shadow-sm' : 'text-muted'}`}>原唱片段</button><button onClick={() => setSource('pronunciation')} className={`rounded-full px-2 py-2 text-sm font-semibold ${source === 'pronunciation' ? 'bg-white text-ink shadow-sm' : 'text-muted'}`}>粤语正音朗读</button></div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-soft"><div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${percent}%` }} /></div>
      <div className="mt-4 flex items-center justify-center gap-6"><button aria-label={repeat ? '关闭单句循环' : '开启单句循环'} onClick={() => setRepeat(value => !value)} className={`grid size-11 place-items-center rounded-full ${repeat ? 'bg-accent-soft text-accent' : 'bg-soft text-muted'}`}><Repeat2 size={21} /></button><button aria-label={playing ? '暂停' : '播放'} onClick={() => void togglePlay()} className="grid size-15 place-items-center rounded-full bg-accent text-white shadow-md">{playing ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" />}</button><button aria-label="重播当前句" onClick={replayLine} className="grid size-11 place-items-center rounded-full bg-soft text-muted"><RotateCcw size={20} /></button></div>
      {error && <p role="alert" className="mt-2 text-center text-xs text-accent">{error}</p>}
    </div></section>}
  </>
}

function Profile({ store }: { store: Store }) {
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState(false)
  const learned = store.progress.status === '已学会' ? 1 : 0
  return <><Header title="我的学习" /><main className="mx-auto max-w-3xl space-y-7 px-4 pb-28 pt-5 sm:px-6"><button onClick={() => navigate('/')} className="flex items-center gap-1 text-sm font-semibold text-accent"><ArrowLeft size={16} />返回首页</button>
    <section className="rounded-3xl bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><BookOpen size={19} className="text-accent" /><h2 className="font-bold">学习进度总览</h2></div><div className="mt-5 flex items-end justify-between"><p><strong className="text-4xl">{learned}</strong><span className="text-muted"> / 1 首</span></p><span className="text-sm text-muted">已学会 {learned} 首</span></div><div className="mt-4 h-2 rounded-full bg-soft"><div className="h-full rounded-full bg-accent" style={{ width: `${learned * 100}%` }} /></div><p className="mt-3 text-xs text-muted">本地学习记录</p></section>
    <section><h2 className="mb-3 text-lg font-bold">当前正在学</h2><div className="rounded-3xl bg-white p-5 shadow-sm"><div className="flex gap-4"><Cover className="size-17 shrink-0" /><div className="min-w-0 flex-1"><h3 className="font-bold">{song.title}</h3><p className="text-sm text-muted">{song.artist}</p><div className="mt-2"><Status status={store.progress.status} /></div></div></div><p className="mt-4 rounded-2xl bg-soft p-3 text-sm text-muted">{store.progress.lastLineId ? `上次练到第 ${store.progress.lastLineId} 句：${lines[store.progress.lastLineId - 1]?.text}` : '还没有开始，点下方按钮进入歌曲。'}</p><button onClick={() => navigate(`/study${store.progress.lastLineId ? `?line=${store.progress.lastLineId}` : ''}`)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 font-semibold text-white">进入继续学习 <ArrowRight size={18} /></button></div></section>
    <section><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">最近跟唱文字记录</h2><MicOff size={18} className="text-muted" /></div><Recent history={store.progress.history} /></section>
    <section className="rounded-3xl bg-soft p-5 text-center"><Settings2 size={23} className="mx-auto text-muted" /><h2 className="mt-2 font-bold">本机数据</h2><p className="mt-2 text-xs leading-relaxed text-muted">仅保存进度与练习文字记录。清除浏览器数据后，这些记录可能消失；没有录音文件或跨设备同步。</p><button onClick={() => setConfirm(true)} className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-accent">清除本机学习记录</button></section>
  </main><BottomNav />{confirm && <div role="dialog" aria-modal="true" aria-label="确认清除学习记录" className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-5"><div className="w-full max-w-sm rounded-3xl bg-white p-6"><h2 className="text-lg font-bold">清除学习记录？</h2><p className="mt-2 text-sm text-muted">歌曲状态和最近练习记录会回到初始状态。</p><div className="mt-6 flex gap-3"><button onClick={() => setConfirm(false)} className="flex-1 rounded-full bg-soft px-4 py-3 font-semibold">取消</button><button onClick={() => { store.clear(); setConfirm(false) }} className="flex-1 rounded-full bg-accent px-4 py-3 font-semibold text-white">确认清除</button></div></div></div>}</>
}

export default function App() {
  const store = useProgress()
  const location = useLocation()
  useEffect(() => {
    if (location.pathname === '/study' && new URLSearchParams(location.search).has('line')) return
    window.scrollTo(0, 0)
  }, [location.pathname])
  return <Routes>
    <Route path="/" element={<Home progress={store.progress} />} />
    <Route path="/collection" element={<CollectionPage progress={store.progress} />} />
    <Route path="/search" element={<SearchPage />} />
    <Route path="/study" element={<Study store={store} />} />
    <Route path="/profile" element={<Profile store={store} />} />
    <Route path="*" element={<Home progress={store.progress} />} />
  </Routes>
}
