"use server";

import nodemailer from "nodemailer";

import { type ContactInput, contactSchema } from "@/schemas/contact.schema";

import type { ActionResult } from "@/types";

/**
 * Send contact form email via SMTP
 * Rate-limited to 5 submissions per 15 minutes per IP (handled by API route)
 *
 * @param input - Contact form data (name, email, message)
 * @returns ActionResult with success status
 */
export async function sendContactEmailAction(
  input: ContactInput
): Promise<ActionResult<{ sent: boolean }>> {
  try {
    // Validate input
    const validation = contactSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Invalid input",
      };
    }

    const { name, email, message } = validation.data;

    // Configure SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Verify SMTP connection
    try {
      await transporter.verify();
    } catch (error) {
      console.error("SMTP connection failed:", error);
      return {
        success: false,
        error: "Email service is currently unavailable. Please try again later.",
      };
    }

    // Send email
    const mailOptions = {
      from: `"ComicWise Contact" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      replyTo: email,
      subject: `Contact Form Submission from ${name}`,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}

---
Sent from ComicWise Contact Form
      `.trim(),
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
    New Contact Form Submission
  </h2>

  <div style="margin: 20px 0;">
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
  </div>

  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <h3 style="color: #555; margin-top: 0;">Message:</h3>
    <p style="white-space: pre-wrap; color: #333;">${message}</p>
  </div>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
  <p style="color: #999; font-size: 12px;">
    Sent from ComicWise Contact Form
  </p>
</div>
      `.trim(),
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      data: { sent: true },
    };
  } catch (error) {
    console.error("Contact form error:", error);
    return {
      success: false,
      error: "Failed to send message. Please try again later.",
    };
  }
}
