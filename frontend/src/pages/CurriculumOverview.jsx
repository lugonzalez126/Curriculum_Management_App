import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'

function gradientFromString(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const h1 = Math.abs(hash % 360)
    const h2 = (h1 + 40) % 360
    return `linear-gradient(135deg, hsl(${h1}, 50%, 82%), hsl(${h2}, 45%, 72%))`
  }

function iconFromTitle(title) {
  const t = title.toLowerCase()
  if (t.includes('python')) return { emoji: 'Py', bg: '#3B82F6' }
  if (t.includes('javascript') || t.includes('js')) return { emoji: 'JS', bg: '#EAB308' }
  if (t.includes('react')) return { emoji: '⚛', bg: '#38BDF8' }
  if (t.includes('html')) return { emoji: '<>', bg: '#F97316' }
  if (t.includes('css')) return { emoji: '#', bg: '#8B5CF6' }
  if (t.includes('data')) return { emoji: '📊', bg: '#10B981' }
  if (t.includes('design')) return { emoji: '🎨', bg: '#EC4899' }
  if (t.includes('math')) return { emoji: '∑', bg: '#6366F1' }
  return { emoji: title.charAt(0).toUpperCase(), bg: '#3B82F6' }
}

export default function CurriculumOverview() {
  const { id } = useParams()
  const [curriculum, setCurriculum] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedModules, setExpandedModules] = useState({})
  const [completed, setCompleted] = useState({})

  useEffect(() => {
    async function fetch() {
      try {
        const res = await api.get(`/curricula/${id}`)
        setCurriculum(res.data)

        const firstPublished = [...(res.data.modules || [])]
          .filter((m) => m.is_published)
          .sort((a, b) => a.order - b.order)[0]
        if (firstPublished) {
          setExpandedModules({ [firstPublished.id]: true })
        }
      } catch (err) {
        console.error('Failed to fetch curriculum', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()

    const stored = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('shelf_completed_')) {
        stored[key.replace('shelf_completed_', '')] = true
      }
    }
    setCompleted(stored)
  }, [id])

  function toggleModule(moduleId) {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }))
  }

  if (loading) {
    return <div className="text-center text-stone-400 py-20">Loading...</div>
  }

  if (!curriculum) {
    return <div className="text-center text-stone-400 py-20">Curriculum not found.</div>
  }

  const modules = [...(curriculum.modules || [])]
    .filter((m) => m.is_published)
    .sort((a, b) => a.order - b.order)

  const icon = iconFromTitle(curriculum.title)

  return (
    <div>
      {/* Full-width Banner (always gradient) */}
      <div
        className="w-full flex items-center justify-center"
        style={{
          minHeight: '220px',
          background: gradientFromString(curriculum.title),
        }}
      >
        <div className="flex items-center gap-3 px-6">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: icon.bg }}
          >
            {icon.emoji}
          </div>
          <h2 className="text-white text-xl font-semibold">{curriculum.title}</h2>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[720px] mx-auto px-12 py-10">
        {/* Creator */}
        <Link
          to={`/creators/${curriculum.creator_username}`}
          className="flex items-center gap-2.5 mb-6 group"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600 group-hover:ring-2 group-hover:ring-blue-200 transition-all">
            {curriculum.creator_avatar_url ? (
              <img src={curriculum.creator_avatar_url} alt={curriculum.creator_username} className="w-full h-full object-cover" />
            ) : (
              curriculum.creator_username?.charAt(0).toUpperCase()
            )}
          </div>
          <span className="text-sm text-stone-500 group-hover:text-stone-700 transition-colors">
            {curriculum.creator_username}
          </span>
        </Link>

        {/* Title & Description */}
        <h1 className="text-[26px] font-bold text-stone-900 mb-3">
          {curriculum.title}
        </h1>
        <p className="text-sm text-stone-500 mb-10 leading-relaxed">
          {curriculum.description}
        </p>

        {/* Module Accordion */}
        <div className="flex flex-col gap-3">
          {modules.map((mod) => {
            const expanded = expandedModules[mod.id]
            const lessons = [...(mod.lessons || [])]
              .filter((l) => l.is_published)
              .sort((a, b) => a.order - b.order)

            return (
              <div
                key={mod.id}
                className="rounded-xl overflow-hidden"
                style={{ border: '0.5px solid #E7E5E4' }}
              >
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  <svg
                    width="16" height="16" viewBox="0 0 16 16" fill="#A8A29E"
                    style={{
                      transform: expanded ? 'rotate(90deg)' : 'rotate(0)',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    <path d="M6 3l5 5-5 5V3z" />
                  </svg>
                  <span className="text-sm font-semibold text-stone-900 flex-1 text-left">
                    {mod.title}
                  </span>
                  <span className="text-xs text-stone-400">
                    {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
                  </span>
                </button>

                {expanded && (
                  <div className="bg-white">
                    {lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        to={`/curricula/${id}/lessons/${lesson.id}`}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50 transition-colors"
                        style={{ borderTop: '0.5px solid #E7E5E4' }}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor: completed[lesson.id] ? '#10B981' : '#D6D3D1',
                          }}
                        />
                        <span className="text-sm text-stone-700 flex-1">
                          {lesson.title}
                        </span>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="#A8A29E">
                          <path d="M6 3l5 5-5 5V3z" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {modules.length === 0 && (
          <div className="text-center text-stone-400 py-16">
            No published content yet.
          </div>
        )}
      </div>
    </div>
  )
}