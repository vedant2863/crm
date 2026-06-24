/**
 * @file src/lib/email/message.ts
 * @description Type definitions for email messages and templates.
 */

export interface EmailMessage {
  /** Recipient email address or list of addresses */
  to: string | string[];
  /** Subject line of the email */
  subject: string;
  /** HTML body content of the email */
  html: string;
  /** Optional sender address */
  from?: string;
  /** Optional plain text fallback content */
  text?: string;
  /** Optional CC recipient(s) */
  cc?: string | string[];
  /** Optional BCC recipient(s) */
  bcc?: string | string[];
  /** Optional reply-to recipient(s) */
  replyTo?: string | string[];
}
