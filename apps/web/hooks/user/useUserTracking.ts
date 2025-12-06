"use client";

import { trpc } from "@/providers/query/trpc";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface UserData {
    walletAddress: string;
    email: string | null;
    isSubscribed: boolean;
    notifications: {
        protocolHealth: boolean;
        liquidationWarning: boolean;
        positionUpdates: boolean;
        weeklyDigest: boolean;
        marketAlerts: boolean;
    };
}

export function useUserTracking() {
    const { publicKey, connected } = useWallet();
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const trackConnectionMutation = trpc.users.trackConnection.useMutation();
    const subscribeEmailMutation = trpc.users.subscribeEmail.useMutation();
    const updateNotificationsMutation = trpc.users.updateNotifications.useMutation();

    const lastTrackedWallet = useRef<string | null>(null);

    // Track user when wallet connects
    const trackUser = useCallback(async (walletAddress: string) => {
        if (lastTrackedWallet.current === walletAddress) return;

        lastTrackedWallet.current = walletAddress;
        setIsLoading(true);
        try {
            const result = await trackConnectionMutation.mutateAsync({
                walletAddress,
            });

            setUserData({
                walletAddress: result.user.walletAddress,
                email: result.user.email || null,
                isSubscribed: result.user.isSubscribed,
                notifications: result.user.notifications,
            });

            // Show email modal if user needs to subscribe
            if (result.needsEmail) {
                // Small delay to not interrupt wallet connection flow
                setTimeout(() => {
                    setShowEmailModal(true);
                }, 1500);
            }
        } catch (error) {
            console.error("Failed to track user:", error);
            // Reset last tracked wallet on error so we can try again
            lastTrackedWallet.current = null;
        } finally {
            setIsLoading(false);
        }
    }, [trackConnectionMutation]);

    // Subscribe email
    const subscribeEmail = useCallback(async (
        email: string,
        notifications?: Partial<UserData["notifications"]>
    ) => {
        if (!publicKey) return false;

        setIsLoading(true);
        try {
            const result = await subscribeEmailMutation.mutateAsync({
                walletAddress: publicKey.toString(),
                email,
                notifications,
            });

            setUserData((prev) => prev ? {
                ...prev,
                email,
                isSubscribed: true,
            } : null);

            setShowEmailModal(false);
            return result.success;
        } catch (error) {
            console.error("Failed to subscribe email:", error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [publicKey, subscribeEmailMutation]);

    // Update notification preferences
    const updateNotifications = useCallback(async (
        notifications: Partial<UserData["notifications"]>
    ) => {
        if (!publicKey) return false;

        try {
            const result = await updateNotificationsMutation.mutateAsync({
                walletAddress: publicKey.toString(),
                notifications,
            });

            setUserData((prev) => prev ? {
                ...prev,
                notifications: { ...prev.notifications, ...notifications },
            } : null);

            return result.success;
        } catch (error) {
            console.error("Failed to update notifications:", error);
            return false;
        }
    }, [publicKey, updateNotificationsMutation]);

    // Skip email subscription
    const skipSubscription = useCallback(() => {
        setShowEmailModal(false);
    }, []);

    // Track on wallet connect
    useEffect(() => {
        if (connected && publicKey) {
            const walletAddress = publicKey.toString();
            if (lastTrackedWallet.current !== walletAddress) {
                trackUser(walletAddress);
            }
        } else if (!connected) {
            setUserData(null);
            setShowEmailModal(false);
            lastTrackedWallet.current = null;
        }
    }, [connected, publicKey, trackUser]);

    return {
        userData,
        isLoading,
        showEmailModal,
        setShowEmailModal,
        subscribeEmail,
        updateNotifications,
        skipSubscription,
        isSubscribed: userData?.isSubscribed ?? false,
    };
}
