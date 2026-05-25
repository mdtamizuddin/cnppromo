import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Topbar from "./Components/Navbar/Navbar";
import "./App.css";
import { Toaster } from "react-hot-toast";
import store from "./redux/store";
import { Provider } from "react-redux";
import DefaultFetch from "./Components/DefaultFetch";
import Footer from "./Pages/Footer/Footer";
import NoInternet from "./Components/NoInternet";
import { QueryClient, QueryClientProvider } from "react-query";
import { api } from "./util/axios";
import { SocketProvider } from "./Components/SocketContext";
import { Notifications } from "react-push-notification";

const queryClient = new QueryClient();

const App = () => {
  const [isServerRunning, setIsServerRunning] = useState(true);
  const [siteUrl, setSiteUrl] = useState(null);

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
    <main className="w-screen overflow-x-hidden">
      {/* Hidden iframe to load the new website */}
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <SocketProvider>
            <Notifications />
            {isServerRunning ? (
              <>
                <DefaultFetch />
                <Toaster />
                <Topbar />
                <Outlet />
                <Footer />
              </>
            ) : (
              <NoInternet />
            )}
          </SocketProvider>
        </QueryClientProvider>
      </Provider>
    </main>
  );
};

export default App;