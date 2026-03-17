import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function ExtremityAuth() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUserRole, user, userRole, loading: authLoading } = useAuth();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate(userRole === 'responder' ? '/emergency' : '/navigation', { replace: true });
    }
  }, [user, userRole, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!department || !badgeNumber) {
          setError('Department Name and Official ID are required for verification.');
          setLoading(false);
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', cred.user.uid), {
          name,
          email,
          role: 'responder',
          department,
          badgeNumber,
          verified: false,
          createdAt: new Date().toISOString(),
        });
        setUserRole('responder');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/emergency');
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6 pt-14">
      <motion.div
        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[440px]"
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
            {isSignUp ? 'Emergency Responder Portal' : 'Responder Sign In'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="text-[14px] text-zinc-500 max-w-sm mx-auto"
          >
            {isSignUp
              ? 'Authorized access for hospital staff, fire departments, and government officials only.'
              : 'Sign in with your verified credentials.'}
          </motion.p>
        </div>

        {/* Security Banner */}
        {isSignUp && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-start gap-3 px-4 py-3 mb-6 rounded-lg border border-white/[0.06] bg-white/[0.02]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 mt-0.5 shrink-0">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <p className="text-[12px] text-zinc-500 leading-relaxed">
              This portal requires government-issued credentials. Your identity will be verified against official records before full access is granted.
            </p>
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {isSignUp && (
            <div>
              <label className="block text-[13px] font-medium text-zinc-400 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isSignUp}
                placeholder="Dr. Jane Smith"
                className="w-full px-3.5 py-2.5 bg-[#111111] border border-white/[0.08] rounded-lg text-white text-[14px] placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.2] transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[13px] font-medium text-zinc-400 mb-1.5">Official Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="jane.smith@gov.in"
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

          {isSignUp && (
            <>
              <div className="pt-2 border-t border-white/[0.04]">
                <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-[0.08em] mb-3">Credential Verification</p>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-zinc-400 mb-1.5">Department Name</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  placeholder="e.g. Mumbai Fire Brigade"
                  className="w-full px-3.5 py-2.5 bg-[#111111] border border-white/[0.08] rounded-lg text-white text-[14px] placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.2] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-zinc-400 mb-1.5">Official ID / Badge Number</label>
                <input
                  type="text"
                  value={badgeNumber}
                  onChange={(e) => setBadgeNumber(e.target.value)}
                  required
                  placeholder="e.g. MFB-2024-0847"
                  className="w-full px-3.5 py-2.5 bg-[#111111] border border-white/[0.08] rounded-lg text-white text-[14px] placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.2] transition-colors"
                />
              </div>
            </>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[13px] text-red-400 bg-red-400/[0.06] border border-red-400/[0.1] rounded-lg px-3 py-2"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-white text-black text-[14px] font-semibold rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Verifying...' : isSignUp ? 'Submit for Verification' : 'Sign In'}
          </button>
        </motion.form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            className="text-[13px] text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            {isSignUp ? 'Already verified? Sign in' : "Need access? Request credentials"}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
          <Link to="/auth/commuter" className="text-[13px] text-zinc-600 hover:text-zinc-400 transition-colors">
            ← Regular user? Sign up here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
