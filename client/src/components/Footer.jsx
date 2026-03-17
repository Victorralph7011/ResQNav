export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-6 px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="2" width="24" height="24" rx="6" stroke="#fff" strokeWidth="2" fill="none" opacity="0.5"/>
            <path d="M9 14L13 18L19 10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
          </svg>
          ResQNav
        </div>
        <p className="text-[13px] text-zinc-600">© 2026 ResQNav. Built to save lives.</p>
        <div className="flex items-center gap-5">
          <a href="#" className="text-[13px] text-zinc-600 hover:text-zinc-400 transition-colors">Privacy</a>
          <a href="#" className="text-[13px] text-zinc-600 hover:text-zinc-400 transition-colors">Terms</a>
          <a href="https://github.com/Victorralph7011/ResQNav" target="_blank" rel="noopener" className="text-[13px] text-zinc-600 hover:text-zinc-400 transition-colors">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
