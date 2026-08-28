import React, { useEffect, useState } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import Topbar from "./Components/Navbar/Navbar";
import "./App.css";
import { Toaster } from "react-hot-toast";
import store from "./redux/store";
import { Provider, useSelector } from "react-redux";
import DefaultFetch from "./Components/DefaultFetch";
import Footer from "./Pages/Footer/Footer";
import NoInternet from "./Components/NoInternet";
import { QueryClient, QueryClientProvider } from "react-query";
import { api } from "./util/axios";
import { SocketProvider } from "./Components/SocketContext";
import { Notifications } from "react-push-notification";
import ErrorBoundary from "./Components/ErrorBoundary";

const queryClient = new QueryClient();

import { useLocation } from "react-router-dom";

// Internal Layout wrapper to connect with Redux user state
const MainLayout = () => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <>
        <ScrollRestoration />
        <DefaultFetch />
        <Toaster />
        <Outlet />
      </>
    );
  }

  return (
    <>
      <ScrollRestoration />
      <DefaultFetch />
      <Toaster />
      <Topbar />
      <div className={user ? "w-full lg:pl-72 pb-20 lg:pb-6 transition-all min-h-screen" : "w-full min-h-screen"}>
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

const App = () => {
  const [isServerRunning, setIsServerRunning] = useState(true);

  useEffect(() => {
    // Check if the API server is running
    const checkServerStatus = async () => {
      try {
        const res = await api.get("/setting");
        setIsServerRunning(res.status === 200);
      } catch (error) {
        console.error("API Check Failed:", error);
        setIsServerRunning(false);
      }
    };

    checkServerStatus();
  }, []);

  return (
    <ErrorBoundary>
      <main className="w-full overflow-x-hidden">
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <SocketProvider>
              <Notifications />
              {isServerRunning ? <MainLayout /> : <NoInternet />}
            </SocketProvider>
          </QueryClientProvider>
        </Provider>
      </main>
    </ErrorBoundary>
  );
};

export default App;