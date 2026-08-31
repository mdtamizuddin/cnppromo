import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "../App";
import Loader from "../Components/Loader";
import AuthChecker from "./AuthChecker";
import RouteErrorBoundary from "../Components/RouteErrorBoundary";
import { userRoutes } from "./userRoutes";
import { adminRoutes } from "./adminRoutes";

// Helper for dynamic imports with auto-reload retry if a chunk hash changed after deployment
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

const Home = lazyRetry(() => import("../Pages/Home/Home"));
const About = lazyRetry(() => import("../Pages/About/About"));
const HowItWorks = lazyRetry(() => import("../Pages/HowItWorks/HowItWorks"));
const Register = lazyRetry(() => import("../Pages/Auth/Register/Register"));
const Login = lazyRetry(() => import("../Pages/Auth/Login/Login"));
const Reviews = lazyRetry(() => import("../Pages/Reviews/Reviews"));
const Reset = lazyRetry(() => import("../Pages/Auth/Reset/Reset"));
const Message = lazyRetry(() => import("../Pages/Message/Message"));
const AllMessages = lazyRetry(() => import("../Pages/Message/AllMessages"));
const LoginWithoutPass = lazyRetry(() => import("../Pages/Auth/Login/WithOutPass"));
const PaymentProof = lazyRetry(() => import("../Pages/PaymentProof/PaymentProof"));
const Features = lazyRetry(() => import("../Pages/Features/Features"));
const AdminLayout = lazyRetry(() => import("../Components/AdminLayout/AdminLayout"));

const Lazy = ({ children }) => <Suspense fallback={<Loader />}>{children}</Suspense>;

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <RouteErrorBoundary />,
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
        element: <AuthChecker><Lazy><AllMessages /></Lazy></AuthChecker>,
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
      // --- 404 CATCH-ALL ---
      {
        path: "*",
        element: <RouteErrorBoundary />,
      },
    ],
  },
]);

export default router;
