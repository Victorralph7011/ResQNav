import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import {
  MessageSquare,
  Plus,
  Send,
  Paperclip,
  X,
  ChevronLeft,
  Trash2,
  AlertTriangle,
  MapPin,
  Shield,
  Image as ImageIcon,
  Loader2,
  LogOut,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const GUEST_LIMIT = 2;

/* ─── Markdown Parser ─── */
const parseAIMessage = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(
      /^\*\s+(.*)$/gm,
      '<div class="flex items-start mt-1"><span class="text-emerald-500 mr-2 mt-0.5">•</span><span>$1</span></div>'
    )
    .replace(/\n/g, '<br />');
};

/* ═══════════════════════════════════════════════════
   SIDEBAR
   ═══════════════════════════════════════════════════ */
function Sidebar({
  chats,
  activeChat,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  collapsed,
  onClearHistory,
  user,
}) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 0 : 260 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-full bg-[#0A0A0A] border-r border-white/[0.06] flex flex-col overflow-hidden shrink-0"
    >
      <div className="flex flex-col h-full min-w-[260px]">
        {/* New Chat */}
        <div className="p-4">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-colors text-[13px] font-medium text-white/80 cursor-pointer"
          >
            <Plus size={15} className="opacity-50" />
            New Chat
          </button>
        </div>

        {/* Recent Logs */}
        <div className="flex-1 overflow-y-auto px-3">
          <div className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.15em] px-2 mb-2">
            Recent
          </div>
          {chats.length === 0 ? (
            <p className="text-[11px] text-zinc-700 px-2 italic">No active logs.</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg mb-0.5 text-[12px] transition-colors cursor-pointer ${
                  activeChat === chat.id
                    ? 'bg-white/[0.06] text-white'
                    : 'text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300'
                }`}
              >
                <button
                  onClick={() => onSelectChat(chat.id)}
                  className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer"
                >
                  <MessageSquare size={12} className="opacity-40 shrink-0" />
                  <span className="truncate">{chat.title}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center hover:bg-red-500/[0.15] transition-all cursor-pointer shrink-0 ml-1"
                  title="Delete chat"
                >
                  <Trash2 size={12} className="text-red-400/70" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.06] space-y-1">
          {user && chats.length > 0 && (
            <button
              onClick={onClearHistory}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors cursor-pointer"
            >
              <Trash2 size={14} className="opacity-60" />
              Clear All History
            </button>
          )}

          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="w-7 h-7 rounded-full border border-white/[0.1] object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[11px] font-bold text-emerald-400">
                {user?.email?.[0]?.toUpperCase() || 'G'}
              </div>
            )}
            <span className="text-[12px] text-white/70 font-medium truncate">
              {user?.displayName || user?.email?.split('@')[0] || 'Guest'}
            </span>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.03] transition-colors"
          >
            <ChevronLeft size={14} className="opacity-50" />
            Back to Home
          </Link>
        </div>
      </div>
    </motion.aside>
  );
}

/* ═══════════════════════════════════════════════════
   MESSAGE BUBBLE
   ═══════════════════════════════════════════════════ */
function MessageBubble({ message, index }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[75%] ${isUser ? '' : 'flex gap-3'}`}>
        {!isUser && (
          <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0 mt-1">
            <Shield size={13} className="text-white/40" />
          </div>
        )}

        <div>
          {message.image && (
            <div className={`mb-2 ${isUser ? 'flex justify-end' : ''}`}>
              <img
                src={message.image}
                alt="Uploaded"
                className="max-w-[240px] max-h-[180px] rounded-xl border border-white/[0.08] object-cover"
              />
            </div>
          )}

          <div
            className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed break-words ${
              isUser
                ? 'bg-white text-black rounded-br-md whitespace-pre-wrap'
                : 'bg-white/[0.04] border border-white/[0.06] text-zinc-300 rounded-bl-md'
            }`}
          >
            {isUser ? (
              message.text
            ) : (
              <div
                className="ai-message-content"
                dangerouslySetInnerHTML={{ __html: parseAIMessage(message.text) }}
              />
            )}
          </div>

          <div className={`text-[9px] text-zinc-700 mt-1 ${isUser ? 'text-right' : ''}`}>
            {message.time}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   TYPING INDICATOR
   ═══════════════════════════════════════════════════ */
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-start gap-3 mb-4"
    >
      <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
        <Shield size={13} className="text-white/40" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/[0.04] border border-white/[0.06] flex items-center gap-2">
        <Loader2 size={14} className="text-zinc-500 animate-spin" />
        <span className="text-[12px] text-zinc-500">Verifying...</span>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   WELCOME SCREEN
   ═══════════════════════════════════════════════════ */
function WelcomeScreen() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-center px-6"
      >
        <h1 className="text-[32px] font-bold text-white tracking-tight mb-2">
          ResQNav Chat Engine
        </h1>
        <p className="text-[13px] text-zinc-600 mb-10">
          System Online. Incident Verification Active.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
          {[
            { icon: AlertTriangle, label: 'Report Incidents', desc: 'Accidents, potholes, closures' },
            { icon: MapPin, label: 'Traffic Updates', desc: 'Road conditions & routing' },
            { icon: ImageIcon, label: 'Image Verification', desc: 'Upload photos for AI analysis' },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left hover:bg-white/[0.04] transition-colors"
            >
              <item.icon size={18} className="text-zinc-600 mb-2" />
              <div className="text-[12px] font-semibold text-white/80 mb-0.5">{item.label}</div>
              <div className="text-[10px] text-zinc-700">{item.desc}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   CHAT INPUT BAR
   ═══════════════════════════════════════════════════ */
function ChatInputBar({ onSend, disabled, guestLocked }) {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef(null);
  const inputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSend = () => {
    if ((!text.trim() && !imageFile) || disabled || guestLocked) return;
    onSend(text.trim(), imageFile, imagePreview);
    setText('');
    clearImage();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isFullyDisabled = disabled || guestLocked;

  return (
    <div className="px-4 pb-4 pt-2">
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2"
          >
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-[100px] rounded-lg border border-white/[0.08] object-cover"
              />
              <button
                onClick={clearImage}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-zinc-800 border border-white/[0.1] flex items-center justify-center hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <X size={10} className="text-white/60" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`flex items-end gap-2 backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-2.5 ${
          guestLocked ? 'opacity-40 pointer-events-none' : ''
        }`}
      >
        <button
          onClick={() => fileRef.current?.click()}
          disabled={isFullyDisabled}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/[0.06] transition-colors disabled:opacity-30 cursor-pointer shrink-0"
        >
          <Paperclip size={17} className="text-zinc-500" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isFullyDisabled}
          placeholder={
            guestLocked
              ? 'Demo limit reached — sign in to continue'
              : 'Report an incident, ask about traffic...'
          }
          style={{ color: '#ffffff', caretColor: '#ffffff' }}
          className="flex-1 bg-transparent text-[13px] placeholder:text-zinc-700 focus:outline-none py-1.5 disabled:opacity-40"
        />

        <button
          onClick={handleSend}
          disabled={(!text.trim() && !imageFile) || isFullyDisabled}
          className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.12] transition-colors disabled:opacity-20 cursor-pointer shrink-0"
        >
          <Send size={15} className="text-white/60" />
        </button>
      </div>

      <p className="text-[9px] text-zinc-800 text-center mt-2">
        ResQNav Chat Engine — Domain-limited to road incidents, traffic & emergency routing
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN CHAT APP — FIXED STATE MANAGEMENT
   ═══════════════════════════════════════════════════ */
export default function ChatApp() {
  const { user, loading: authLoading, logout } = useAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [guestMessageCount, setGuestMessageCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const scrollRef = useRef(null);

  // Use a ref for activeChatId so handleSend always has the latest value
  const activeChatIdRef = useRef(null);
  const setActiveChat = (id) => {
    activeChatIdRef.current = id;
    setActiveChatId(id);
  };

  const guestLocked = !user && guestMessageCount >= GUEST_LIMIT;

  // ─── Auto-scroll ───
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // ─── FIX #1: Component mount / routing state initialization ───
  // When user changes (login/logout/route), reset and load data
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Logged out — reset to clean guest state
      setChats([]);
      setActiveChat(null);
      setMessages([]);
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }

    // Logged in — load chats from Firestore
    let cancelled = false;

    const loadChats = async () => {
      try {
        const chatsRef = collection(db, 'users', user.uid, 'chats');
        const chatsSnap = await getDocs(query(chatsRef, orderBy('createdAt', 'desc')));

        if (cancelled) return;

        const loadedChats = chatsSnap.docs.map((d) => ({
          id: d.id,
          title: d.data().title || 'Untitled',
          messages: [], // will load on select
        }));

        setChats(loadedChats);

        // If there are existing chats, select the most recent one and load its messages
        if (loadedChats.length > 0) {
          const firstChatId = loadedChats[0].id;
          setActiveChat(firstChatId);
          const msgsRef = collection(db, 'users', user.uid, 'chats', firstChatId, 'messages');
          const msgsSnap = await getDocs(query(msgsRef, orderBy('createdAt', 'asc')));
          if (!cancelled) {
            setMessages(msgsSnap.docs.map((d) => d.data()));
          }
        } else {
          // No existing chats — start fresh with null chatId (ready for new chat)
          setActiveChat(null);
          setMessages([]);
        }
      } catch (err) {
        console.error('Failed to load chats from Firestore:', err);
        // Don't block the UI — just start with empty state
        if (!cancelled) {
          setChats([]);
          setActiveChat(null);
          setMessages([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    loadChats();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  // ─── Select chat from sidebar ───
  const handleSelectChat = useCallback(
    async (chatId) => {
      setActiveChat(chatId);
      setMessages([]);
      setIsLoading(false);

      if (!user) return;

      try {
        const msgsRef = collection(db, 'users', user.uid, 'chats', chatId, 'messages');
        const msgsSnap = await getDocs(query(msgsRef, orderBy('createdAt', 'asc')));
        setMessages(msgsSnap.docs.map((d) => d.data()));
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    },
    [user]
  );

  // ─── FIX #2: startNewChat — clean reset ───
  const startNewChat = useCallback(() => {
    setActiveChat(null); // null = no Firestore doc yet, will be created on first message
    setMessages([]);
    setIsLoading(false);
  }, []);

  // ─── Save message to Firestore (fire-and-forget, never blocks UI) ───
  const saveMessageToFirestore = (chatId, msg) => {
    if (!user || !chatId) return;
    const msgId = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    setDoc(
      doc(db, 'users', user.uid, 'chats', chatId, 'messages', msgId),
      { ...msg, createdAt: serverTimestamp() }
    ).catch((err) => console.error('Failed to save message to Firestore:', err));
  };

  // ─── Delete a single chat ───
  const deleteChat = async (chatId) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (activeChatIdRef.current === chatId) {
      setActiveChat(null);
      setMessages([]);
    }

    if (!user) return;
    try {
      const msgsRef = collection(db, 'users', user.uid, 'chats', chatId, 'messages');
      const msgsSnap = await getDocs(msgsRef);
      if (msgsSnap.docs.length > 0) {
        const batch = writeBatch(db);
        msgsSnap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
      await deleteDoc(doc(db, 'users', user.uid, 'chats', chatId));
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  // ─── Clear all chat history ───
  const clearHistory = async () => {
    const oldChats = [...chats];
    setChats([]);
    setMessages([]);
    setActiveChat(null);

    if (!user) return;
    try {
      for (const chat of oldChats) {
        const msgsRef = collection(db, 'users', user.uid, 'chats', chat.id, 'messages');
        const msgsSnap = await getDocs(msgsRef);
        if (msgsSnap.docs.length > 0) {
          const batch = writeBatch(db);
          msgsSnap.docs.forEach((d) => batch.delete(d.ref));
          await batch.commit();
        }
        await deleteDoc(doc(db, 'users', user.uid, 'chats', chat.id));
      }
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const getTime = () =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const openAuth = (msg = '') => {
    setAuthMessage(msg);
    setShowAuthModal(true);
  };

  // ─── FIX #3: handleSend — bulletproof, UI-first, Firestore-second ───
  const handleSend = async (text, imageFile, imagePreview) => {
    // Guest limit check
    if (!user) {
      if (guestMessageCount >= GUEST_LIMIT) {
        openAuth('Demo limit reached. Sign in to continue verifying incidents.');
        return;
      }
      setGuestMessageCount((c) => c + 1);
    }

    const title = text?.slice(0, 40) || 'Image Analysis';

    // ─── STEP 1: Ensure we have a chat ID ───
    let chatId = activeChatIdRef.current;

    if (!chatId) {
      // No active chat — create one NOW
      chatId = Date.now().toString();
      setActiveChat(chatId);
      setChats((prev) => [{ id: chatId, title }, ...prev]);

      // Create Firestore doc (fire-and-forget)
      if (user) {
        setDoc(doc(db, 'users', user.uid, 'chats', chatId), {
          title,
          createdAt: serverTimestamp(),
        }).catch((err) => console.error('Failed to create chat doc:', err));
      }
    } else if (messages.length === 0 && text) {
      // First message in an existing empty chat — update the title
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, title } : c))
      );
      if (user) {
        setDoc(
          doc(db, 'users', user.uid, 'chats', chatId),
          { title, createdAt: serverTimestamp() },
          { merge: true }
        ).catch((err) => console.error('Failed to update chat title:', err));
      }
    }

    // ─── STEP 2: Add user message to UI IMMEDIATELY (before any async) ───
    const userMsg = {
      role: 'user',
      text: text || '📷 Image uploaded for verification',
      image: imagePreview || null,
      time: getTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Save user message to Firestore (fire-and-forget)
    saveMessageToFirestore(chatId, { ...userMsg, image: null });

    // Show auth modal after last free guest message
    if (!user && guestMessageCount + 1 >= GUEST_LIMIT) {
      setTimeout(() => {
        openAuth('Demo limit reached. Sign in to continue verifying incidents.');
      }, 3000);
    }

    // ─── STEP 3: Call backend API ───
    try {
      const formData = new FormData();
      formData.append('message', text || 'Analyze this image for road incidents.');
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await axios.post(`${API_URL}/api/chat`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      const aiMsg = { role: 'ai', text: res.data.reply, time: getTime() };
      setMessages((prev) => [...prev, aiMsg]);
      saveMessageToFirestore(chatId, aiMsg);
    } catch (err) {
      console.error('API call failed:', err);
      const errorMsg = {
        role: 'ai',
        text:
          err.response?.data?.error ||
          '⚠ Connection failed. Make sure the server is running on port 5000 and GEMINI_API_KEY is set.',
        time: getTime(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── FIX #4: Loading gate — show spinner only during auth init ───
  if (authLoading) {
    return (
      <div className="h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 size={24} className="text-zinc-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0A0A0A] flex overflow-hidden">
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message={authMessage}
      />

      {/* Sidebar */}
      <Sidebar
        chats={chats}
        activeChat={activeChatId}
        onNewChat={startNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={deleteChat}
        collapsed={sidebarCollapsed}
        onClearHistory={clearHistory}
        user={user}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-14 border-b border-white/[0.06] flex items-center justify-between px-5 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-8 h-8 rounded-lg hover:bg-white/[0.04] flex items-center justify-center transition-colors cursor-pointer"
            >
              <MessageSquare size={16} className="text-zinc-500" />
            </button>
            <div>
              <div className="text-[13px] font-semibold text-white">ResQNav Chat Engine</div>
              <div className="text-[10px] text-zinc-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                System Online
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 mr-1">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt=""
                      className="w-6 h-6 rounded-full border border-white/[0.1] object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                      {user.email?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-[11px] text-zinc-500 hidden sm:block">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <LogOut size={13} />
                  Log out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuth()}
                  className="px-3 py-1.5 rounded-lg text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Log in
                </button>
                <button
                  onClick={() => openAuth()}
                  className="px-3.5 py-1.5 rounded-lg bg-white text-black text-[11px] font-semibold hover:bg-white/90 transition-colors cursor-pointer"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>

        {/* Guest limit banner */}
        <AnimatePresence>
          {guestLocked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-amber-500/[0.06] border-b border-amber-500/[0.1] px-5 py-2.5 flex items-center justify-between"
            >
              <p className="text-[11px] text-amber-400/80">
                Demo limit reached — sign in to unlock unlimited verification
              </p>
              <button
                onClick={() => openAuth()}
                className="px-3 py-1 rounded-md bg-white text-black text-[10px] font-semibold hover:bg-white/90 transition-colors cursor-pointer shrink-0 ml-3"
              >
                Sign up free
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat area */}
        {messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth">
            <div className="max-w-3xl mx-auto">
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} index={i} />
              ))}
              <AnimatePresence>{isLoading && <TypingIndicator />}</AnimatePresence>
            </div>
          </div>
        )}

        {/* Input — FIX #4: never disabled for authenticated users */}
        <div className="max-w-3xl mx-auto w-full">
          <ChatInputBar onSend={handleSend} disabled={isLoading} guestLocked={guestLocked} />
        </div>
      </div>
    </div>
  );
}
