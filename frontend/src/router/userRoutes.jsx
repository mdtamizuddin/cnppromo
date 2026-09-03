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
const PaymentGateway = lazyRetry(() => import("../Pages/Account/PaymentGateway"));
const Works = lazyRetry(() => import("../Pages/Admin/Works/Works"));
const WorkDetails = lazyRetry(() => import("../Pages/Admin/Works/WorkDetails"));
const WorksPage = lazyRetry(() => import("../Pages/Admin/Works/WorksPage"));
const TaskFeed = lazyRetry(() => import("../Pages/Marketplace/TaskFeed"));
const TaskDetails = lazyRetry(() => import("../Pages/Marketplace/TaskDetails"));
const MySubmissions = lazyRetry(() => import("../Pages/Marketplace/MySubmissions"));
const CreateTask = lazyRetry(() => import("../Pages/Marketplace/CreateTask"));
const ProviderTasks = lazyRetry(() => import("../Pages/Marketplace/ProviderTasks"));
const ProviderSubmissions = lazyRetry(() => import("../Pages/Marketplace/ProviderSubmissions"));
const UserSettings = lazyRetry(() => import("../Pages/Settings/UserSettings"));
const Training = lazyRetry(() => import("../Pages/Training/Training"));
const LoginDevices = lazyRetry(() => import("../Pages/Account/LoginDevices"));

const Lazy = ({ children }) => <Suspense fallback={<Loader />}>{children}</Suspense>;

export const userRoutes = [
  {
    index: true,
    element: <AuthChecker><Lazy><Welcome /></Lazy></AuthChecker>,
  },
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
    path: "payment-gateway",
    element: <AuthChecker><Lazy><PaymentGateway /></Lazy></AuthChecker>,
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
    path: "tasks",
    element: <AuthChecker requireActive={true}><Lazy><TaskFeed /></Lazy></AuthChecker>,
  },
  {
    path: "tasks/:id",
    element: <AuthChecker requireActive={true}><Lazy><TaskDetails /></Lazy></AuthChecker>,
  },
  {
    path: "my-submissions",
    element: <AuthChecker requireActive={true}><Lazy><MySubmissions /></Lazy></AuthChecker>,
  },
  {
    path: "provider/tasks",
    element: <AuthChecker requireActive={true}><Lazy><ProviderTasks /></Lazy></AuthChecker>,
  },
  {
    path: "provider/tasks/new",
    element: <AuthChecker requireActive={true}><Lazy><CreateTask /></Lazy></AuthChecker>,
  },
  {
    path: "provider/tasks/:id",
    element: <AuthChecker requireActive={true}><Lazy><ProviderSubmissions /></Lazy></AuthChecker>,
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
