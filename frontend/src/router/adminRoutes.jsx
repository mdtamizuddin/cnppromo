import { lazy, Suspense } from "react";
import Loader from "../Components/Loader";
import AdminChecker from "../util/UserChecker";

const AdminDashboard = lazy(() => import("../Pages/Admin/Dashboard/AdminDashboard"));
const Admins = lazy(() => import("../Pages/Admin/Admins/Users"));
const AddWork = lazy(() => import("../Pages/SocialWork/AddWork"));
const ReferHistory = lazy(() => import("../Pages/Admin/RefHistory/RefHistory"));
const Check = lazy(() => import("../Pages/Admin/Check/Check"));
const Users = lazy(() => import("../Pages/Admin/Users/Users"));
const NonActiveUsers = lazy(() => import("../Pages/Admin/Users/NonActiveUsers"));
const BannedUsers = lazy(() => import("../Pages/Admin/Users/BannedUsers"));
const User = lazy(() => import("../Pages/Admin/Users/User"));
const Topups = lazy(() => import("../Pages/Admin/TopUp/TopUp"));
const Settings = lazy(() => import("../Pages/Settings/Settings"));
const UserSettings = lazy(() => import("../Pages/Settings/UserSettings"));
const Withdrawals = lazy(() => import("../Pages/Admin/Withdraw/Withdraw"));
const ExternalWithdrawals = lazy(() => import("../Pages/Admin/ExternalWithdrawals/ExternalWithdrawals"));
const AdminWorks = lazy(() => import("../Pages/Admin/ManageWorks/AdminWorks"));
const AdminSocialWorks = lazy(() => import("../Pages/Admin/ManageSocialWorks/AdminSocialWorks"));
const PaymentGateway = lazy(() => import("../Pages/Admin/PaymentGateway/PaymentGateway"));
const Message = lazy(() => import("../Pages/Message/Message"));
const LoginDevices = lazy(() => import("../Pages/Account/LoginDevices"));

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
