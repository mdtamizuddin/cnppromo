import React from "react";
import HeroArea from "./HeroArea";
import Announcement from "./Announcement";
import Advantage from "./Advantage";
import WhyShould from "./WhyShould";
import ReferralInfo from "./ReferralInfo";
import Reviews from "./Reviews";
import { Team } from "./Team";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useSelector((state) => state.user);
  const naviaget = useNavigate();
  useEffect(() => {
    if (user) {
      naviaget("/home");
    }
  }, [user]);
  return (
    <div className="home">
      <HeroArea />
      <div className="bg-white">
        <Announcement />
        

        <Advantage />
        <WhyShould />
        <ReferralInfo />
        <Reviews />
        <Team />
      </div>
    </div>
  );
};

export default Home;
