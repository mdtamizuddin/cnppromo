import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "../App";
import Loader from "../Components/Loader";
import AuthChecker from "./AuthChecker";
import { userRoutes } from "./userRoutes";
import { adminRoutes } from "./adminRoutes";

const Home = lazy(() => import("../Pages/Home/Home"));
const About = lazy(() => import("../Pages/About/About"));
const HowItWorks = lazy(() => import("../Pages/HowItWorks/HowItWorks"));
const Register = lazy(() => import("../Pages/Auth/Register/Register"));
const Login = lazy(() => import("../Pages/Auth/Login/Login"));
const Reviews = lazy(() => import("../Pages/Reviews/Reviews"));
const Reset = lazy(() => import("../Pages/Auth/Reset/Reset"));
const Message = lazy(() => import("../Pages/Message/Message"));
const AllMessages = lazy(() => import("../Pages/Message/AllMessages"));
const LoginWithoutPass = lazy(() => import("../Pages/Auth/Login/WithOutPass"));
const PaymentProof = lazy(() => import("../Pages/PaymentProof/PaymentProof"));
const Features = lazy(() => import("../Pages/Features/Features"));
const AdminLayout = lazy(() => import("../Components/AdminLayout/AdminLayout"));

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
        path: "about",
        element: <Lazy><About /></Lazy>,
      },
      {
        path: "how-it-works",
        element: <Lazy><HowItWorks /></Lazy>,
      },
      {
        path: "features",
        element: <Lazy><Features /></Lazy>,
      },
      {
        path: "payment-proof",
        element: <Lazy><PaymentProof /></Lazy>,
      },
      {
        path: "payment-proofs",
        element: <Lazy><PaymentProof /></Lazy>,
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
        element: <Lazy><AllMessages /></Lazy>,
      },
      {
        path: "register",
        element: <Lazy><Register /></Lazy>,
      },
      {
        path: "login",
        element: <Lazy><Login /></Lazy>,
      }, 
      {
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
      // --- USER ROUTES ---
      {
        path: "user",
        children: userRoutes,
      },
      // --- ADMIN ROUTES ---
      {
        path: "admin",
        element: <Lazy><AdminLayout /></Lazy>,
        children: adminRoutes,
      },
    ],
  },
]);

export default router;
