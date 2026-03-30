import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'
import CurriculumCard from '../components/CurriculumCard'

export default function CreatorPage() {
  const { username } = useParams()
  const [creator, setCreator] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const res = await api.get(`/creators/${username}`)
        setCreator(res.data)
      } catch (err) {
        console.error('Failed to fetch creator', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [username])

  if (loading) {
    return <div className="text-center text-stone-400 py-20">Loading...</div>
  }

  if (!creator) {
    return <div className="text-center text-stone-400 py-20">Creator not found.</div>
  }

  return (
    <div className="max-w-[1200px] mx-auto px-12 py-12">
      {/* Profile */}
      <div className="flex flex-col items-center mb-12">
        {creator.creator_avatar_url ? (
          <img
            src={creator.creator_avatar_url}
            alt={creator.creator_username}
            className="w-[72px] h-[72px] rounded-full object-cover mb-3"
          />
        ) : (
          <div className="w-[72px] h-[72px] rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600 mb-3">
            {creator.creator_username?.charAt(0).toUpperCase()}
          </div>
        )}
        <h1 className="text-xl font-semibold text-stone-900">
          {creator.creator_username}
        </h1>
        <p className="text-[13px] text-stone-400 mt-1">
          {creator.curricula.length} {creator.curricula.length === 1 ? 'curriculum' : 'curricula'}
        </p>
      </div>

      {/* Curricula Grid */}
      {creator.curricula.length === 0 ? (
        <div className="text-center text-stone-400 py-16">
          No published curricula yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
          {creator.curricula.map((c) => (
            <CurriculumCard key={c.id} curriculum={c} showCreator={false} />
          ))}
        </div>
      )}
    </div>
  )
}