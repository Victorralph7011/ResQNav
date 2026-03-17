import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, userRole, loading } = useAuth();

  // Still initializing Firebase auth — show a brief loader
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in — redirect to auth page
  if (!user) {
    const authPath = requiredRole === 'responder' ? '/auth/responder' : '/auth/commuter';
    return <Navigate to={authPath} replace />;
  }

  // Role check — only enforce if both requiredRole and userRole are set
  // If userRole is still null (Firestore hasn't responded), let the user through
  // to avoid infinite redirect loops
  if (requiredRole && userRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
