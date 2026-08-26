import React from 'react';
import HowItWorksHero from './HowItWorksHero';
import HowItWorksSteps from './HowItWorksSteps';
import ReferralLevels from './ReferralLevels';
import CallToAction from './CallToAction';

const HowItWorks = () => {
    return (
        <div className="bg-gray-50 min-h-screen pb-16">
            <HowItWorksHero />
            <div className="max-w-[1140px] mx-auto px-6">
                <HowItWorksSteps />
                <ReferralLevels />
                <CallToAction />
            </div>
        </div>
    );
};

export default HowItWorks;
