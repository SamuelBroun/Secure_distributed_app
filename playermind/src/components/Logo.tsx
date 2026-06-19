export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect width="48" height="48" rx="13" fill="#163A5F" />
      <path
        d="M24 11l11 6.2v12.6L24 36l-11-6.2V17.2L24 11z"
        stroke="#B7D8B2"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="23.5" r="4.3" fill="#B7D8B2" />
    </svg>
  );
}

export function Wordmark({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <Logo size={size} />
      <span className="font-display text-lg font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
        PLAYER<span style={{ color: "var(--brand)" }}>MIND</span>
      </span>
    </div>
  );
}
