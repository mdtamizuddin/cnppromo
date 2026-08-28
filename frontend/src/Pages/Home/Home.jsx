import React, { useEffect } from "react";
import HeroArea from "./HeroArea";
import Statistic from "./Statistic";
import HowItWorks from "./HowItWorks";
import AboutUs from "./AboutUs";
import CtaBanner from "./CtaBanner";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { api } from "../../util/axios";

const Home = () => {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/user/home"); // or wherever the logged-in user dashboard is
    }
  }, [user, navigate]);

  // Fetch stats here so we can pass them down if needed, or Statistic can fetch it itself.
  // We will let Statistic fetch it itself to keep it decoupled.

  return (
    <div className="home bg-[#f8f9ff] min-h-screen">
      <HeroArea />
      <div className="bg-white">
        <Statistic />
        <HowItWorks />
        <AboutUs />
        <CtaBanner />
      </div>
    </div>
  );
};

export default Home;
