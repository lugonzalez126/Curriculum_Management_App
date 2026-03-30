import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  const isActive = (path) => location.pathname === path

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleLogout() {
    setShowMenu(false)
    await logout()
    navigate('/')
  }

  const initial = user?.username?.charAt(0).toUpperCase() || 'U'
  const avatarUrl = user?.avatar_url

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-12 h-14"
      style={{
        backgroundColor: 'rgba(250,250,249,0.9)',
        backdropFilter: 'blur(8px)',
        borderBottom: '0.5px solid #E7E5E4',
      }}
    >
      <div className="flex items-center gap-8">
        <Link
          to="/"
          className="font-bold text-stone-900"
          style={{ fontSize: '17px', letterSpacing: '-0.5px' }}
        >
          shelf
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          <Link
            to="/"
            className={isActive('/') ? 'text-stone-900' : 'text-stone-400'}
            style={{ transition: 'color 0.15s' }}
          >
            Explore
          </Link>
          <span className="text-stone-300 cursor-default">Categories</span>
          <span className="text-stone-300 cursor-default">Trending</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link
              to="/dashboard"
              className="text-sm font-medium text-stone-900 px-4 py-1.5 rounded-lg transition-colors hover:bg-stone-200"
              style={{ border: '0.5px solid #D6D3D1' }}
            >
              Dashboard
            </Link>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-xs font-semibold cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all"
                style={{
                  backgroundColor: avatarUrl ? 'transparent' : '#DBEAFE',
                  color: avatarUrl ? 'transparent' : '#2563EB',
                }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </button>
              {showMenu && (
                <div
                  className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg py-1"
                  style={{ border: '0.5px solid #E7E5E4' }}
                >
                  <div className="px-4 py-2" style={{ borderBottom: '0.5px solid #E7E5E4' }}>
                    <p className="text-sm font-medium text-stone-900">{user.username}</p>
                    <p className="text-xs text-stone-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm font-medium text-stone-900 px-4 py-1.5 rounded-lg transition-colors hover:bg-stone-200"
              style={{ border: '0.5px solid #D6D3D1' }}
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium text-stone-50 bg-stone-900 px-4 py-1.5 rounded-lg transition-colors hover:bg-stone-700"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}