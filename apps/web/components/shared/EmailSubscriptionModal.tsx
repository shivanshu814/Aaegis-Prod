"use client";

import { useState } from "react";

interface EmailSubscriptionModalProps {
    isOpen: boolean;
    onSubscribe: (email: string, notifications?: {
        protocolHealth?: boolean;
        liquidationWarning?: boolean;
        positionUpdates?: boolean;
    }) => Promise<boolean>;
    onSkip: () => void;
    isLoading?: boolean;
}

export default function EmailSubscriptionModal({
    isOpen,
    onSubscribe,
    onSkip,
    isLoading = false,
}: EmailSubscriptionModalProps) {
    const [email, setEmail] = useState("");
    const [notifications, setNotifications] = useState({
        protocolHealth: true,
        liquidationWarning: true,
        positionUpdates: true,
    });
    const [error, setError] = useState("");
    const [step, setStep] = useState<"email" | "preferences">("email");

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!email) {
            setError("Please enter your email");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email");
            return;
        }

        setError("");
        const success = await onSubscribe(email, notifications);

        if (!success) {
            setError("Failed to subscribe. Please try again.");
        }
    };

    const handleNextStep = () => {
        if (!email) {
            setError("Please enter your email");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email");
            return;
        }
        setError("");
        setStep("preferences");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="relative p-6 pb-4 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20">
                    <div className="absolute top-4 right-4">
                        <button
                            onClick={onSkip}
                            className="text-gray-400 hover:text-white transition p-1"
                            aria-label="Close"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-4">
                            <span className="text-4xl">🔔</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {step === "email" ? "Stay Updated!" : "Notification Preferences"}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {step === "email"
                                ? "Get alerts about your positions and protocol health"
                                : "Choose what notifications you'd like to receive"
                            }
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === "email" ? (
                        <>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                                />
                                {error && (
                                    <p className="mt-2 text-sm text-red-400">{error}</p>
                                )}
                            </div>

                            {/* Benefits */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <span className="flex-shrink-0 w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                        ⚠️
                                    </span>
                                    <span>Liquidation warnings before it&apos;s too late</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <span className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                        ❤️
                                    </span>
                                    <span>Protocol health status updates</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <span className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                        📊
                                    </span>
                                    <span>Position and transaction notifications</span>
                                </div>
                            </div>

                            <button
                                onClick={handleNextStep}
                                disabled={isLoading}
                                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="space-y-4 mb-6">
                                {[
                                    { key: "liquidationWarning", label: "Liquidation Warnings", desc: "Get notified when your position is at risk", emoji: "⚠️", default: true },
                                    { key: "protocolHealth", label: "Protocol Health", desc: "Updates about protocol status changes", emoji: "❤️", default: true },
                                    { key: "positionUpdates", label: "Position Updates", desc: "Notifications about your transactions", emoji: "📊", default: true },
                                ].map((item) => (
                                    <label
                                        key={item.key}
                                        className="flex items-start gap-4 p-4 bg-gray-800/30 rounded-xl cursor-pointer hover:bg-gray-800/50 transition"
                                    >
                                        <div className="flex-shrink-0 pt-0.5">
                                            <input
                                                type="checkbox"
                                                checked={notifications[item.key as keyof typeof notifications]}
                                                onChange={(e) => setNotifications({
                                                    ...notifications,
                                                    [item.key]: e.target.checked,
                                                })}
                                                className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span>{item.emoji}</span>
                                                <span className="font-medium text-white">{item.label}</span>
                                            </div>
                                            <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {error && (
                                <p className="mb-4 text-sm text-red-400 text-center">{error}</p>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep("email")}
                                    disabled={isLoading}
                                    className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Subscribing...
                                        </span>
                                    ) : (
                                        "Subscribe"
                                    )}
                                </button>
                            </div>
                        </>
                    )}

                    {/* Skip option */}
                    <button
                        onClick={onSkip}
                        className="w-full mt-4 text-center text-sm text-gray-500 hover:text-gray-300 transition"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
}
