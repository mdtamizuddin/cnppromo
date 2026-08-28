import { lazy, Suspense } from "react";
import Loader from "../Components/Loader";
import AdminChecker from "../util/UserChecker";

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
const Withdrawals = lazy(() => import("../Pages/Admin/Withdraw/Withdraw"));
const ExternalWithdrawals = lazy(() => import("../Pages/Admin/ExternalWithdrawals/ExternalWithdrawals"));

const Lazy = ({ children }) => <Suspense fallback={<Loader />}>{children}</Suspense>;

export const adminRoutes = [
  {
    index: true,
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
];
