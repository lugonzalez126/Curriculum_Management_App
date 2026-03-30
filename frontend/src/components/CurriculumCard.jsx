import { Link } from 'react-router-dom'

// Generate a consistent gradient from a string (title)
function gradientFromString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h1 = Math.abs(hash % 360)
  const h2 = (h1 + 40) % 360
  return `linear-gradient(135deg, hsl(${h1}, 50%, 82%), hsl(${h2}, 45%, 72%))`
}

export default function CurriculumCard({ curriculum, showCreator = true }) {
  const { id, title, description, cover_image_url, creator_username } = curriculum

  return (
    <div className="group">
      {/* Cover */}
      <Link to={`/curricula/${id}`}>
        <div
          className="rounded-[14px] overflow-hidden transition-all duration-250 ease-out group-hover:-translate-y-1"
          style={{
            aspectRatio: '16 / 10',
            border: '0.5px solid rgba(0,0,0,0.06)',
          }}
        >
          {cover_image_url ? (
            <img
              src={cover_image_url}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: gradientFromString(title) }}
            />
          )}
        </div>
      </Link>

      {/* Metadata */}
      <div className="mt-3 flex items-start gap-2.5">
        {showCreator && (
          <Link
            to={`/creators/${creator_username}`}
            className="shrink-0 w-[26px] h-[26px] rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-semibold text-blue-600 mt-0.5 hover:ring-2 hover:ring-blue-200 transition-all"
          >
            {creator_username?.charAt(0).toUpperCase()}
          </Link>
        )}
        <div className="min-w-0">
          <Link
            to={`/curricula/${id}`}
            className="text-sm font-medium text-stone-900 hover:text-blue-600 transition-colors line-clamp-1"
          >
            {title}
          </Link>
          {showCreator ? (
            <Link
              to={`/creators/${creator_username}`}
              className="text-xs text-stone-400 hover:text-stone-500 transition-colors"
            >
              {creator_username}
            </Link>
          ) : (
            <p className="text-xs text-stone-400 line-clamp-2">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}