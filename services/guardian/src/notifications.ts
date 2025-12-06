import * as nodemailer from "nodemailer";
import { logger } from "./utils/logger";

// Transaction types for user notifications
export type TransactionType = 'MINT' | 'REDEEM' | 'DEPOSIT' | 'WITHDRAW' | 'BORROW' | 'REPAY' | 'LIQUIDATION';

export interface UserTransactionData {
    userEmail?: string;
    userWallet: string;
    transactionType: TransactionType;
    amount: number;
    tokenSymbol: string;
    txSignature: string;
    vaultType?: string;
    healthFactor?: number;
    timestamp: number;
}

export interface NotificationService {
    sendLiquidationAlert(data: {
        positionOwner: string;
        vaultType: string;
        debtRepaid: number;
        collateralReceived: number;
        timestamp: number;
    }): Promise<void>;

    sendOracleFailure(data: {
        oracleAccount: string;
        errorMessage: string;
        timestamp: number;
    }): Promise<void>;

    sendProtocolPauseAlert(data: {
        reason: string;
        pausedBy: string;
        timestamp: number;
    }): Promise<void>;

    sendTransactionEmail(data: UserTransactionData): Promise<void>;
}

class ConsoleNotificationService implements NotificationService {
    async sendLiquidationAlert(data: Record<string, unknown>): Promise<void> {
        logger.warn("🚨 LIQUIDATION ALERT", data);
    }

    async sendOracleFailure(data: Record<string, unknown>): Promise<void> {
        logger.error("⚠️ ORACLE FAILURE", data);
    }

    async sendProtocolPauseAlert(data: Record<string, unknown>): Promise<void> {
        logger.info("⏸️ PROTOCOL PAUSED", data);
    }

    async sendTransactionEmail(data: UserTransactionData): Promise<void> {
        logger.info(`📧 TRANSACTION: ${data.transactionType}`, data);
    }
}

class EmailNotificationService implements NotificationService {
    private transporter: nodemailer.Transporter;
    private adminEmail: string;
    private fromAddress: string;

    constructor(smtpConfig: nodemailer.TransportOptions, adminEmail: string) {
        this.transporter = nodemailer.createTransport(smtpConfig);
        this.adminEmail = adminEmail;
        this.fromAddress = process.env.SMTP_FROM || '"Aegis Protocol" <alerts@aegis.protocol>';
    }

    private getBaseHtml(content: string, title: string = "Notification"): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #0B0C10; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #E5E7EB;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        
        <!-- Brand Header -->
        <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="margin: 0; font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #34D399 0%, #22D3EE 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.02em;">Aegis Finance</h1>
            <p style="color: #6B7280; margin: 8px 0 0 0; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">${title}</p>
        </div>

        <!-- Main Content Card -->
        <div style="background: #111827; border: 1px solid #1F2937; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
            ${content}
        </div>

        <!-- Minimal Footer -->
        <div style="text-align: center; margin-top: 40px;">
            <div style="display: flex; justify-content: center; gap: 24px; margin-bottom: 24px;">
                <a href="https://app-aaegis-protocol.vercel.app/" style="color: #6B7280; text-decoration: none; font-size: 13px; font-weight: 500;">App</a>
                <a href="https://twitter.com/aaegis_fi" style="color: #6B7280; text-decoration: none; font-size: 13px; font-weight: 500;">Twitter</a>
                <a href="https://docs-aageis-finance.vercel.app/" style="color: #6B7280; text-decoration: none; font-size: 13px; font-weight: 500;">Docs</a>
            </div>
            <p style="color: #4B5563; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} Aegis Finance. Secured by Solana.
            </p>
        </div>
    </div>
</body>
</html>`;
    }

    async sendLiquidationAlert(data: {
        positionOwner: string;
        vaultType: string;
        debtRepaid: number;
        collateralReceived: number;
        timestamp: number;
    }): Promise<void> {
        const subject = "💀 Aegis Finance: Position Liquidated";
        const theme = { color: '#EF4444', icon: '💀', title: 'Position Liquidated' };

        const content = `
            <div style="padding: 32px;">
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
                    <span style="font-size: 32px;">${theme.icon}</span>
                    <h2 style="margin: 0; color: ${theme.color}; font-size: 24px; font-weight: 700;">${theme.title}</h2>
                </div>

                <div style="background: #0B0C10; border-radius: 16px; padding: 24px; border: 1px solid #1F2937; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #1F2937; padding-bottom: 12px;">
                        <span style="color: #9CA3AF; font-size: 14px;">Debt Repaid</span>
                        <span style="color: #F3F4F6; font-weight: 600;">$${(data.debtRepaid / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #9CA3AF; font-size: 14px;">Collateral Seized</span>
                        <span style="color: #EF4444; font-weight: 600;">${(data.collateralReceived / 1_000_000_000).toFixed(4)} tokens</span>
                    </div>
                </div>

                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <div style="background: #1F2937; padding: 8px 12px; border-radius: 8px; font-size: 12px; color: #9CA3AF;">
                        Owner: <span style="color: #E5E7EB; font-family: monospace;">${this.truncateAddress(data.positionOwner)}</span>
                    </div>
                    <div style="background: #1F2937; padding: 8px 12px; border-radius: 8px; font-size: 12px; color: #9CA3AF;">
                        Vault: <span style="color: #E5E7EB;">${data.vaultType}</span>
                    </div>
                </div>

                <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1F2937;">
                    <span style="color: #6B7280; font-size: 12px;">Timestamp: ${new Date(data.timestamp * 1000).toISOString()}</span>
                </div>
            </div>
        `;

        await this.sendEmail(this.adminEmail, subject, this.getBaseHtml(content, "Liquidation Alert"));
    }

    async sendOracleFailure(data: {
        oracleAccount: string;
        errorMessage: string;
        timestamp: number;
    }): Promise<void> {
        const subject = "⚠️ Aegis Finance: Oracle Failure";
        const theme = { color: '#F59E0B', icon: '🔮', title: 'Oracle Failure' };

        const content = `
            <div style="padding: 32px;">
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
                    <span style="font-size: 32px;">${theme.icon}</span>
                    <h2 style="margin: 0; color: ${theme.color}; font-size: 24px; font-weight: 700;">${theme.title}</h2>
                </div>

                <div style="background: #451a03; border: 1px solid #78350f; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                    <p style="margin: 0; color: #FCD34D; font-family: monospace; font-size: 13px;">${data.errorMessage}</p>
                </div>

                <div style="display: flex; gap: 8px;">
                    <div style="background: #1F2937; padding: 8px 12px; border-radius: 8px; font-size: 12px; color: #9CA3AF;">
                        Oracle: <span style="color: #E5E7EB; font-family: monospace;">${this.truncateAddress(data.oracleAccount)}</span>
                    </div>
                </div>

                <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1F2937;">
                    <span style="color: #6B7280; font-size: 12px;">Timestamp: ${new Date(data.timestamp * 1000).toISOString()}</span>
                </div>
            </div>
        `;

        await this.sendEmail(this.adminEmail, subject, this.getBaseHtml(content, "System Alert"));
    }

    async sendProtocolPauseAlert(data: {
        reason: string;
        pausedBy: string;
        timestamp: number;
    }): Promise<void> {
        const subject = "⏸️ Aegis Finance: Protocol Paused";
        const theme = { color: '#3B82F6', icon: '⏸️', title: 'Protocol Paused' };

        const content = `
            <div style="padding: 32px;">
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
                    <span style="font-size: 32px;">${theme.icon}</span>
                    <h2 style="margin: 0; color: ${theme.color}; font-size: 24px; font-weight: 700;">${theme.title}</h2>
                </div>

                <p style="color: #E5E7EB; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    The protocol was paused by an administrator. All mutable operations are suspended until further notice.
                </p>

                <div style="background: #0B0C10; border-radius: 16px; padding: 24px; border: 1px solid #1F2937;">
                    <div style="margin-bottom: 16px;">
                        <span style="display: block; color: #9CA3AF; font-size: 12px; text-transform: uppercase;">Reason</span>
                        <span style="display: block; color: #F3F4F6; margin-top: 4px;">${data.reason}</span>
                    </div>
                    <div>
                        <span style="display: block; color: #9CA3AF; font-size: 12px; text-transform: uppercase;">Paused By</span>
                        <span style="display: block; color: #F3F4F6; font-family: monospace; margin-top: 4px;">${this.truncateAddress(data.pausedBy)}</span>
                    </div>
                </div>

                <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1F2937;">
                    <span style="color: #6B7280; font-size: 12px;">Timestamp: ${new Date(data.timestamp * 1000).toISOString()}</span>
                </div>
            </div>
        `;

        await this.sendEmail(this.adminEmail, subject, this.getBaseHtml(content, "Protocol Alert"));
    }

    async sendTransactionEmail(data: UserTransactionData): Promise<void> {
        const toEmail = data.userEmail || this.adminEmail;
        const config = this.getTransactionTypeConfig(data.transactionType);
        const subject = `${config.emoji} Aegis Finance: ${config.title} Confirmed`;

        const content = `
            <div style="padding: 32px;">
                <!-- Header with Icon -->
                <div style="text-align: center; margin-bottom: 32px;">
                    <div style="width: 80px; height: 80px; background: ${config.color}15; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
                        <span style="font-size: 40px;">${config.emoji}</span>
                    </div>
                    <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #F3F4F6;">${config.title} Successful</h2>
                    <p style="margin: 0; color: #9CA3AF; font-size: 16px;">${config.description}</p>
                </div>

                <!-- Main Amount -->
                <div style="background: #0B0C10; padding: 24px; border-radius: 16px; text-align: center; border: 1px solid #1F2937; margin-bottom: 24px;">
                    <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Amount</p>
                    <div style="font-size: 32px; font-weight: 800; color: ${config.color};">
                        ${(data.amount / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} 
                        <span style="font-size: 20px; color: #6B7280; margin-left: 4px;">${data.tokenSymbol}</span>
                    </div>
                </div>

                <!-- Details List -->
                <div style="background: #1F2937; border-radius: 16px; padding: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #374151;">
                        <span style="color: #9CA3AF; font-size: 14px;">Wallet</span>
                        <span style="color: #E5E7EB; font-family: monospace;">${this.truncateAddress(data.userWallet)}</span>
                    </div>
                    
                    ${data.vaultType ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #374151;">
                        <span style="color: #9CA3AF; font-size: 14px;">Vault</span>
                        <span style="color: #E5E7EB;">${data.vaultType}</span>
                    </div>` : ''}
                    
                    ${data.healthFactor ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #374151;">
                        <span style="color: #9CA3AF; font-size: 14px;">Health Factor</span>
                        <span style="font-weight: 600; color: ${data.healthFactor > 150 ? '#10B981' : data.healthFactor > 120 ? '#F59E0B' : '#EF4444'};">${data.healthFactor.toFixed(2)}%</span>
                    </div>` : ''}

                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #9CA3AF; font-size: 14px;">Transaction</span>
                        <a href="https://solscan.io/tx/${data.txSignature}" style="color: #60A5FA; text-decoration: none; font-size: 14px; font-weight: 500;">View on Solscan ↗</a>
                    </div>
                </div>
            </div>
        `;

        await this.sendEmail(toEmail, subject, this.getBaseHtml(content, "Transaction Receipt"));
    }

    private getTransactionTypeConfig(type: TransactionType): { emoji: string; title: string; color: string; description: string } {
        const configs: Record<TransactionType, { emoji: string; title: string; color: string; description: string }> = {
            MINT: {
                emoji: "🪙",
                title: "Mint",
                color: "#10B981",
                description: "You have successfully minted stablecoins.",
            },
            REDEEM: {
                emoji: "💰",
                title: "Redeem",
                color: "#F59E0B",
                description: "You have successfully redeemed your collateral.",
            },
            DEPOSIT: {
                emoji: "📥",
                title: "Deposit",
                color: "#3B82F6",
                description: "You have successfully deposited collateral.",
            },
            WITHDRAW: {
                emoji: "📤",
                title: "Withdraw",
                color: "#8B5CF6",
                description: "You have successfully withdrawn collateral.",
            },
            BORROW: {
                emoji: "🏦",
                title: "Borrow",
                color: "#EC4899",
                description: "You have successfully borrowed stablecoins.",
            },
            REPAY: {
                emoji: "✅",
                title: "Repay",
                color: "#14B8A6",
                description: "You have successfully repaid your debt.",
            },
            LIQUIDATION: {
                emoji: "💀",
                title: "Liquidation",
                color: "#EF4444",
                description: "Your position has been liquidated.",
            },
        };
        return configs[type];
    }

    private truncateAddress(address: string): string {
        if (!address || address.length < 8) return address;
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }

    private async sendEmail(to: string, subject: string, html: string): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: this.fromAddress,
                to,
                subject,
                html,
            });
            logger.info(`📧 Email sent to ${to}: ${subject}`);
        } catch (error) {
            logger.error("Failed to send email:", error);
        }
    }
}

class CompositeNotificationService implements NotificationService {
    private services: NotificationService[] = [];

    constructor(services: NotificationService[]) {
        this.services = services;
    }

    async sendLiquidationAlert(data: {
        positionOwner: string;
        vaultType: string;
        debtRepaid: number;
        collateralReceived: number;
        timestamp: number;
    }): Promise<void> {
        await Promise.all(this.services.map(s => s.sendLiquidationAlert(data)));
    }

    async sendOracleFailure(data: {
        oracleAccount: string;
        errorMessage: string;
        timestamp: number;
    }): Promise<void> {
        await Promise.all(this.services.map(s => s.sendOracleFailure(data)));
    }

    async sendProtocolPauseAlert(data: {
        reason: string;
        pausedBy: string;
        timestamp: number;
    }): Promise<void> {
        await Promise.all(this.services.map(s => s.sendProtocolPauseAlert(data)));
    }

    async sendTransactionEmail(data: UserTransactionData): Promise<void> {
        await Promise.all(this.services.map(s => s.sendTransactionEmail(data)));
    }
}

// Lazy initialization - services are created on first use
let _notificationService: CompositeNotificationService | null = null;

function getNotificationService(): CompositeNotificationService {
    if (_notificationService) {
        return _notificationService;
    }

    const services: NotificationService[] = [new ConsoleNotificationService()];

    // Only use Email notifications
    if (process.env.SMTP_HOST && process.env.ADMIN_EMAIL) {
        logger.info("✅ Email notification service initialized");
        services.push(new EmailNotificationService({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        } as nodemailer.TransportOptions, process.env.ADMIN_EMAIL));
    } else {
        logger.warn("⚠️ Email not configured - using console logging only");
    }

    _notificationService = new CompositeNotificationService(services);
    return _notificationService;
}

// Export a proxy object that lazily initializes
export const notificationService = {
    sendLiquidationAlert: (data: Parameters<NotificationService['sendLiquidationAlert']>[0]) =>
        getNotificationService().sendLiquidationAlert(data),
    sendOracleFailure: (data: Parameters<NotificationService['sendOracleFailure']>[0]) =>
        getNotificationService().sendOracleFailure(data),
    sendProtocolPauseAlert: (data: Parameters<NotificationService['sendProtocolPauseAlert']>[0]) =>
        getNotificationService().sendProtocolPauseAlert(data),
    sendTransactionEmail: (data: UserTransactionData) =>
        getNotificationService().sendTransactionEmail(data),
};

