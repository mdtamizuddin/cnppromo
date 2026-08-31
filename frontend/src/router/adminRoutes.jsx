import { lazy, Suspense } from "react";
import Loader from "../Components/Loader";
import AdminChecker from "../util/UserChecker";

const lazyRetry = (componentImport) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      const hasReloaded = sessionStorage.getItem("chunk_reload_attempted");
      if (!hasReloaded) {
        sessionStorage.setItem("chunk_reload_attempted", "true");
        window.location.reload();
        return { default: () => null };
      }
      throw error;
    }
  });

const AdminDashboard = lazyRetry(() => import("../Pages/Admin/Dashboard/AdminDashboard"));
const Admins = lazyRetry(() => import("../Pages/Admin/Admins/Users"));
const AddWork = lazyRetry(() => import("../Pages/SocialWork/AddWork"));
const ReferHistory = lazyRetry(() => import("../Pages/Admin/RefHistory/RefHistory"));
const Check = lazyRetry(() => import("../Pages/Admin/Check/Check"));
const Users = lazyRetry(() => import("../Pages/Admin/Users/Users"));
const NonActiveUsers = lazyRetry(() => import("../Pages/Admin/Users/NonActiveUsers"));
const BannedUsers = lazyRetry(() => import("../Pages/Admin/Users/BannedUsers"));
const User = lazyRetry(() => import("../Pages/Admin/Users/User"));
const Topups = lazyRetry(() => import("../Pages/Admin/TopUp/TopUp"));
const Settings = lazyRetry(() => import("../Pages/Settings/Settings"));
const UserSettings = lazyRetry(() => import("../Pages/Settings/UserSettings"));
const Notifications = lazyRetry(() => import("../Pages/Notifications/Notifications"));
const Withdrawals = lazyRetry(() => import("../Pages/Admin/Withdraw/Withdraw"));
const ExternalWithdrawals = lazyRetry(() => import("../Pages/Admin/ExternalWithdrawals/ExternalWithdrawals"));
const AdminWorks = lazyRetry(() => import("../Pages/Admin/ManageWorks/AdminWorks"));
const AdminSocialWorks = lazyRetry(() => import("../Pages/Admin/ManageSocialWorks/AdminSocialWorks"));
const AdminTraining = lazyRetry(() => import("../Pages/Admin/Training/AdminTraining"));
const PaymentGateway = lazyRetry(() => import("../Pages/Admin/PaymentGateway/PaymentGateway"));
const Message = lazyRetry(() => import("../Pages/Message/Message"));
const LoginDevices = lazyRetry(() => import("../Pages/Account/LoginDevices"));
const AdminEarnings = lazyRetry(() => import("../Pages/Admin/Earnings/AdminEarnings"));
const AdminBroadcast = lazyRetry(() => import("../Pages/Admin/Broadcast/AdminBroadcast"));
const AdminReviews = lazyRetry(() => import("../Pages/Admin/Reviews/AdminReviews"));
const AdminPaymentProofs = lazyRetry(() => import("../Pages/Admin/PaymentProofs/AdminPaymentProofs"));
const LeaderBoard = lazyRetry(() => import("../Pages/LeaderBoard/LeaderBoard"));

const Lazy = ({ children }) => <Suspense fallback={<Loader />}>{children}</Suspense>;

export const adminRoutes = [
  {
    index: true,
    element: <AdminChecker><Lazy><AdminDashboard /></Lazy></AdminChecker>,
  },
  {
    path: "dashboard",
    element: <AdminChecker><Lazy><AdminDashboard /></Lazy></AdminChecker>,
  },
  {
    path: "leaderboard",
    element: <AdminChecker><Lazy><LeaderBoard /></Lazy></AdminChecker>,
  },
  {
    path: "earnings",
    element: <AdminChecker><Lazy><AdminEarnings /></Lazy></AdminChecker>,
  },
  {
    path: "payment-proofs",
    element: <AdminChecker><Lazy><AdminPaymentProofs /></Lazy></AdminChecker>,
  },
  {
    path: "broadcast",
    element: <AdminChecker><Lazy><AdminBroadcast /></Lazy></AdminChecker>,
  },
  {
    path: "reviews",
    element: <AdminChecker><Lazy><AdminReviews /></Lazy></AdminChecker>,
  },
  {
    path: "notifications",
    element: <AdminChecker><Lazy><Notifications /></Lazy></AdminChecker>,
  },
  {
    path: "admins",
    element: <AdminChecker><Lazy><Admins /></Lazy></AdminChecker>,
  },
  {
    path: "moderator",
    element: <AdminChecker><Lazy><Admins moderator={true} /></Lazy></AdminChecker>,
  },
  {
    path: "add-work",
    element: <AdminChecker><Lazy><AddWork /></Lazy></AdminChecker>,
  },
  {
    path: "update-works/:id",
    element: <AdminChecker><Lazy><AddWork /></Lazy></AdminChecker>,
  },
  {
    path: "refers",
    element: <AdminChecker><Lazy><ReferHistory /></Lazy></AdminChecker>,
  },
  {
    path: "check",
    element: <AdminChecker><Lazy><Check /></Lazy></AdminChecker>,
  },
  {
    path: "users",
    element: <AdminChecker><Lazy><Users /></Lazy></AdminChecker>,
  },
  {
    path: "non-active-users",
    element: <AdminChecker><Lazy><NonActiveUsers /></Lazy></AdminChecker>,
  },
  {
    path: "banned-users",
    element: <AdminChecker><Lazy><BannedUsers /></Lazy></AdminChecker>,
  },
  {
    path: "user/:id",
    element: <AdminChecker><Lazy><User /></Lazy></AdminChecker>,
  },
  {
    path: "topup",
    element: <AdminChecker><Lazy><Topups /></Lazy></AdminChecker>,
  },
  {
    path: "profile",
    element: <AdminChecker><Lazy><UserSettings /></Lazy></AdminChecker>,
  },
  {
    path: "settings",
    element: <AdminChecker><Lazy><Settings /></Lazy></AdminChecker>,
  },
  {
    path: "withdrawals",
    element: <AdminChecker><Lazy><Withdrawals /></Lazy></AdminChecker>,
  },
  {
    path: "external-withdrawals",
    element: <AdminChecker><Lazy><ExternalWithdrawals /></Lazy></AdminChecker>,
  },
  {
    path: "works",
    element: <AdminChecker><Lazy><AdminWorks /></Lazy></AdminChecker>,
  },
  {
    path: "social-works",
    element: <AdminChecker><Lazy><AdminSocialWorks /></Lazy></AdminChecker>,
  },
  {
    path: "training",
    element: <AdminChecker><Lazy><AdminTraining /></Lazy></AdminChecker>,
  },
  {
    path: "payment-gateway",
    element: <AdminChecker><Lazy><PaymentGateway /></Lazy></AdminChecker>,
  },
  {
    // Staff reach messaging through the admin shell. There is no `requireActive`
    // gate here — that one is for members waiting on approval.
    path: "message",
    element: <AdminChecker><Lazy><Message /></Lazy></AdminChecker>,
  },
  {
    // The page only ever shows the caller's own sessions, so the same component
    // serves staff here and members at /user/login-devices.
    path: "login-devices",
    element: <AdminChecker><Lazy><LoginDevices /></Lazy></AdminChecker>,
  },
];
