import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "../App";
import Loader from "../Components/Loader";
import AuthChecker from "./AuthChecker";
import AdminChecker from "../util/UserChecker";

const Home = lazy(() => import("../Pages/Home/Home"));
const Register = lazy(() => import("../Pages/Auth/Register/Register"));
const Login = lazy(() => import("../Pages/Auth/Login/Login"));
const Profile = lazy(() => import("../Pages/Profile/Profile"));
const ReferInfo = lazy(() => import("../Pages/Refer/ReferInfo"));
const Refer = lazy(() => import("../Pages/Refer/Refer"));
const Account = lazy(() => import("../Pages/Account/Account"));
const TopUp = lazy(() => import("../Pages/Account/TopUp"));
const Withdraw = lazy(() => import("../Pages/Account/Withdraw"));
const Reviews = lazy(() => import("../Pages/Reviews/Reviews"));
const Users = lazy(() => import("../Pages/Admin/Users/Users"));
const Withdrawals = lazy(() => import("../Pages/Admin/Withdraw/Withdraw"));
const User = lazy(() => import("../Pages/Admin/Users/User"));
const Topups = lazy(() => import("../Pages/Admin/TopUp/TopUp"));
const Settings = lazy(() => import("../Pages/Settings/Settings"));
const Works = lazy(() => import("../Pages/Admin/Works/Works"));
const Training = lazy(() => import("../Pages/Training/Training"));
const Admins = lazy(() => import("../Pages/Admin/Admins/Users"));
const ReferHistory = lazy(() => import("../Pages/Admin/RefHistory/RefHistory"));
const Check = lazy(() => import("../Pages/Admin/Check/Check"));
const Reset = lazy(() => import("../Pages/Auth/Reset/Reset"));
const Welcome = lazy(() => import("../Pages/Welcome/Welcome"));
const Home2 = lazy(() => import("../Pages/Home2/Home2"));
const WorkDetails = lazy(() => import("../Pages/Admin/Works/WorkDetails"));
const LeaderBoard = lazy(() => import("../Pages/LeaderBoard/LeaderBoard"));
const Tips = lazy(() => import("../Pages/Tips/Tips"));
const WorksPage = lazy(() => import("../Pages/Admin/Works/WorksPage"));
const Message = lazy(() => import("../Pages/Message/Message"));
const Level = lazy(() => import("../Pages/Level/Level"));
const ExternalWithdraw = lazy(() => import("../Pages/External-Withdraw/ExternalWithdraw"));
const AllMessages = lazy(() => import("../Pages/Message/AllMessages"));
const SocialWork = lazy(() => import("../Pages/SocialWork/SocialWork"));
const SocialWorkDetails = lazy(() => import("../Pages/SocialWork/WorkDetails"));
const AddWork = lazy(() => import("../Pages/SocialWork/AddWork"));
const WorkHistory = lazy(() => import("../Pages/SocialWork/WorkHistory"));
const LoginWithoutPass = lazy(() => import("../Pages/Auth/Login/WithOutPass"));

const Lazy = ({ children }) => <Suspense fallback={<Loader />}>{children}</Suspense>;

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Lazy><Home /></Lazy>,
      },
      {
        path: "message",
        element: <Lazy><Message /></Lazy>,
      },
      {
        path: "all-message",
        element: <Lazy><AllMessages /></Lazy>,
      },
      {
        path: "register",
        element: <Lazy><Register /></Lazy>,
      },
      {
        path: "login",
        element: <Lazy><Login /></Lazy>,
      }, {
        path: "without-pass",
        element: <Lazy><LoginWithoutPass /></Lazy>,
      },
      {
        path: "forgot-password",
        element: <Lazy><Reset /></Lazy>,
      },
      {
        path: "reviews",
        element: <Lazy><Reviews /></Lazy>,
      },
      {
        path: "leaderboard",
        element: <Lazy><LeaderBoard /></Lazy>,
      },
      {
        path: "level",
        element: (
          <AuthChecker>
            <Lazy><Level /></Lazy>
          </AuthChecker>
        ),
      },
      {
        path: "profile",
        element: (
          <AuthChecker>
            <Lazy><Profile /></Lazy>
          </AuthChecker>
        ),
      },
      {
        path: "welcome",
        element: (
          <AuthChecker>
            <Lazy><Welcome /></Lazy>
          </AuthChecker>
        ),
      },
      {
        path: "home",
        element: (
          <AuthChecker>
            <Lazy><Home2 /></Lazy>
          </AuthChecker>
        ),
      },
      {
        path: "tips",
        element: (
          <AuthChecker>
            <Lazy><Tips /></Lazy>
          </AuthChecker>
        ),
      },
      {
        path: "refer",
        element: (
          <AuthChecker>
            <Lazy><Refer /></Lazy>
          </AuthChecker>
        ),
      },
      {
        path: "refer-info",
        element: (
          <AuthChecker>
            <Lazy><ReferInfo /></Lazy>
          </AuthChecker>
        ),
      },
      {
        path: "external-withdraw",
        element: (
          <AuthChecker>
            <Lazy><ExternalWithdraw page={"user"} /></Lazy>
          </AuthChecker>
        ),
      },
      {
        path: "account",
        element: (
          <AuthChecker>
            <Lazy><Account /></Lazy>
          </AuthChecker>
        ),
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
        element: (
          <AuthChecker>
            <Lazy><Works /></Lazy>
          </AuthChecker>
        ),
      },
      {
        path: "social-works",
        element: (
          <AuthChecker>
            <Lazy><SocialWork /></Lazy>
          </AuthChecker>
        ),
      },
      {
        path: "social-works/:id",
        element: (
          <AuthChecker>
            <Lazy><SocialWorkDetails /></Lazy>
          </AuthChecker>
        ),
      },
      {
        path: "update-works/:id",
        element: (
          <AdminChecker>
            <Lazy><AddWork /></Lazy>
          </AdminChecker>
        ),
      },
      {
        path: "works/:id",
        element: (
          <AuthChecker>
            <Lazy><WorkDetails /></Lazy>
          </AuthChecker>
        ),
      },
      {
        path: "works/category/:id",
        element: (
          <AuthChecker>
            <Lazy><WorksPage /></Lazy>
          </AuthChecker>
        ),
      },
      {
        path: "admin",
        element: (
          <AdminChecker>
            <Lazy><Admins /></Lazy>
          </AdminChecker>
        ),
      },{
        path: "moderator",
        element: (
          <AdminChecker>
            <Lazy><Admins moderator={true} /></Lazy>
          </AdminChecker>
        ),
      },
      {
        path: "add-work",
        element: (
          <AdminChecker>
            <Lazy><AddWork /></Lazy>
          </AdminChecker>
        ),
      },
      {
        path: "work-history",
        element: (
          <AuthChecker>
            <Lazy><WorkHistory /></Lazy>
          </AuthChecker>
        ),
      },
      {
        path: "refers",
        element: (
          <AdminChecker>
            <Lazy><ReferHistory /></Lazy>
          </AdminChecker>
        ),
      },
      {
        path: "check",
        element: (
          <AdminChecker>
            <Lazy><Check /></Lazy>
          </AdminChecker>
        ),
      },
      {
        path: "users",
        element: (
          <AdminChecker>
            <Lazy><Users /></Lazy>
          </AdminChecker>
        ),
      },
      {
        path: "user/:id",
        element: (
          <AdminChecker>
            <Lazy><User /></Lazy>
          </AdminChecker>
        ),
      },
      {
        path: "topup",
        element: (
          <AdminChecker>
            <Lazy><Topups /></Lazy>
          </AdminChecker>
        ),
      },
      {
        path: "settings",
        element: (
          <AdminChecker>
            <Lazy><Settings /></Lazy>
          </AdminChecker>
        ),
      },
      {
        path: "training",
        element: (
          <AuthChecker>
            <Lazy><Training /></Lazy>
          </AuthChecker>
        ),
      },
      {
        path: "withdrawals",
        element: (
          <AdminChecker>
            <Lazy><Withdrawals /></Lazy>
          </AdminChecker>
        ),
      },
    ],
  },
]);

export default router;
