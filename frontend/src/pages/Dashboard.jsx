import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import api from '../api/axios'
import ConfirmDelete from '../components/ConfirmDelete'

function gradientFromString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h1 = Math.abs(hash % 360)
  const h2 = (h1 + 40) % 360
  return `linear-gradient(135deg, hsl(${h1}, 50%, 82%), hsl(${h2}, 45%, 72%))`
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [curricula, setCurricula] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingAvatar, setEditingAvatar] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    async function fetch() {
      try {
        const res = await api.get('/curricula/mine')
        setCurricula(res.data)
      } catch (err) {
        console.error('Failed to fetch curricula', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  async function handleCreateCurriculum() {
    try {
      const res = await api.post('/curricula', {
        title: 'Untitled Curriculum',
        description: '',
      })
      navigate(`/dashboard/curricula/${res.data.id}/edit`)
    } catch (err) {
      console.error('Failed to create curriculum', err)
    }
  }

  async function handleDeleteCurriculum(curriculumId) {
    const backup = curricula
    setCurricula((prev) => prev.filter((c) => c.id !== curriculumId))
    try {
      await api.delete(`/curricula/${curriculumId}`)
    } catch (err) {
      console.error('Failed to delete curriculum', err)
      setCurricula(backup)
    }
  }

  async function handleAvatarSave() {
    try {
      await api.patch('/auth/me', { avatar_url: avatarUrl || null })
      setEditingAvatar(false)
    } catch (err) {
      console.error('Failed to update avatar', err)
    }
  }

  return (
    <div className="max-w-[960px] mx-auto px-12 py-12">
      {/* Profile Card */}
      <div className="flex items-center gap-4 mb-12">
        <button
          onClick={() => setEditingAvatar(!editingAvatar)}
          className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-lg font-semibold text-blue-600 shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all"
        >
          U
        </button>
        <div>
          <h1 className="text-lg font-semibold text-stone-900">My Dashboard</h1>
          <p className="text-sm text-stone-400">Manage your curricula</p>
        </div>
      </div>

      {editingAvatar && (
        <div className="flex items-center gap-2 mb-8 -mt-6 ml-[72px]">
          <input
            type="text"
            placeholder="Paste avatar URL..."
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm bg-stone-50 text-stone-700 rounded-lg outline-none placeholder:text-stone-300 focus:bg-white"
            style={{ border: '0.5px solid #E7E5E4' }}
          />
          <button
            onClick={handleAvatarSave}
            className="text-sm font-medium text-stone-50 bg-stone-900 px-4 py-1.5 rounded-lg hover:bg-stone-700 cursor-pointer"
          >
            Save
          </button>
          <button
            onClick={() => setEditingAvatar(false)}
            className="text-sm text-stone-400 hover:text-stone-600 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-stone-900">My Curricula</h2>
        <button
          onClick={handleCreateCurriculum}
          className="text-sm font-medium text-stone-50 bg-stone-900 px-4 py-2 rounded-lg transition-all hover:bg-stone-700 active:scale-[0.98] cursor-pointer"
        >
          New curriculum
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center text-stone-400 py-20">Loading...</div>
      ) : curricula.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-stone-400 mb-4">You haven't created any curricula yet.</p>
          <button
            onClick={handleCreateCurriculum}
            className="text-sm font-medium text-stone-50 bg-stone-900 px-6 py-2.5 rounded-lg hover:bg-stone-700 active:scale-[0.98] cursor-pointer"
          >
            Create your first curriculum
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {curricula.map((c) => (
            <div key={c.id} className="relative group">
              {/* Badge */}
              <div
                className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: c.is_published ? '#D1FAE5' : '#FEF3C7',
                  color: c.is_published ? '#065F46' : '#92400E',
                }}
              >
                {c.is_published ? 'Published' : 'Draft'}
              </div>

              {/* Delete Button */}
              <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <ConfirmDelete
                  onConfirm={() => handleDeleteCurriculum(c.id)}
                  label="🗑"
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/90 shadow-sm text-stone-400 hover:text-red-500 transition-colors text-xs"
                />
              </div>

              <Link to={`/dashboard/curricula/${c.id}/edit`} className="block">
                <div className={`${!c.is_published ? 'opacity-70' : ''}`}>
                  {/* Cover */}
                  <div
                    className="rounded-[14px] overflow-hidden transition-all duration-250 ease-out hover:-translate-y-1"
                    style={{
                      aspectRatio: '16 / 10',
                      border: '0.5px solid rgba(0,0,0,0.06)',
                      background: c.cover_image_url
                        ? undefined
                        : gradientFromString(c.title),
                    }}
                  >
                    {c.cover_image_url && (
                      <img
                        src={c.cover_image_url}
                        alt={c.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  {/* Title */}
                  <div className="mt-3">
                    <p className="text-sm font-medium text-stone-900 line-clamp-1">
                      {c.title}
                    </p>
                    <p className="text-xs text-stone-400 line-clamp-1">
                      {c.description || 'No description'}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}

          {/* Add Card */}
          <button
            onClick={handleCreateCurriculum}
            className="rounded-[14px] flex flex-col items-center justify-center gap-2 text-stone-400 hover:text-stone-500 hover:border-stone-300 transition-colors cursor-pointer"
            style={{
              aspectRatio: '16 / 10',
              border: '1.5px dashed #D6D3D1',
            }}
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-sm font-medium">Add curriculum</span>
          </button>
        </div>
      )}
    </div>
  )
}