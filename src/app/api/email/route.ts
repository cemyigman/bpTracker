import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, pdfBase64, subject } = await request.json();

    if (!to || !pdfBase64) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const pdfBuffer = Buffer.from(pdfBase64, "base64");

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "BP Tracker <onboarding@resend.dev>",
      to: [to],
      subject: subject || "Blood Pressure Report",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Blood Pressure Report</h2>
          <p>Please find your blood pressure report attached to this email.</p>
          <p style="color: #666; font-size: 12px;">Sent from BP Tracker</p>
        </div>
      `,
      attachments: [
        {
          filename: "bp-report.pdf",
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
