import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function CommuterAuth() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { setUserRole } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        // Update the Firebase Auth profile with the user's name
        if (name) {
          await updateProfile(cred.user, { displayName: name });
        }
        await setDoc(doc(db, 'users', cred.user.uid), {
          name,
          email,
          role: 'commuter',
          createdAt: new Date().toISOString(),
        });
        setUserRole('commuter');
        setLoading(false);
        setSuccess('Account created! Redirecting...');
        // Brief delay so user sees the success message
        setTimeout(() => navigate('/navigation'), 800);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        // Fetch user role from Firestore
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'commuter');
          } else {
            setUserRole('commuter');
          }
        }
        setLoading(false);
        navigate('/navigation');
      }
    } catch (err) {
      setLoading(false);
      const map = {
        'auth/email-already-in-use': 'This email is already registered. Try signing in.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
      };
      setError(map[err.code] || err.message.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim());
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          name: result.user.displayName || '',
          email: result.user.email,
          photoURL: result.user.photoURL || '',
          role: 'commuter',
          createdAt: new Date().toISOString(),
        });
      }
      setUserRole(userDoc.exists() ? userDoc.data().role || 'commuter' : 'commuter');
      setLoading(false);
      navigate('/navigation');
    } catch (err) {
      setLoading(false);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim());
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6 pt-14">
      <motion.div
        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[400px]"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white mb-8">
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="24" height="24" rx="6" stroke="#fff" strokeWidth="2" fill="none" opacity="0.6"/>
              <path d="M9 14L13 18L19 10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
            </svg>
            ResQNav
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-2xl font-semibold text-white tracking-tight mb-2"
          >
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="text-[14px] text-zinc-500"
          >
            {isSignUp ? 'Start navigating smarter today.' : 'Sign in to continue to your dashboard.'}
          </motion.p>
        </div>

        {/* Google Sign-In */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 border border-white/[0.08] rounded-lg text-white text-[14px] font-medium hover:bg-white/[0.04] transition-colors mb-6 cursor-pointer disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#fff" fillOpacity="0.8" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
          </svg>
          Continue with Google
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-[12px] text-zinc-600 font-medium">or</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <AnimatePresence>
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-[13px] font-medium text-zinc-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignUp}
                  placeholder="John Doe"
                  className="w-full px-3.5 py-2.5 bg-[#111111] border border-white/[0.08] rounded-lg text-white text-[14px] placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.2] transition-colors"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-[13px] font-medium text-zinc-400 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 bg-[#111111] border border-white/[0.08] rounded-lg text-white text-[14px] placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.2] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-zinc-400 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="··········"
              className="w-full px-3.5 py-2.5 bg-[#111111] border border-white/[0.08] rounded-lg text-white text-[14px] placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.2] transition-colors"
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[13px] text-red-400 bg-red-400/[0.06] border border-red-400/[0.1] rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Success */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-[13px] text-emerald-400 bg-emerald-400/[0.06] border border-emerald-400/[0.1] rounded-lg px-3 py-2"
              >
                <CheckCircle size={14} />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full py-2.5 bg-white text-black text-[14px] font-semibold rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Please wait...' : success ? 'Redirecting...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </motion.form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
            className="text-[13px] text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
          <Link to="/auth/responder" className="text-[13px] text-zinc-600 hover:text-zinc-400 transition-colors">
            Emergency Responder? Access here →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
