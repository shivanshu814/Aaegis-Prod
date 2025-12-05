import * as nodemailer from "nodemailer";
import { logger } from "./utils/logger";

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
}

class ConsoleNotificationService implements NotificationService {
    async sendLiquidationAlert(data: any): Promise<void> {
        logger.warn("🚨 LIQUIDATION ALERT", data);
    }

    async sendOracleFailure(data: any): Promise<void> {
        logger.error("⚠️ ORACLE FAILURE", data);
    }

    async sendProtocolPauseAlert(data: any): Promise<void> {
        logger.info("⏸️ PROTOCOL PAUSED", data);
    }
}

class DiscordNotificationService implements NotificationService {
    private webhookUrl: string;

    constructor(webhookUrl: string) {
        this.webhookUrl = webhookUrl;
    }

    async sendLiquidationAlert(data: any): Promise<void> {
        const message = {
            embeds: [{
                title: "🚨 Position Liquidated",
                color: 0xff0000,
                fields: [
                    { name: "Position Owner", value: data.positionOwner, inline: true },
                    { name: "Vault Type", value: data.vaultType, inline: true },
                    { name: "Debt Repaid", value: `${(data.debtRepaid / 1_000_000).toFixed(2)} AGSUSD`, inline: true },
                    { name: "Collateral Seized", value: `${(data.collateralReceived / 1_000_000_000).toFixed(4)} tokens`, inline: true },
                ],
                timestamp: new Date(data.timestamp * 1000).toISOString(),
            }],
        };

        await this.sendWebhook(message);
    }

    async sendOracleFailure(data: any): Promise<void> {
        const message = {
            embeds: [{
                title: "⚠️ Oracle Failure Detected",
                color: 0xffa500,
                fields: [
                    { name: "Oracle Account", value: data.oracleAccount },
                    { name: "Error", value: data.errorMessage },
                ],
                timestamp: new Date(data.timestamp * 1000).toISOString(),
            }],
        };

        await this.sendWebhook(message);
    }

    async sendProtocolPauseAlert(data: any): Promise<void> {
        const message = {
            embeds: [{
                title: "⏸️ Protocol Paused",
                color: 0x00ff00,
                fields: [
                    { name: "Reason", value: data.reason },
                    { name: "Paused By", value: data.pausedBy },
                ],
                timestamp: new Date(data.timestamp * 1000).toISOString(),
            }],
        };

        await this.sendWebhook(message);
    }

    private async sendWebhook(message: any): Promise<void> {
        try {
            await fetch(this.webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(message),
            });
        } catch (error) {
            logger.error("Failed to send Discord notification:", error);
        }
    }
}

class EmailNotificationService implements NotificationService {
    private transporter: nodemailer.Transporter;
    private toAddress: string;

    constructor(smtpConfig: any, toAddress: string) {
        this.transporter = nodemailer.createTransport(smtpConfig);
        this.toAddress = toAddress;
    }

    async sendLiquidationAlert(data: any): Promise<void> {
        const subject = "🚨 Aegis Protocol: Position Liquidated";
        const text = `
Position Liquidated!
Owner: ${data.positionOwner}
Vault: ${data.vaultType}
Debt Repaid: ${(data.debtRepaid / 1_000_000).toFixed(2)} AGSUSD
Collateral Seized: ${(data.collateralReceived / 1_000_000_000).toFixed(4)} tokens
Time: ${new Date(data.timestamp * 1000).toISOString()}
        `;
        await this.sendEmail(subject, text);
    }

    async sendOracleFailure(data: any): Promise<void> {
        const subject = "⚠️ Aegis Protocol: Oracle Failure";
        const text = `
Oracle Failure Detected!
Account: ${data.oracleAccount}
Error: ${data.errorMessage}
Time: ${new Date(data.timestamp * 1000).toISOString()}
        `;
        await this.sendEmail(subject, text);
    }

    async sendProtocolPauseAlert(data: any): Promise<void> {
        const subject = "⏸️ Aegis Protocol: Protocol Paused";
        const text = `
Protocol Paused!
Reason: ${data.reason}
Paused By: ${data.pausedBy}
Time: ${new Date(data.timestamp * 1000).toISOString()}
        `;
        await this.sendEmail(subject, text);
    }

    private async sendEmail(subject: string, text: string): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: '"Aegis Guardian" <guardian@aegis.protocol>',
                to: this.toAddress,
                subject,
                text,
            });
            logger.info(`Email sent: ${subject}`);
        } catch (error) {
            logger.error("Failed to send Email notification:", error);
        }
    }
}

class CompositeNotificationService implements NotificationService {
    private services: NotificationService[] = [];

    constructor(services: NotificationService[]) {
        this.services = services;
    }

    async sendLiquidationAlert(data: any): Promise<void> {
        await Promise.all(this.services.map(s => s.sendLiquidationAlert(data)));
    }

    async sendOracleFailure(data: any): Promise<void> {
        await Promise.all(this.services.map(s => s.sendOracleFailure(data)));
    }

    async sendProtocolPauseAlert(data: any): Promise<void> {
        await Promise.all(this.services.map(s => s.sendProtocolPauseAlert(data)));
    }
}

// Initialize services based on env vars
const services: NotificationService[] = [new ConsoleNotificationService()];

if (process.env.DISCORD_WEBHOOK_URL) {
    services.push(new DiscordNotificationService(process.env.DISCORD_WEBHOOK_URL));
}

if (process.env.SMTP_HOST && process.env.ADMIN_EMAIL) {
    services.push(new EmailNotificationService({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    }, process.env.ADMIN_EMAIL));
}

export const notificationService = new CompositeNotificationService(services);
