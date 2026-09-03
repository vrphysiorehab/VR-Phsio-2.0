import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GMAIL_USER = Deno.env.get("GMAIL_USER");
    const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      throw new Error("SMTP credentials GMAIL_USER and GMAIL_APP_PASSWORD must be configured in Supabase secrets.");
    }

    const { to, subject, bodyText, pdfBase64, filename, attachments: reqAttachments } = await req.json();

    if (!to || !subject || !bodyText) {
      throw new Error("Missing required parameters: to, subject, bodyText.");
    }

    // Create transporter using Nodemailer
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for port 465 (SSL)
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    // Prepare attachments array
    const attachments = [];
    if (pdfBase64) {
      attachments.push({
        filename: filename || "document.pdf",
        content: pdfBase64,
        encoding: "base64",
      });
    }

    if (Array.isArray(reqAttachments)) {
      for (const att of reqAttachments) {
        if (att.pdfBase64) {
          attachments.push({
            filename: att.filename || "document.pdf",
            content: att.pdfBase64,
            encoding: "base64",
          });
        }
      }
    }

    // Dispatch email
    await transporter.sendMail({
      from: `VR Physio Rehab <${GMAIL_USER}>`,
      to: to,
      subject: subject,
      html: bodyText, // Send as HTML
      attachments: attachments,
    });

    return new Response(JSON.stringify({ success: true, message: "Email sent successfully." }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("SMTP error details:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
