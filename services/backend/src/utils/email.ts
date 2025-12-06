import * as nodemailer from "nodemailer";
import { logger } from "./logger";

export interface AlertEmailData {
    type: 'LIQUIDATION' | 'ORACLE_FAILURE' | 'PROTOCOL_PAUSE' | 'HEALTH_WARNING';
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    message: string;
    details?: Record<string, unknown>;
    timestamp: number;
}

interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
}

class EmailService {
    private transporter: nodemailer.Transporter | null = null;
    private adminEmails: string[] = [];
    private fromAddress: string = '"Aegis Protocol" <alerts@aegis.protocol>';
    private isConfigured: boolean = false;
    private initialized: boolean = false;

    constructor() {
        // Lazy initialization - don't initialize here
        // Will initialize on first use after dotenv is loaded
    }

    private ensureInitialized() {
        if (this.initialized) return;
        this.initialized = true;

        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = process.env.SMTP_PORT;
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        const adminEmail = process.env.ADMIN_EMAIL;

        if (!smtpHost || !smtpUser || !smtpPass || !adminEmail) {
            logger.warn("Email service not configured - missing SMTP_HOST, SMTP_USER, SMTP_PASS or ADMIN_EMAIL");
            return;
        }

        const config: EmailConfig = {
            host: smtpHost,
            port: Number(smtpPort) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        };

        this.transporter = nodemailer.createTransport(config);
        this.adminEmails = adminEmail.split(',').map(e => e.trim());
        this.fromAddress = process.env.SMTP_FROM || this.fromAddress;
        this.isConfigured = true;

        logger.info("✅ Email service initialized successfully");
    }

    async sendAlertEmail(data: AlertEmailData): Promise<boolean> {
        this.ensureInitialized();

        if (!this.isConfigured || !this.transporter) {
            logger.warn("Email service not configured, skipping email notification");
            return false;
        }

        try {
            const { subject, html } = this.formatAlertEmail(data);

            await this.transporter.sendMail({
                from: this.fromAddress,
                to: this.adminEmails.join(', '),
                subject,
                html,
            });

            logger.info(`📧 Alert email sent: ${subject}`);
            return true;
        } catch (error) {
            logger.error("Failed to send alert email:", error);
            return false;
        }
    }

    // ==========================================
    // SHARED EMAIL TEMPLATE BUILDER
    // ==========================================

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
                <a href="https://x.com/aaegis_finance" style="color: #6B7280; text-decoration: none; font-size: 13px; font-weight: 500;">Twitter</a>
                <a href="https://docs-aageis-finance.vercel.app/" style="color: #6B7280; text-decoration: none; font-size: 13px; font-weight: 500;">Docs</a>
            </div>
            <p style="color: #4B5563; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} Aegis Finance. Secured by Solana.
            </p>
            <p style="color: #374151; margin: 12px 0 0 0; font-size: 11px;">
                You managed your preferences in the Aegis App settings.
            </p>
        </div>
    </div>
</body>
</html>`;
    }

    private formatAlertEmail(data: AlertEmailData): { subject: string; html: string } {
        const severities = {
            INFO: { color: '#3B82F6', bg: '#3B82F615', icon: 'ℹ️' },
            WARNING: { color: '#F59E0B', bg: '#F59E0B15', icon: '⚠️' },
            CRITICAL: { color: '#EF4444', bg: '#EF444415', icon: '🚨' },
        };

        const config = severities[data.severity];
        const subject = `${config.icon} [${data.severity}] ${data.type}: ${data.message.substring(0, 50)}`;

        const detailsSection = data.details ? `
            <div style="background: #0B0C10; border-radius: 12px; padding: 16px; margin-top: 24px; border: 1px solid #1F2937;">
                <h3 style="color: #9CA3AF; margin: 0 0 12px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Technical Details</h3>
                <pre style="color: #D1D5DB; margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 12px; white-space: pre-wrap;">${JSON.stringify(data.details, null, 2)}</pre>
            </div>` : '';

        const content = `
            <div style="padding: 32px;">
                <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 24px;">
                    <span style="font-size: 32px; line-height: 1;">${config.icon}</span>
                    <div>
                        <div style="display: inline-block; padding: 4px 12px; background: ${config.bg}; color: ${config.color}; border-radius: 99px; font-size: 12px; font-weight: 700; margin-bottom: 8px;">
                            ${data.severity}
                        </div>
                        <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #F3F4F6;">${data.type.replace(/_/g, ' ')}</h2>
                    </div>
                </div>
                
                <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #D1D5DB;">
                    ${data.message}
                </p>

                ${detailsSection}

                <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1F2937; display: flex; align-items: center; gap: 8px;">
                    <span style="color: #6B7280; font-size: 12px;">Timestamp:</span>
                    <span style="color: #9CA3AF; font-size: 12px; font-family: monospace;">${new Date(data.timestamp).toISOString()}</span>
                </div>
            </div>
        `;

        return { subject, html: this.getBaseHtml(content, "System Alert") };
    }

    async testConnection(): Promise<boolean> {
        this.ensureInitialized();
        if (!this.transporter) return false;
        try {
            await this.transporter.verify();
            logger.info("✅ Email connection verified");
            return true;
        } catch (error) {
            logger.error("❌ Email connection failed:", error);
            return false;
        }
    }

    async sendTestEmail(): Promise<boolean> {
        return this.sendAlertEmail({
            type: 'HEALTH_WARNING',
            severity: 'INFO',
            message: 'This is a test email from Aegis Finance Alert System. If you received this, email notifications are working correctly!',
            details: {
                test: true,
                sentAt: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
            },
            timestamp: Date.now(),
        });
    }

    isReady(): boolean {
        this.ensureInitialized();
        return this.isConfigured;
    }

    async sendWelcomeEmail(email: string, walletAddress: string): Promise<boolean> {
        this.ensureInitialized();
        if (!this.isConfigured || !this.transporter) return false;

        const content = `
            <!-- Hero Section -->
            <div style="background: linear-gradient(180deg, #10B98110 0%, transparent 100%); padding: 48px 32px; text-align: center; border-bottom: 1px solid #1F2937;">
                <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px auto; font-size: 32px; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2);">
                    👋
                </div>
                <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #F3F4F6;">Welcome to the Protocol!</h2>
                <p style="margin: 0; color: #9CA3AF; font-size: 16px;">You're now tracking wallet <span style="color: #10B981; font-family: monospace; background: #10B98110; padding: 2px 6px; border-radius: 6px;">${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}</span></p>
            </div>

            <!-- Features List -->
            <div style="padding: 32px;">
                <p style="margin: 0 0 24px 0; font-size: 15px; color: #D1D5DB; line-height: 1.6; text-align: center;">
                    You've successfully subscribed to Aegis notifications. We'll keep you updated on critical protocol events.
                </p>

                <div style="display: grid; gap: 16px;">
                    <div style="background: #0B0C10; padding: 16px; border-radius: 16px; border: 1px solid #1F2937; display: flex; align-items: center; gap: 16px;">
                        <span style="font-size: 24px;">📊</span>
                        <div>
                            <h3 style="margin: 0 0 2px 0; font-size: 15px; font-weight: 600; color: #F3F4F6;">Position Updates</h3>
                            <p style="margin: 0; font-size: 13px; color: #6B7280;">Instant alerts on mints, deposits & withdraws</p>
                        </div>
                    </div>
                    
                    <div style="background: #0B0C10; padding: 16px; border-radius: 16px; border: 1px solid #1F2937; display: flex; align-items: center; gap: 16px;">
                        <span style="font-size: 24px;">🛡️</span>
                        <div>
                            <h3 style="margin: 0 0 2px 0; font-size: 15px; font-weight: 600; color: #F3F4F6;">Risk Management</h3>
                            <p style="margin: 0; font-size: 13px; color: #6B7280;">Real-time liquidation warnings & health checks</p>
                        </div>
                    </div>

                    <div style="background: #0B0C10; padding: 16px; border-radius: 16px; border: 1px solid #1F2937; display: flex; align-items: center; gap: 16px;">
                        <span style="font-size: 24px;">⚡</span>
                        <div>
                            <h3 style="margin: 0 0 2px 0; font-size: 15px; font-weight: 600; color: #F3F4F6;">Protocol Health</h3>
                            <p style="margin: 0; font-size: 13px; color: #6B7280;">Weekly digests on protocol metrics</p>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 32px; text-align: center;">
                    <a href="https://app-aaegis-protocol.vercel.app/portfolio" style="display: inline-block; background: #10B981; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px; transition: all 0.2s;">
                        Go to Dashboard &rarr;
                    </a>
                </div>
            </div>
        `;

        try {
            await this.transporter.sendMail({
                from: this.fromAddress,
                to: email,
                subject: "✨ Welcome to Aegis Finance",
                html: this.getBaseHtml(content, "Welcome"),
            });
            logger.info(`📧 Welcome email sent to ${email}`);
            return true;
        } catch (error) {
            logger.error("Failed to send welcome email:", error);
            return false;
        }
    }

    async sendLiquidationWarning(email: string, data: { walletAddress: string; healthFactor: number; debtAmount: number; collateralAmount: number; vaultType?: string; }): Promise<boolean> {
        this.ensureInitialized();
        if (!this.isConfigured || !this.transporter) return false;

        const isUrgent = data.healthFactor < 110;
        const theme = isUrgent ? { color: '#EF4444', icon: '🚨', title: 'Critical Risk' } : { color: '#F59E0B', icon: '⚠️', title: 'Risk Warning' };

        const content = `
            <!-- Warning Header -->
            <div style="background: ${theme.color}15; padding: 32px; text-align: center; border-bottom: 1px solid ${theme.color}30;">
                <span style="font-size: 48px; display: block; margin-bottom: 16px;">${theme.icon}</span>
                <h2 style="margin: 0 0 8px 0; color: ${theme.color}; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">${theme.title}</h2>
                <p style="margin: 0; color: #E5E7EB; font-size: 16px; font-weight: 500;">Your position is approaching liquidation threshold</p>
            </div>

            <!-- Health Meter -->
            <div style="padding: 32px;">
                <div style="background: #0B0C10; padding: 24px; border-radius: 16px; text-align: center; border: 1px solid #1F2937; margin-bottom: 24px;">
                    <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Current Health Factor</p>
                    <div style="font-size: 48px; font-weight: 800; color: ${theme.color}; line-height: 1;">
                        ${data.healthFactor.toFixed(2)}%
                    </div>
                    <div style="margin-top: 12px; background: #1F2937; height: 6px; border-radius: 3px; overflow: hidden; position: relative;">
                        <div style="position: absolute; left: 0; top: 0; bottom: 0; width: ${Math.min(data.healthFactor, 200) / 2}%; background: ${theme.color}; border-radius: 3px;"></div>
                    </div>
                </div>

                <!-- Position Stats -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 32px;">
                    <div style="background: #1F2937; padding: 16px; border-radius: 12px;">
                        <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 12px;">Collateral</p>
                        <p style="margin: 0; color: #F3F4F6; font-weight: 600; font-size: 16px;">$${(data.collateralAmount / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div style="background: #1F2937; padding: 16px; border-radius: 12px;">
                        <p style="margin: 0 0 4px 0; color: #9CA3AF; font-size: 12px;">Debt</p>
                        <p style="margin: 0; color: #F3F4F6; font-weight: 600; font-size: 16px;">$${(data.debtAmount / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                    </div>
                </div>

                <!-- Action Button -->
                <div style="text-align: center;">
                    <a href="https://app-aaegis-protocol.vercel.app/portfolio" style="display: block; width: 100%; background: ${theme.color}; color: white; padding: 16px 0; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        Repay or Add Collateral
                    </a>
                    <p style="margin: 16px 0 0 0; font-size: 13px; color: #6B7280;">
                        Liquidation occurs at 100% health factor. Penalty applies.
                    </p>
                </div>
            </div>
        `;

        try {
            await this.transporter.sendMail({
                from: this.fromAddress,
                to: email,
                subject: `${isUrgent ? "🚨 ACTION REQUIRED" : "⚠️ Warning"}: Health Factor at ${data.healthFactor.toFixed(0)}%`,
                html: this.getBaseHtml(content, "Liquidation Alert"),
            });
            logger.info(`📧 Liquidation warning sent to ${email}`);
            return true;
        } catch (error) {
            logger.error("Failed to send liquidation warning:", error);
            return false;
        }
    }

    async sendProtocolHealthUpdate(email: string, data: { status: 'HEALTHY' | 'WARNING' | 'CRITICAL'; debtUtilization: number; totalDebt: number; message: string; }): Promise<boolean> {
        this.ensureInitialized();
        if (!this.isConfigured || !this.transporter) return false;

        const statusMap = {
            HEALTHY: { color: '#10B981', icon: '✅', title: 'System Healthy' },
            WARNING: { color: '#F59E0B', icon: '⚠️', title: 'System Warning' },
            CRITICAL: { color: '#EF4444', icon: '🚨', title: 'System Critical' },
        };
        const theme = statusMap[data.status];

        const content = `
            <div style="padding: 32px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="display: inline-flex; align-items: center; gap: 8px; background: ${theme.color}20; padding: 8px 16px; border-radius: 99px; color: ${theme.color}; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
                        <span>${theme.icon}</span>
                        <span>${theme.title}</span>
                    </div>
                </div>

                <p style="margin: 0 0 32px 0; text-align: center; font-size: 16px; line-height: 1.6; color: #D1D5DB;">
                    ${data.message}
                </p>

                <div style="background: #0B0C10; border-radius: 16px; padding: 24px; border: 1px solid #1F2937;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #1F2937;">
                        <span style="color: #9CA3AF; font-size: 14px;">Debt Utilization</span>
                        <div style="text-align: right;">
                            <span style="display: block; color: ${theme.color}; font-weight: 700; font-size: 18px;">${data.debtUtilization.toFixed(1)}%</span>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #9CA3AF; font-size: 14px;">Total Protocol Debt</span>
                        <span style="color: #F3F4F6; font-weight: 700; font-size: 18px;">$${(data.totalDebt / 1_000_000).toLocaleString()}</span>
                    </div>
                </div>

                <div style="margin-top: 32px; text-align: center;">
                    <a href="https://aaegis.finance/analytics" style="color: #6B7280; font-size: 14px; text-decoration: none; border-bottom: 1px solid #374151; padding-bottom: 2px;">View Analytics Dashboard &rarr;</a>
                </div>
            </div>
        `;

        try {
            await this.transporter.sendMail({
                from: this.fromAddress,
                to: email,
                subject: `Protocol Update: ${data.status}`,
                html: this.getBaseHtml(content, "Protocol Update"),
            });
            return true;
        } catch (error) {
            logger.error("Failed to send protocol health update:", error);
            return false;
        }
    }

    async sendToUser(email: string, subject: string, html: string): Promise<boolean> {
        this.ensureInitialized();
        if (!this.isConfigured || !this.transporter) return false;

        try {
            await this.transporter.sendMail({
                from: this.fromAddress,
                to: email,
                subject,
                html: this.getBaseHtml(html, "Notification"),
            });
            logger.info(`📧 Email sent to ${email}: ${subject}`);
            return true;
        } catch (error) {
            logger.error(`Failed to send email to ${email}:`, error);
            return false;
        }
    }
}

export const emailService = new EmailService();
