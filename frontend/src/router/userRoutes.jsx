import { lazy, Suspense } from "react";
import Loader from "../Components/Loader";
import AuthChecker from "./AuthChecker";

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

const Message = lazyRetry(() => import("../Pages/Message/Message"));
const AllMessages = lazyRetry(() => import("../Pages/Message/AllMessages"));
const LeaderBoard = lazyRetry(() => import("../Pages/LeaderBoard/LeaderBoard"));
const Level = lazyRetry(() => import("../Pages/Level/Level"));
const Earnings = lazyRetry(() => import("../Pages/Earnings/Earnings"));
const Notifications = lazyRetry(() => import("../Pages/Notifications/Notifications"));
const Welcome = lazyRetry(() => import("../Pages/Welcome/Welcome"));
const Tips = lazyRetry(() => import("../Pages/Tips/Tips"));
const Refer = lazyRetry(() => import("../Pages/Refer/Refer"));
const ReferInfo = lazyRetry(() => import("../Pages/Refer/ReferInfo"));
const ExternalWithdraw = lazyRetry(() => import("../Pages/External-Withdraw/ExternalWithdraw"));
const Account = lazyRetry(() => import("../Pages/Account/Account"));
const TopUp = lazyRetry(() => import("../Pages/Account/TopUp"));
const Withdraw = lazyRetry(() => import("../Pages/Account/Withdraw"));
const Works = lazyRetry(() => import("../Pages/Admin/Works/Works"));
const SocialWork = lazyRetry(() => import("../Pages/SocialWork/SocialWork"));
const SocialWorkDetails = lazyRetry(() => import("../Pages/SocialWork/WorkDetails"));
const WorkDetails = lazyRetry(() => import("../Pages/Admin/Works/WorkDetails"));
const WorksPage = lazyRetry(() => import("../Pages/Admin/Works/WorksPage"));
const WorkHistory = lazyRetry(() => import("../Pages/SocialWork/WorkHistory"));
const UserSettings = lazyRetry(() => import("../Pages/Settings/UserSettings"));
const Training = lazyRetry(() => import("../Pages/Training/Training"));
const LoginDevices = lazyRetry(() => import("../Pages/Account/LoginDevices"));

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
    element: <AuthChecker><Lazy><AllMessages /></Lazy></AuthChecker>,
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
  {
    path: "login-devices",
    element: <AuthChecker><Lazy><LoginDevices /></Lazy></AuthChecker>,
  },
];
