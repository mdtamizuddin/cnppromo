import { lazy, Suspense } from "react";
import Loader from "../Components/Loader";
import AuthChecker from "./AuthChecker";

const Message = lazy(() => import("../Pages/Message/Message"));
const AllMessages = lazy(() => import("../Pages/Message/AllMessages"));
const LeaderBoard = lazy(() => import("../Pages/LeaderBoard/LeaderBoard"));
const Level = lazy(() => import("../Pages/Level/Level"));
const Earnings = lazy(() => import("../Pages/Earnings/Earnings"));
const Notifications = lazy(() => import("../Pages/Notifications/Notifications"));
const Welcome = lazy(() => import("../Pages/Welcome/Welcome"));
const Tips = lazy(() => import("../Pages/Tips/Tips"));
const Refer = lazy(() => import("../Pages/Refer/Refer"));
const ReferInfo = lazy(() => import("../Pages/Refer/ReferInfo"));
const ExternalWithdraw = lazy(() => import("../Pages/External-Withdraw/ExternalWithdraw"));
const Account = lazy(() => import("../Pages/Account/Account"));
const TopUp = lazy(() => import("../Pages/Account/TopUp"));
const Withdraw = lazy(() => import("../Pages/Account/Withdraw"));
const Works = lazy(() => import("../Pages/Admin/Works/Works"));
const SocialWork = lazy(() => import("../Pages/SocialWork/SocialWork"));
const SocialWorkDetails = lazy(() => import("../Pages/SocialWork/WorkDetails"));
const WorkDetails = lazy(() => import("../Pages/Admin/Works/WorkDetails"));
const WorksPage = lazy(() => import("../Pages/Admin/Works/WorksPage"));
const WorkHistory = lazy(() => import("../Pages/SocialWork/WorkHistory"));
const UserSettings = lazy(() => import("../Pages/Settings/UserSettings"));
const Training = lazy(() => import("../Pages/Training/Training"));

const Lazy = ({ children }) => <Suspense fallback={<Loader />}>{children}</Suspense>;

export const userRoutes = [
  {
    path: "message",
    element: (
      <AuthChecker requireActive={true}>
        <Lazy><Message /></Lazy>
      </AuthChecker>
    ),
  },
  {
    path: "all-message",
    element: <Lazy><AllMessages /></Lazy>,
  },
  {
    path: "leaderboard",
    element: <AuthChecker><Lazy><LeaderBoard /></Lazy></AuthChecker>,
  },
  {
    path: "level",
    element: <AuthChecker><Lazy><Level /></Lazy></AuthChecker>,
  },
  {
    path: "earnings",
    element: <AuthChecker><Lazy><Earnings /></Lazy></AuthChecker>,
  },
  {
    path: "my-earnings",
    element: <AuthChecker><Lazy><Earnings /></Lazy></AuthChecker>,
  },
  {
    path: "notifications",
    element: <AuthChecker><Lazy><Notifications /></Lazy></AuthChecker>,
  },
  {
    path: "welcome",
    element: <AuthChecker><Lazy><Welcome /></Lazy></AuthChecker>,
  },
  {
    path: "home",
    element: <AuthChecker><Lazy><Welcome /></Lazy></AuthChecker>,
  },
  {
    path: "tips",
    element: <AuthChecker><Lazy><Tips /></Lazy></AuthChecker>,
  },
  {
    path: "refer",
    element: <AuthChecker><Lazy><Refer /></Lazy></AuthChecker>,
  },
  {
    path: "refer-info",
    element: <AuthChecker><Lazy><ReferInfo /></Lazy></AuthChecker>,
  },
  {
    path: "external-withdraw",
    element: <AuthChecker><Lazy><ExternalWithdraw page={"user"} /></Lazy></AuthChecker>,
  },
  {
    path: "account",
    element: <AuthChecker><Lazy><Account /></Lazy></AuthChecker>,
    children: [
      {
        index: true,
        element: <TopUp />,
      },
      {
        path: "withdraw",
        element: <Withdraw />,
      },
    ],
  },
  {
    path: "works",
    element: <AuthChecker><Lazy><Works /></Lazy></AuthChecker>,
  },
  {
    path: "social-works",
    element: <AuthChecker><Lazy><SocialWork /></Lazy></AuthChecker>,
  },
  {
    path: "social-works/:id",
    element: <AuthChecker><Lazy><SocialWorkDetails /></Lazy></AuthChecker>,
  },
  {
    path: "works/:id",
    element: <AuthChecker><Lazy><WorkDetails /></Lazy></AuthChecker>,
  },
  {
    path: "works/category/:id",
    element: <AuthChecker><Lazy><WorksPage /></Lazy></AuthChecker>,
  },
  {
    path: "work-history",
    element: <AuthChecker><Lazy><WorkHistory /></Lazy></AuthChecker>,
  },
  {
    path: "settings",
    element: <AuthChecker><Lazy><UserSettings /></Lazy></AuthChecker>,
  },
  {
    path: "user-settings",
    element: <AuthChecker><Lazy><UserSettings /></Lazy></AuthChecker>,
  },
  {
    path: "training",
    element: <AuthChecker><Lazy><Training /></Lazy></AuthChecker>,
  },
];
