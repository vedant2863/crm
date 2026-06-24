/**
 * @file src/lib/email/resend.ts
 * @description Email sending transport service using the Resend API provider.
 */

import { Resend } from "resend";
import { EmailMessage } from "./message";

// Initialize Resend client with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_build");

/**
 * Sends an email using the Resend API.
 * 
 * @param {EmailMessage} message The message payload including to, subject, html, from, etc.
 * @returns {Promise<{ success: boolean; data?: unknown; error?: unknown }>} The result payload of the operation.
 */
export async function sendEmail(message: EmailMessage): Promise<{ success: boolean; data?: unknown; error?: unknown }> {
  try {
    const fromAddress = message.from || process.env.EMAIL_FROM || "onboarding@resend.dev";
    
    const response = await resend.emails.send({
      from: fromAddress,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      cc: message.cc,
      bcc: message.bcc,
      replyTo: message.replyTo,
    });

    if (response.error) {
      console.error("❌ Resend email failed:", response.error);
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  } catch (err) {
    console.error("❌ Resend connection error:", err);
    return { success: false, error: err };
  }
}
