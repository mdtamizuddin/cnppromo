// Shared account-state rules for admin views (user drawer, Check page).
// Deleted wins over banned, banned over status.
export const ACCOUNT_STATES = {
  active: {
    label: "Active",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200/50",
  },
  pending: {
    label: "Pending",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border border-amber-200/50",
    banner: "bg-amber-50 border-amber-200 text-amber-800",
  },
  inactive: {
    label: "Inactive",
    dot: "bg-gray-400",
    badge: "bg-gray-100 text-gray-700 border border-gray-200",
    banner: "bg-gray-50 border-gray-200 text-gray-700",
  },
  banned: {
    label: "Banned",
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 border border-red-200/50",
    banner: "bg-red-50 border-red-200 text-red-800",
  },
  deleted: {
    label: "Deleted",
    dot: "bg-gray-900",
    badge: "bg-gray-900 text-white border border-gray-900",
    banner: "bg-gray-100 border-gray-300 text-gray-800",
  },
};

export const getAccountState = (user) => {
  if (!user) return null;
  if (user.deletedAt) return "deleted";
  if (user.lock) return "banned";
  if (user.status === "active") return "active";
  if (user.status === "pending") return "pending";
  return "inactive";
};
