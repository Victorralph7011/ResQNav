import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Generate initials from user display name or email
  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-14 px-6 bg-[#0A0A0A]/70 backdrop-blur-xl border-b border-white/[0.08]">
      {/* Left: Brand */}
      <Link to="/" className="flex items-center gap-2.5 text-sm font-semibold text-white tracking-tight">
        <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
          <rect x="2" y="2" width="24" height="24" rx="6" stroke="#fff" strokeWidth="2" fill="none" opacity="0.8"/>
          <path d="M9 14L13 18L19 10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        ResQNav
      </Link>

      {/* Center: Links */}
      <div className="hidden md:flex items-center gap-8">
        <Link to="/" className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors">
          Product
        </Link>
        <a href="#features" className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors">
          Features
        </a>
        <a href="#how-it-works" className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors">
          How it Works
        </a>
        <a href="#tech-stack" className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors">
          Tech Stack
        </a>
      </div>

      {/* Right: Auth */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            {/* Profile Avatar */}
            <div className="flex items-center gap-2.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="w-7 h-7 rounded-full border border-white/[0.15] object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-[10px] font-bold text-white/70">
                  {getInitials()}
                </div>
              )}
              <span className="hidden sm:inline text-[13px] text-zinc-500 font-medium">
                {user.displayName || user.email?.split('@')[0]}
              </span>
            </div>

            <Link
              to={userRole === 'responder' ? '/emergency' : '/navigation'}
              className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <LogOut size={14} className="opacity-60" />
              Log out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/auth/commuter"
              className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/auth/commuter"
              className="text-[13px] font-semibold bg-white text-black px-4 py-1.5 rounded-full hover:bg-zinc-200 transition-colors"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
