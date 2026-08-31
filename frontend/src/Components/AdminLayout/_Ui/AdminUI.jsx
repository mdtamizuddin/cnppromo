import React, { useEffect } from "react";
import { Card } from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

/**
 * Shared building blocks for the admin panel tables.
 *
 * Every "Premium*Table" screen is the same shape — header, stat row, toolbar,
 * table, empty/loading state — so those pieces live here instead of being
 * re-typed (and slowly drifting) in each page.
 */

// Accent palettes, keyed to the colours the sidebar already uses per section.
export const ACCENTS = {
  amber: {
    text: "text-amber-600",
    bg: "bg-amber-50",
    ring: "ring-amber-100",
    solid: "bg-amber-500 hover:bg-amber-600",
    shadow: "shadow-amber-500/25",
    row: "hover:bg-amber-50/40",
    gradient: "from-amber-500 to-orange-500",
  },
  teal: {
    text: "text-teal-600",
    bg: "bg-teal-50",
    ring: "ring-teal-100",
    solid: "bg-teal-600 hover:bg-teal-700",
    shadow: "shadow-teal-500/25",
    row: "hover:bg-teal-50/40",
    gradient: "from-teal-500 to-cyan-500",
  },
  blue: {
    text: "text-blue-600",
    bg: "bg-blue-50",
    ring: "ring-blue-100",
    solid: "bg-blue-600 hover:bg-blue-700",
    shadow: "shadow-blue-500/25",
    row: "hover:bg-blue-50/40",
    gradient: "from-blue-600 to-indigo-600",
  },
  purple: {
    text: "text-violet-600",
    bg: "bg-violet-50",
    ring: "ring-violet-100",
    solid: "bg-[#5a32fa] hover:bg-[#4b26e0]",
    shadow: "shadow-violet-500/25",
    row: "hover:bg-violet-50/40",
    gradient: "from-violet-600 to-indigo-600",
  },
};

/** Page title block with an accent icon badge and an optional action slot. */
export const PageHeader = ({ icon: Icon, title, subtitle, accent = "blue", action }) => {
  const a = ACCENTS[accent] || ACCENTS.blue;
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        {Icon && (
          <div className={`shrink-0 grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-br ${a.gradient} shadow-lg ${a.shadow}`}>
            <Icon className="w-6 h-6 text-white" strokeWidth={1.8} />
          </div>
        )}
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
};

/** Single metric tile. `hint` renders as a small caption under the value. */
export const StatCard = ({ title, value, hint, icon: Icon, colorClass = "text-blue-500", bgClass = "bg-blue-50" }) => (
  <Card className="p-4 sm:p-5 flex flex-row items-center gap-3.5 shadow-sm border border-gray-100/60 hover:shadow-md hover:border-gray-200 transition-all duration-300 rounded-2xl bg-white group">
    <div className={`shrink-0 p-3 rounded-xl ${bgClass} transition-transform duration-300 group-hover:scale-110`}>
      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClass}`} strokeWidth={1.8} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 leading-tight">{title}</p>
      <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-none truncate">{value}</h3>
      {hint && <p className="text-[10px] text-gray-400 mt-1 leading-tight">{hint}</p>}
    </div>
  </Card>
);

export const StatGrid = ({ children }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6">{children}</div>
);

/** The bordered white card every table sits inside. */
export const TableCard = ({ toolbar, children }) => (
  <Card className="w-full shadow-sm border border-gray-200 overflow-hidden rounded-2xl bg-white">
    {toolbar && (
      <div className="p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-gray-200 bg-white">
        {toolbar}
      </div>
    )}
    {children}
  </Card>
);

/** Table head row built from an array of column labels. */
export const TableHead = ({ columns }) => (
  <thead>
    <tr>
      {columns.map((head) => (
        <th
          key={head}
          className="border-b border-gray-200 bg-gray-50/80 px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider"
        >
          {head}
        </th>
      ))}
    </tr>
  </thead>
);

/** Coloured status chip. */
export const StatusPill = ({ children, tone = "gray" }) => {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    gray: "bg-gray-100 text-gray-500 ring-gray-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    red: "bg-red-50 text-red-600 ring-red-100",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    teal: "bg-teal-50 text-teal-700 ring-teal-100",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ring-1 ${tones[tone] || tones.gray}`}>
      {children}
    </span>
  );
};

/** Small square icon button used for row actions. */
export const IconAction = ({ icon: Icon, label, onClick, tone = "gray", disabled }) => {
  const tones = {
    gray: "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
    blue: "text-gray-400 hover:text-blue-600 hover:bg-blue-50",
    red: "text-gray-400 hover:text-red-600 hover:bg-red-50",
    teal: "text-gray-400 hover:text-teal-600 hover:bg-teal-50",
    purple: "text-gray-400 hover:text-violet-600 hover:bg-violet-50",
  };
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid place-items-center w-9 h-9 rounded-xl transition-colors disabled:opacity-40 disabled:pointer-events-none ${tones[tone] || tones.gray}`}
    >
      <Icon className="w-[18px] h-[18px]" strokeWidth={1.9} />
    </button>
  );
};

/** Shimmering placeholder rows, shown instead of a bare "Loading…" string. */
export const SkeletonRows = ({ rows = 5, cols = 4 }) =>
  Array.from({ length: rows }).map((_, r) => (
    <tr key={r}>
      {Array.from({ length: cols }).map((__, c) => (
        <td key={c} className="px-4 py-4">
          <div
            className="h-3 rounded-full bg-gray-200/80 animate-pulse"
            style={{ width: `${c === 0 ? 70 : 40 + ((r + c) % 3) * 12}%` }}
          />
        </td>
      ))}
    </tr>
  ));

/** Centred illustration + copy for "nothing here yet". */
export const EmptyState = ({ icon: Icon, title, message, action }) => (
  <div className="py-14 px-6 flex flex-col items-center text-center">
    {Icon && (
      <div className="grid place-items-center w-14 h-14 rounded-2xl bg-gray-100 mb-4">
        <Icon className="w-7 h-7 text-gray-400" strokeWidth={1.6} />
      </div>
    )}
    <p className="text-sm font-bold text-gray-700">{title}</p>
    {message && <p className="text-xs text-gray-400 mt-1 max-w-xs">{message}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

/** Pill-style segmented control used for tabs and status filters. */
export const SegmentedTabs = ({ tabs, value, onChange, accent = "blue", fullWidth = false }) => {
  const a = ACCENTS[accent] || ACCENTS.blue;
  const strip = (
    <div
      className={`${fullWidth ? "flex" : "inline-flex"} items-center gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto max-w-full scrollbar-none`}
      style={{ scrollbarWidth: "none" }}
    >
      {tabs.map((tab) => {
        const active = value === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`shrink-0 px-3.5 py-2 rounded-lg text-[11px] sm:text-xs font-bold capitalize transition-all ${
              active ? `bg-white shadow-sm ${a.text}` : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-1.5 ${active ? a.text : "text-gray-400"}`}>({tab.count})</span>
            )}
          </button>
        );
      })}
    </div>
  );

  if (!fullWidth) return strip;

  // Fade the right edge so a clipped strip reads as scrollable.
  return (
    <div className="relative min-w-0 w-full">
      {strip}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent rounded-r-xl" />
    </div>
  );
};

/** Infinite-scroll footer row: sentinel, spinner, and end-of-list message. */
export const InfiniteFooter = React.forwardRef(({ colSpan, isFetching, hasNext, isEmpty }, ref) => (
  <tr ref={ref}>
    <td colSpan={colSpan} className="py-4 text-center">
      {isFetching ? (
        <span className="inline-flex items-center gap-2 text-xs text-gray-400 font-medium">
          <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
          Loading more…
        </span>
      ) : hasNext ? (
        <span className="text-xs text-gray-300">Scroll for more</span>
      ) : !isEmpty ? (
        <span className="text-xs text-gray-300">End of list</span>
      ) : null}
    </td>
  </tr>
));
InfiniteFooter.displayName = "InfiniteFooter";

/**
 * Centred modal with a sticky header/footer and a scrollable body.
 * Closes on backdrop click and on Escape.
 */
export const Modal = ({ title, subtitle, onClose, children, footer, size = "md" }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const widths = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
        <div
          className={`pointer-events-auto w-full ${widths[size] || widths.md} bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh]`}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">{title}</h2>
              {subtitle && <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 grid place-items-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-5 overflow-y-auto grow">{children}</div>

          {footer && <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 rounded-b-3xl">{footer}</div>}
        </div>
      </div>
    </>
  );
};

/** Label + value pair used inside detail modals. */
export const DetailTile = ({ label, children, tone = "default" }) => (
  <div className={`p-3 rounded-xl ${tone === "default" ? "bg-gray-50" : tone}`}>
    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</p>
    <div className="text-sm font-bold text-gray-900">{children}</div>
  </div>
);
