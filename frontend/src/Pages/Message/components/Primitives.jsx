import React from "react";

/**
 * Shared presentational pieces for the message module.
 *
 * These follow the card system the rest of the app moved to: a white surface on
 * the `canvas` ground, `rounded-2xl`, a hairline `gray-100` border and a soft
 * shadow, with `brand` as the only saturated colour on the screen.
 */

/* ── Avatar with presence ─────────────────────────────────────────────── */

// A ring reads better than a floating dot once the avatar drops to 32px, and it
// never collides with the bubble beside it.
export const PresenceAvatar = ({ name, active, size = 44, showPresence = true }) => {
  const initial = name?.trim()?.slice(0, 1)?.toUpperCase() || "?";
  const dot = Math.max(8, Math.round(size * 0.24));
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <span
        className="flex items-center justify-center w-full h-full rounded-full bg-brand-soft text-brand font-bold select-none"
        style={{ fontSize: Math.round(size * 0.4) }}
      >
        {initial}
      </span>
      {showPresence && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-white ${
            active ? "bg-emerald-500" : "bg-gray-300"
          }`}
          style={{ width: dot, height: dot }}
        />
      )}
    </span>
  );
};

/* ── Typing indicator ─────────────────────────────────────────────────── */

export const TypingDots = ({ className = "" }) => (
  <span className={`inline-flex items-center gap-1 ${className}`} aria-label="Typing">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-current opacity-70 chat-typing-dot"
        style={{ animationDelay: `${i * 0.16}s` }}
      />
    ))}
  </span>
);

/* ── Skeletons ────────────────────────────────────────────────────────── */

export const Skeleton = ({ className = "" }) => (
  <div className={`bg-gray-200/70 animate-pulse rounded-lg ${className}`} />
);

export const ChatRowSkeleton = () => (
  <div className="flex items-center gap-3 px-4 py-3">
    <div className="w-12 h-12 rounded-full bg-gray-200/70 animate-pulse shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-2.5 w-44" />
    </div>
  </div>
);

// Widths alternate so a stack of these reads as conversation rather than a grid.
export const MessageSkeleton = ({ own, width }) => (
  <div className={`flex px-4 py-1.5 ${own ? "justify-end" : "justify-start"}`}>
    <div
      className={`h-9 animate-pulse rounded-2xl ${own ? "bg-brand/20" : "bg-gray-200/70"}`}
      style={{ width }}
    />
  </div>
);

export const ThreadSkeleton = () => {
  const rows = [
    { own: false, width: 180 },
    { own: false, width: 240 },
    { own: true, width: 140 },
    { own: false, width: 200 },
    { own: true, width: 220 },
    { own: true, width: 120 },
  ];
  return (
    <div className="py-4">
      {rows.map((r, i) => (
        <MessageSkeleton key={i} own={r.own} width={r.width} />
      ))}
    </div>
  );
};

/* ── Empty state ──────────────────────────────────────────────────────── */

export const EmptyState = ({ icon: Icon, title, hint, action }) => (
  <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-3">
    {Icon && (
      <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-soft">
        <Icon className="w-8 h-8 text-brand" />
      </span>
    )}
    <p className="text-base font-bold text-gray-900">{title}</p>
    {hint && <p className="text-sm text-gray-500 max-w-[38ch]">{hint}</p>}
    {action}
  </div>
);

/* ── Icon button ──────────────────────────────────────────────────────── */

export const IconButton = React.forwardRef(
  ({ icon: Icon, label, active, className = "", ...rest }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={`flex items-center justify-center w-9 h-9 rounded-xl border shadow-sm transition-colors shrink-0
        focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50
        ${
          active
            ? "bg-brand-soft border-brand/20 text-brand"
            : "bg-white border-gray-200 text-gray-600 hover:text-brand hover:border-brand/30"
        } ${className}`}
      {...rest}
    >
      <Icon className="w-[18px] h-[18px]" />
    </button>
  )
);
IconButton.displayName = "IconButton";
