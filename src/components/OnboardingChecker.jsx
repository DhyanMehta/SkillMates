import React from 'react'; import { useEffect, useState } from 'react';

import { useAuth } from '../context/AuthContext'; import { Navigate } from 'react-router-dom';

import { Navigate } from 'react-router-dom'; import { useAuth } from '../context/AuthContext';



const OnboardingChecker = ({ children }) => {
    const OnboardingChecker = ({ children }) => {

        const { user } = useAuth(); const { user, checkOnboardingStatus } = useAuth();

        const [needsOnboarding, setNeedsOnboarding] = useState(null);

        // Check if user needs onboarding (no skills set)    const [checking, setChecking] = useState(true);

        if (user && (!user.skills || user.skills.length === 0)) {

            return <Navigate to="/onboarding" replace />; useEffect(() => {

            }        const checkStatus = async () => {

                if (!user) {

                    return children; setChecking(false);

                }; return;

            }

            export default OnboardingChecker;
            const { needsOnboarding } = await checkOnboardingStatus(user.id);
            setNeedsOnboarding(needsOnboarding);
            setChecking(false);
        };

        checkStatus();
    }, [user, checkOnboardingStatus]);

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Setting up your profile...</p>
                </div>
            </div>
        );
    }

    if (needsOnboarding) {
        return <Navigate to="/onboarding" replace />;
    }

    return children;
};

export default OnboardingChecker;