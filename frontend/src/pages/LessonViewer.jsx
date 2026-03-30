import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function LessonViewer() {
  const { id, lessonId } = useParams()
  const navigate = useNavigate()
  const [curriculum, setCurriculum] = useState(null)
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedModules, setExpandedModules] = useState({})
  const [completed, setCompleted] = useState({})

  // Fetch curriculum tree + lesson content
  useEffect(() => {
    async function fetch() {
      setLoading(true)
      try {
        const [curRes, lesRes] = await Promise.all([
          api.get(`/curricula/${id}`),
          api.get(`/lessons/${lessonId}`),
        ])
        setCurriculum(curRes.data)
        setLesson(lesRes.data)

        // Expand the module that contains this lesson
        const parentModule = (curRes.data.modules || []).find((m) =>
          (m.lessons || []).some((l) => l.id === lessonId)
        )
        if (parentModule) {
          setExpandedModules((prev) => ({ ...prev, [parentModule.id]: true }))
        }

        // Mark lesson as completed
        localStorage.setItem(`shelf_completed_${lessonId}`, 'true')
      } catch (err) {
        console.error('Failed to fetch', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id, lessonId])

  // Load completed state
  useEffect(() => {
    const stored = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('shelf_completed_')) {
        stored[key.replace('shelf_completed_', '')] = true
      }
    }
    setCompleted(stored)
  }, [lessonId])

  function toggleModule(moduleId) {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }))
  }

  if (loading) {
    return <div className="text-center text-stone-400 py-20">Loading...</div>
  }

  if (!curriculum || !lesson) {
    return <div className="text-center text-stone-400 py-20">Not found.</div>
  }

  // Build flat ordered list of all published lessons for prev/next
  const allLessons = [...(curriculum.modules || [])]
    .filter((m) => m.is_published)
    .sort((a, b) => a.order - b.order)
    .flatMap((m) =>
      [...(m.lessons || [])]
        .filter((l) => l.is_published)
        .sort((a, b) => a.order - b.order)
        .map((l) => ({ ...l, moduleTitle: m.title }))
    )

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  // Find parent module for label
  const parentModule = (curriculum.modules || []).find((m) =>
    (m.lessons || []).some((l) => l.id === lessonId)
  )

  const modules = [...(curriculum.modules || [])]
    .filter((m) => m.is_published)
    .sort((a, b) => a.order - b.order)

  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      {/* Sidebar */}
      {sidebarOpen ? (
        <aside
          className="shrink-0 bg-white overflow-y-auto flex flex-col"
          style={{
            width: '260px',
            borderRight: '0.5px solid #E7E5E4',
            transition: 'width 0.25s ease',
          }}
        >
          {/* Collapse button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2 px-4 py-3 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
            style={{ borderBottom: '0.5px solid #E7E5E4' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M10 3L5 8l5 5V3z" />
            </svg>
            <span className="text-xs">Collapse</span>
          </button>

          {/* Curriculum info */}
          <div className="px-4 py-4" style={{ borderBottom: '0.5px solid #E7E5E4' }}>
            <Link
              to={`/curricula/${id}`}
              className="text-sm font-semibold text-stone-900 hover:text-blue-600 transition-colors line-clamp-2"
            >
              {curriculum.title}
            </Link>
            <p className="text-xs text-stone-400 mt-1">
              by {curriculum.creator_username}
            </p>
          </div>

          {/* Module/Lesson tree */}
          <nav className="flex-1 overflow-y-auto py-2">
            {modules.map((mod) => {
              const expanded = expandedModules[mod.id]
              const lessons = [...(mod.lessons || [])]
                .filter((l) => l.is_published)
                .sort((a, b) => a.order - b.order)

              return (
                <div key={mod.id}>
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    <svg
                      width="12" height="12" viewBox="0 0 16 16" fill="#A8A29E"
                      style={{
                        transform: expanded ? 'rotate(90deg)' : 'rotate(0)',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <path d="M6 3l5 5-5 5V3z" />
                    </svg>
                    <span className="text-xs font-semibold text-stone-700 flex-1 line-clamp-1">
                      {mod.title}
                    </span>
                  </button>

                  {expanded &&
                    lessons.map((l) => {
                      const isActive = l.id === lessonId
                      const isCompleted = completed[l.id]

                      return (
                        <Link
                          key={l.id}
                          to={`/curricula/${id}/lessons/${l.id}`}
                          className="flex items-center gap-2.5 px-4 py-2 pl-8 transition-colors"
                          style={{
                            backgroundColor: isActive ? '#EDE9FE' : 'transparent',
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{
                              backgroundColor: isActive
                                ? '#5B21B6'
                                : isCompleted
                                ? '#10B981'
                                : '#D6D3D1',
                            }}
                          />
                          <span
                            className="text-xs line-clamp-1"
                            style={{
                              color: isActive ? '#5B21B6' : '#44403C',
                              fontWeight: isActive ? 600 : 400,
                            }}
                          >
                            {l.title}
                          </span>
                        </Link>
                      )
                    })}
                </div>
              )
            })}
          </nav>
        </aside>
      ) : (
        /* Collapsed sidebar strip */
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-8 shrink-0 bg-white hover:bg-stone-50 flex items-start justify-center pt-4 cursor-pointer transition-colors"
          style={{ borderRight: '0.5px solid #E7E5E4' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#A8A29E">
            <path d="M6 3l5 5-5 5V3z" />
          </svg>
        </button>
      )}

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div
          className="mx-auto px-12 py-10"
          style={{ maxWidth: sidebarOpen ? '820px' : '820px' }}
        >
          {/* Module label */}
          {parentModule && (
            <p className="text-xs text-stone-400 mb-2">{parentModule.title}</p>
          )}

          {/* Lesson title */}
          <h1 className="text-[28px] font-bold text-stone-900 mb-8">
            {lesson.title}
          </h1>

          {/* Rendered content */}
          <div
            className="prose-editor"
            dangerouslySetInnerHTML={{
              __html: lesson.content && Object.keys(lesson.content).length > 0
                ? jsonToHtml(lesson.content)
                : '<p style="color: #A8A29E;">This lesson has no content yet.</p>',
            }}
          />

          {/* Prev / Next Navigation */}
          <div
            className="flex items-stretch mt-16"
            style={{ borderTop: '0.5px solid #E7E5E4' }}
          >
            {prevLesson ? (
              <Link
                to={`/curricula/${id}/lessons/${prevLesson.id}`}
                className="flex-1 flex items-center gap-3 py-5 pr-4 hover:bg-stone-50 transition-colors group"
              >
                <svg width="20" height="20" viewBox="0 0 16 16" fill="#A8A29E" className="group-hover:fill-stone-600 transition-colors">
                  <path d="M10 3L5 8l5 5V3z" />
                </svg>
                <div>
                  <p className="text-xs text-stone-400">Previous</p>
                  <p className="text-sm font-medium text-stone-700 group-hover:text-stone-900 transition-colors">
                    {prevLesson.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="flex-1" />
            )}

            {nextLesson ? (
              <Link
                to={`/curricula/${id}/lessons/${nextLesson.id}`}
                className="flex-1 flex items-center justify-end gap-3 py-5 pl-4 hover:bg-stone-50 transition-colors group text-right"
                style={{ borderLeft: prevLesson ? '0.5px solid #E7E5E4' : 'none' }}
              >
                <div>
                  <p className="text-xs text-stone-400">Next</p>
                  <p className="text-sm font-medium text-stone-700 group-hover:text-stone-900 transition-colors">
                    {nextLesson.title}
                  </p>
                </div>
                <svg width="20" height="20" viewBox="0 0 16 16" fill="#A8A29E" className="group-hover:fill-stone-600 transition-colors">
                  <path d="M6 3l5 5-5 5V3z" />
                </svg>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// Convert ProseMirror JSON to HTML (simple recursive renderer)
function jsonToHtml(doc) {
  if (!doc || !doc.content) return ''
  return doc.content.map(nodeToHtml).join('')
}

function nodeToHtml(node) {
  if (node.type === 'text') {
    let text = escapeHtml(node.text || '')
    if (node.marks) {
      node.marks.forEach((mark) => {
        switch (mark.type) {
          case 'bold':
            text = `<strong>${text}</strong>`
            break
          case 'italic':
            text = `<em>${text}</em>`
            break
          case 'underline':
            text = `<u>${text}</u>`
            break
          case 'strike':
            text = `<s>${text}</s>`
            break
          case 'code':
            text = `<code>${text}</code>`
            break
          case 'link':
            text = `<a href="${escapeHtml(mark.attrs?.href || '#')}" target="_blank" rel="noopener">${text}</a>`
            break
          case 'highlight':
            text = `<mark>${text}</mark>`
            break
          case 'subscript':
            text = `<sub>${text}</sub>`
            break
          case 'superscript':
            text = `<sup>${text}</sup>`
            break
          case 'textStyle':
            if (mark.attrs?.color) {
              text = `<span style="color:${mark.attrs.color}">${text}</span>`
            }
            break
        }
      })
    }
    return text
  }

  const children = (node.content || []).map(nodeToHtml).join('')
  const align = node.attrs?.textAlign ? ` style="text-align:${node.attrs.textAlign}"` : ''

  switch (node.type) {
    case 'paragraph':
      return `<p${align}>${children || '<br>'}</p>`
    case 'heading':
      const level = node.attrs?.level || 2
      return `<h${level}${align}>${children}</h${level}>`
    case 'bulletList':
      return `<ul>${children}</ul>`
    case 'orderedList':
      return `<ol>${children}</ol>`
    case 'listItem':
      return `<li>${children}</li>`
    case 'taskList':
      return `<ul data-type="taskList">${children}</ul>`
    case 'taskItem':
      const checked = node.attrs?.checked ? ' checked' : ''
      return `<li><input type="checkbox"${checked} disabled />${children}</li>`
    case 'blockquote':
      return `<blockquote>${children}</blockquote>`
    case 'codeBlock':
      return `<pre><code>${children}</code></pre>`
    case 'horizontalRule':
      return '<hr>'
    case 'image':
      return `<img src="${escapeHtml(node.attrs?.src || '')}" alt="${escapeHtml(node.attrs?.alt || '')}" />`
    case 'youtube':
      return `<iframe src="https://www.youtube.com/embed/${extractYoutubeId(node.attrs?.src)}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`
    case 'table':
      return `<table>${children}</table>`
    case 'tableRow':
      return `<tr>${children}</tr>`
    case 'tableCell':
      return `<td>${children}</td>`
    case 'tableHeader':
      return `<th>${children}</th>`
    case 'hardBreak':
      return '<br>'
    default:
      return children
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function extractYoutubeId(url) {
  if (!url) return ''
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([a-zA-Z0-9_-]+)/)
  return match ? match[1] : url
}