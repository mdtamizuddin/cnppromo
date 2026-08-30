// Notification links are stored as canonical paths (e.g. "/works", "/refer").
// Resolve them against the signed-in user's role so members land on member
// pages and staff land on the matching admin page.
const LINK_MAP = {
  "/works": { user: "/user/works", admin: "/admin/works" },
  "/refer": { user: "/user/refer", admin: "/admin/refers" },
  "/settings": { user: "/user/settings", admin: "/admin/settings" },
  "/account/withdraw": { user: "/user/account/withdraw", admin: "/admin/withdrawals" },
  "/account/topup": { user: "/user/account", admin: "/admin/topup" },
  "/social-works": { user: "/user/social-works", admin: "/admin/social-works" },
  "/level": { user: "/user/level", admin: "/admin/dashboard" },
};

export const resolveNotificationLink = (link, role) => {
  if (!link) return "";
  const isAdmin = role === "admin" || role === "moderator";
  const mapped = LINK_MAP[link];
  if (mapped) {
    return isAdmin ? mapped.admin : mapped.user;
  }
  // Unknown links still route into the matching app shell.
  if (isAdmin) return `/admin${link}`;
  if (link.startsWith("/user/") || link.startsWith("/admin/")) return link;
  return `/user${link}`;
};