import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import api from '../api/axios'
import CurriculumCard from '../components/CurriculumCard'
import { SkeletonCard } from '../components/Skeleton'

const LIMIT = 20

const FLOATING_CARDS = [
  { title: 'Introduction to Python', x: '8%', y: '15%', rotate: '-12deg', rotateY: '15deg', blur: 0, opacity: 0.9, scale: 0.75 },
  { title: 'Web Development 101', x: '75%', y: '10%', rotate: '10deg', rotateY: '-12deg', blur: 1.5, opacity: 0.6, scale: 0.65 },
  { title: 'Data Structures', x: '2%', y: '55%', rotate: '8deg', rotateY: '10deg', blur: 2, opacity: 0.45, scale: 0.6 },
  { title: 'Machine Learning Basics', x: '80%', y: '58%', rotate: '-6deg', rotateY: '-8deg', blur: 0, opacity: 0.85, scale: 0.7 },
  { title: 'UI/UX Design', x: '35%', y: '5%', rotate: '5deg', rotateY: '20deg', blur: 2.5, opacity: 0.35, scale: 0.55 },
  { title: 'JavaScript Mastery', x: '55%', y: '65%', rotate: '-9deg', rotateY: '-15deg', blur: 1.5, opacity: 0.5, scale: 0.6 },
]

function gradientFromString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h1 = Math.abs(hash % 360)
  const h2 = (h1 + 40) % 360
  return `linear-gradient(135deg, hsl(${h1}, 50%, 82%), hsl(${h2}, 45%, 72%))`
}

export default function DiscoveryPage() {
  const { user } = useAuth()
  const [curricula, setCurricula] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    function handleScroll() {
      requestAnimationFrame(() => setScrollY(window.scrollY))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      try {
        const skip = (page - 1) * LIMIT
        const params = { skip, limit: LIMIT }
        if (search) params.search = search
        const res = await api.get('/curricula', { params })
        setCurricula(res.data.items)
        setTotal(res.data.total)
      } catch (err) {
        console.error('Failed to fetch curricula', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [page, search])

  function handleSearch(e) {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  const totalPages = Math.ceil(total / LIMIT)

  function pageNumbers() {
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }
    return pages
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ minHeight: '380px' }}>
        <div className="absolute inset-0 pointer-events-none">
          {FLOATING_CARDS.map((card, i) => (
            <div
              key={i}
              className="absolute rounded-[14px] overflow-hidden shadow-lg"
              style={{
                left: card.x,
                top: card.y,
                width: '220px',
                aspectRatio: '16 / 10',
                transform: `
                  perspective(900px)
                  rotate(${card.rotate})
                  rotateY(${card.rotateY})
                  scale(${card.scale})
                  translateY(${-scrollY * (0.15 + i * 0.06)}px)
                `,
                filter: card.blur ? `blur(${card.blur}px)` : 'none',
                opacity: card.opacity,
                transition: 'transform 0.1s linear',
                background: gradientFromString(card.title),
                border: '0.5px solid rgba(0,0,0,0.06)',
              }}
            >
              <div className="p-3 h-full flex flex-col justify-between">
                <div>
                  <div className="w-16 h-1.5 rounded-full bg-white/30 mb-2" />
                  <div className="w-24 h-1.5 rounded-full bg-white/20 mb-4" />
                  <div className="flex flex-col gap-1.5">
                    <div className="w-full h-1 rounded-full bg-white/15" />
                    <div className="w-4/5 h-1 rounded-full bg-white/15" />
                    <div className="w-3/5 h-1 rounded-full bg-white/15" />
                  </div>
                </div>
                <p className="text-[8px] text-white/50 font-medium truncate">{card.title}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-12 py-24">
          <h1
            className="font-bold text-stone-900 mb-4 animate-fade-in-up"
            style={{ fontSize: '38px' }}
          >
            Browse. Learn.{' '}
            <span className="text-blue-600">Build your own.</span>
          </h1>
          <p
            className="text-stone-500 mb-8 max-w-md animate-fade-in-up"
            style={{ fontSize: '15px', animationDelay: '0.1s' }}
          >
            Discover expert-built curricula or create and share your own.
          </p>
          <div
            className="flex items-center justify-center gap-3 animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            <Link
              to={user ? '/dashboard' : '/register'}
              className="text-sm font-medium text-stone-50 bg-stone-900 px-6 py-2.5 rounded-lg transition-all hover:bg-stone-700 active:scale-[0.98]"
            >
              Start creating
            </Link>
            <a
              href="#grid"
              className="text-sm font-medium text-stone-900 px-6 py-2.5 rounded-lg transition-colors hover:bg-stone-200"
              style={{ border: '0.5px solid #D6D3D1' }}
            >
              Browse curricula
            </a>
          </div>
        </div>
      </section>

      {/* Search + Grid */}
      <section id="grid" className="max-w-[1200px] mx-auto px-12 pb-16">
        <form onSubmit={handleSearch} className="flex justify-end mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search curricula..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-64 px-4 py-2 text-sm bg-stone-50 text-stone-700 rounded-lg outline-none transition-colors placeholder:text-stone-300 focus:bg-white"
              style={{ border: '0.5px solid #E7E5E4' }}
              onFocus={(e) => (e.target.style.borderColor = '#A8A29E')}
              onBlur={(e) => (e.target.style.borderColor = '#E7E5E4')}
            />
          </div>
        </form>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : curricula.length === 0 ? (
          <div className="text-center text-stone-400 py-20">
            {search ? 'No curricula match your search.' : 'No curricula yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {curricula.map((c, i) => (
              <div
                key={c.id}
                className="card-stagger"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <CurriculumCard curriculum={c} />
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-12">
            {pageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`dot-${i}`} className="px-2 text-stone-400 text-sm">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    p === page
                      ? 'bg-stone-900 text-stone-50'
                      : 'text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>
        )}
      </section>
    </div>
  )
}