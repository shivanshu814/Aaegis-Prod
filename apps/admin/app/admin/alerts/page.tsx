"use client";

import {
    AlertTriangle,
    Bell,
    CheckCircle,
    Eye,
    EyeOff,
    Mail,
    MailCheck,
    RefreshCw,
    Send,
    Shield,
    Trash2,
    Zap
} from "lucide-react";
import { useState } from "react";
import { trpc } from "../../providers/trpc";

type AlertType = 'LIQUIDATION' | 'ORACLE_FAILURE' | 'PROTOCOL_PAUSE' | 'HEALTH_WARNING';
type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

interface AlertItem {
    _id: string;
    type: AlertType;
    severity: AlertSeverity;
    message: string;
    details?: Record<string, unknown>;
    timestamp: number;
    read: boolean;
    emailSent?: boolean;
}

function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getSeverityStyles(severity: AlertSeverity) {
    switch (severity) {
        case 'CRITICAL':
            return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' };
        case 'WARNING':
            return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/50' };
        case 'INFO':
        default:
            return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' };
    }
}

function getTypeIcon(type: AlertType) {
    switch (type) {
        case 'LIQUIDATION':
            return '💀';
        case 'ORACLE_FAILURE':
            return '🔮';
        case 'PROTOCOL_PAUSE':
            return '⏸️';
        case 'HEALTH_WARNING':
            return '❤️‍🩹';
        default:
            return '⚠️';
    }
}

export default function AlertsPage() {
    const [filterType, setFilterType] = useState<AlertType | 'ALL'>('ALL');
    const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'ALL'>('ALL');
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

    // Fetch alerts
    const { data: alerts, isLoading: alertsLoading, refetch: refetchAlerts } = trpc.alerts.getRecent.useQuery({
        limit: 50,
        type: filterType === 'ALL' ? undefined : filterType,
        severity: filterSeverity === 'ALL' ? undefined : filterSeverity,
        unreadOnly: showUnreadOnly,
    });

    // Fetch stats
    const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.alerts.getStats.useQuery();

    // Fetch email status
    const { data: emailStatus } = trpc.alerts.getEmailStatus.useQuery();

    // Mutations
    const markAsReadMutation = trpc.alerts.markAsRead.useMutation({
        onSuccess: () => {
            refetchAlerts();
            refetchStats();
        },
    });

    const markAllAsReadMutation = trpc.alerts.markAllAsRead.useMutation({
        onSuccess: () => {
            refetchAlerts();
            refetchStats();
        },
    });

    const sendTestEmailMutation = trpc.alerts.sendTestEmail.useMutation();

    const resendEmailMutation = trpc.alerts.resendEmail.useMutation();

    const deleteMutation = trpc.alerts.delete.useMutation({
        onSuccess: () => {
            refetchAlerts();
            refetchStats();
        },
    });

    const clearAllMutation = trpc.alerts.clearAll.useMutation({
        onSuccess: () => {
            refetchAlerts();
            refetchStats();
        },
    });

    const handleRefresh = () => {
        refetchAlerts();
        refetchStats();
    };

    const handleSendTestEmail = async () => {
        const result = await sendTestEmailMutation.mutateAsync();
        alert(result.message);
    };

    const statCards = [
        {
            title: "Total Alerts",
            value: statsLoading ? "..." : String(stats?.total || 0),
            icon: Bell,
            color: "text-purple-400",
            bg: "bg-purple-500/20",
        },
        {
            title: "Unread",
            value: statsLoading ? "..." : String(stats?.unread || 0),
            icon: EyeOff,
            color: "text-amber-400",
            bg: "bg-amber-500/20",
        },
        {
            title: "Critical",
            value: statsLoading ? "..." : String(stats?.bySeverity?.CRITICAL || 0),
            icon: AlertTriangle,
            color: "text-red-400",
            bg: "bg-red-500/20",
        },
        {
            title: "Email Status",
            value: emailStatus?.configured ? "Active" : "Not Configured",
            icon: emailStatus?.configured ? MailCheck : Mail,
            color: emailStatus?.configured ? "text-green-400" : "text-gray-400",
            bg: emailStatus?.configured ? "bg-green-500/20" : "bg-gray-500/20",
        },
    ];

    const alertTypes: (AlertType | 'ALL')[] = ['ALL', 'LIQUIDATION', 'ORACLE_FAILURE', 'PROTOCOL_PAUSE', 'HEALTH_WARNING'];
    const severities: (AlertSeverity | 'ALL')[] = ['ALL', 'INFO', 'WARNING', 'CRITICAL'];

    return (
        <div className="p-8 text-white max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">
                        Alerts & Notifications
                    </h1>
                    <p className="text-gray-400">
                        Monitor protocol alerts and manage email notifications.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleSendTestEmail}
                        disabled={!emailStatus?.configured || sendTestEmailMutation.isLoading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${emailStatus?.configured
                            ? 'bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30'
                            : 'bg-gray-500/20 border border-gray-500/50 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <Send size={16} />
                        {sendTestEmailMutation.isLoading ? 'Sending...' : 'Send Test Email'}
                    </button>
                    <button
                        onClick={() => markAllAsReadMutation.mutate()}
                        disabled={markAllAsReadMutation.isLoading || !stats?.unread}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                        <Eye size={16} />
                        Mark All Read
                    </button>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm">{stat.title}</p>
                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Email Configuration Notice */}
            {!emailStatus?.configured && (
                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
                    <Mail className="text-amber-400 mt-0.5" size={20} />
                    <div>
                        <h3 className="text-amber-400 font-semibold">Email Notifications Not Configured</h3>
                        <p className="text-gray-400 text-sm mt-1">
                            Add SMTP settings to your .env file to enable email alerts:
                        </p>
                        <code className="text-xs text-gray-500 mt-2 block bg-black/30 p-2 rounded-lg">
                            SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL
                        </code>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">Type:</span>
                    <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                        {alertTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-3 py-1 rounded-lg text-sm transition-all ${filterType === type
                                    ? 'bg-purple-500 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {type === 'ALL' ? 'All' : type.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">Severity:</span>
                    <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                        {severities.map(sev => (
                            <button
                                key={sev}
                                onClick={() => setFilterSeverity(sev)}
                                className={`px-3 py-1 rounded-lg text-sm transition-all ${filterSeverity === sev
                                    ? 'bg-purple-500 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {sev}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${showUnreadOnly
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                >
                    <EyeOff size={14} />
                    Unread Only
                </button>
            </div>

            {/* Alerts List */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Zap className="text-purple-400" size={20} />
                        Recent Alerts
                    </h2>
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to delete all alerts?')) {
                                clearAllMutation.mutate();
                            }
                        }}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                        <Trash2 size={14} />
                        Clear All
                    </button>
                </div>

                {alertsLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                ) : alerts && alerts.length > 0 ? (
                    <div className="divide-y divide-white/5">
                        {(alerts as unknown as AlertItem[]).map((alert) => {
                            const severityStyles = getSeverityStyles(alert.severity);
                            return (
                                <div
                                    key={alert._id}
                                    className={`p-4 hover:bg-white/5 transition-all ${!alert.read ? 'bg-purple-500/5' : ''}`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-xl ${severityStyles.bg} flex items-center justify-center flex-shrink-0 text-xl`}>
                                            {getTypeIcon(alert.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityStyles.bg} ${severityStyles.text}`}>
                                                    {alert.severity}
                                                </span>
                                                <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                                                    {alert.type.replace('_', ' ')}
                                                </span>
                                                {!alert.read && (
                                                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                                                )}
                                            </div>
                                            <p className="text-white font-medium">{alert.message}</p>
                                            {alert.details && (
                                                <pre className="mt-2 text-xs text-gray-500 bg-black/30 rounded-lg p-2 overflow-x-auto max-w-full">
                                                    {JSON.stringify(alert.details, null, 2)}
                                                </pre>
                                            )}
                                            <p className="text-xs text-gray-500 mt-2">
                                                {formatDate(alert.timestamp)}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {!alert.read && (
                                                <button
                                                    onClick={() => markAsReadMutation.mutate({ id: alert._id })}
                                                    className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all"
                                                    title="Mark as read"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            )}
                                            {emailStatus?.configured && (
                                                <button
                                                    onClick={() => resendEmailMutation.mutate({ id: alert._id })}
                                                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                                                    title="Resend email"
                                                >
                                                    <Send size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteMutation.mutate({ id: alert._id })}
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Shield size={48} className="mb-4 opacity-50" />
                        <p className="text-lg font-medium">No Alerts</p>
                        <p className="text-sm mt-1">Protocol is running smoothly 🎉</p>
                    </div>
                )}
            </div>

            {/* Quick Create Alert (for testing) */}
            <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-amber-400" size={20} />
                    Create Test Alert
                </h3>
                <TestAlertForm onSuccess={() => { refetchAlerts(); refetchStats(); }} />
            </div>
        </div>
    );
}

// Test Alert Form Component
function TestAlertForm({ onSuccess }: { onSuccess: () => void }) {
    const [type, setType] = useState<AlertType>('HEALTH_WARNING');
    const [severity, setSeverity] = useState<AlertSeverity>('INFO');
    const [message, setMessage] = useState('');
    const [sendEmail, setSendEmail] = useState(true);

    const createAlertMutation = trpc.alerts.create.useMutation({
        onSuccess: () => {
            setMessage('');
            onSuccess();
            alert('Alert created successfully!');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        createAlertMutation.mutate({
            type,
            severity,
            message: message.trim(),
            details: { source: 'Admin Panel', testMode: true },
            sendEmail,
        });
    };

    const { data: emailStatus } = trpc.alerts.getEmailStatus.useQuery();

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as AlertType)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                    >
                        <option value="LIQUIDATION">Liquidation</option>
                        <option value="ORACLE_FAILURE">Oracle Failure</option>
                        <option value="PROTOCOL_PAUSE">Protocol Pause</option>
                        <option value="HEALTH_WARNING">Health Warning</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Severity</label>
                    <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value as AlertSeverity)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                    >
                        <option value="INFO">Info</option>
                        <option value="WARNING">Warning</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                </div>
                <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={sendEmail}
                            onChange={(e) => setSendEmail(e.target.checked)}
                            disabled={!emailStatus?.configured}
                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-purple-500 focus:ring-purple-500"
                        />
                        <span className={`text-sm ${emailStatus?.configured ? 'text-gray-300' : 'text-gray-500'}`}>
                            Send Email Notification
                        </span>
                    </label>
                </div>
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-2">Message</label>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter alert message..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
            </div>
            <button
                type="submit"
                disabled={!message.trim() || createAlertMutation.isLoading}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center gap-2"
            >
                <Bell size={18} />
                {createAlertMutation.isLoading ? 'Creating...' : 'Create Alert'}
            </button>
        </form>
    );
}
