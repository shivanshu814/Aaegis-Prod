"use client";

import EmailSubscriptionModal from "@/components/shared/EmailSubscriptionModal";
import { useUserTracking } from "@/hooks/user/useUserTracking";

export default function UserTrackingWrapper({ children }: { children: React.ReactNode }) {
    const {
        showEmailModal,
        subscribeEmail,
        skipSubscription,
        isLoading,
    } = useUserTracking();

    return (
        <>
            {children}
            <EmailSubscriptionModal
                isOpen={showEmailModal}
                onSubscribe={subscribeEmail}
                onSkip={skipSubscription}
                isLoading={isLoading}
            />
        </>
    );
}
