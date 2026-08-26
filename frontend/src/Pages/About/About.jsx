import React from 'react';
import AboutHero from './AboutHero';
import AboutStats from './AboutStats';
import MissionVision from './MissionVision';
import WhyChooseUs from './WhyChooseUs';
import TrustedBanner from './TrustedBanner';

const About = () => {
    return (
        <div className="bg-white min-h-screen pb-16">
            <AboutHero />
            <div className="max-w-[1140px] mx-auto px-6">
                <AboutStats />
                <MissionVision />
                <WhyChooseUs />
                <TrustedBanner />
            </div>
        </div>
    );
};

export default About;
