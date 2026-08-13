import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "No BS Courses <onboarding@resend.dev>";

function isConfigured(): boolean {
  const key = process.env.RESEND_API_KEY;
  return Boolean(key) && !key!.includes("REPLACE_ME");
}

// Lazily constructed so a placeholder/missing key never throws at import
// time — only if we actually try to send with it.
let client: Resend | null = null;
function getClient(): Resend {
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

// Never lets a transactional email failure break the request that
// triggered it (e.g. signup should still succeed even if the verification
// email fails to send). With no real RESEND_API_KEY configured yet, this
// logs the email to the console instead of sending — which is enough to
// test the full verification/reset token flow locally before a real key
// exists.
export async function sendEmail(params: { to: string; subject: string; html: string }): Promise<void> {
  if (!isConfigured()) {
    console.log(
      `[email:stub — no RESEND_API_KEY configured] To: ${params.to}\nSubject: ${params.subject}\n${params.html}\n`
    );
    return;
  }

  try {
    await getClient().emails.send({ from: FROM, to: params.to, subject: params.subject, html: params.html });
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
  }
}

function emailShell(heading: string, bodyHtml: string): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <p style="font-size: 18px; font-weight: 700;">
        No <span style="color: #dc2626;">BS</span> Courses
      </p>
      <h1 style="font-size: 18px; margin-top: 24px;">${heading}</h1>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #71717a;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;
}

export function verificationEmailHtml(link: string): string {
  return emailShell(
    "Confirm your email address",
    `
      <p>Click below to verify your No BS Courses account email. This link expires in 24 hours.</p>
      <p style="margin-top: 16px;">
        <a href="${link}" style="display: inline-block; background: #18181b; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
          Verify email
        </a>
      </p>
      <p style="margin-top: 16px; font-size: 12px; color: #71717a;">Or paste this link into your browser: ${link}</p>
    `
  );
}

export function claimSubmittedEmailHtml(params: {
  courseTitle: string;
  ownerEmail: string;
  reviewLink: string;
}): string {
  return emailShell(
    "New course claim awaiting review",
    `
      <p><strong>${params.ownerEmail}</strong> is claiming <strong>${params.courseTitle}</strong>. Approve or reject it before they get editing access.</p>
      <p style="margin-top: 16px;">
        <a href="${params.reviewLink}" style="display: inline-block; background: #18181b; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
          Review claim
        </a>
      </p>
    `
  );
}

export function passwordResetEmailHtml(link: string, accountLabel: "learner" | "business"): string {
  return emailShell(
    "Reset your password",
    `
      <p>We received a request to reset the password on your No BS Courses ${accountLabel} account. This link expires in 1 hour.</p>
      <p style="margin-top: 16px;">
        <a href="${link}" style="display: inline-block; background: #18181b; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
          Reset password
        </a>
      </p>
      <p style="margin-top: 16px; font-size: 12px; color: #71717a;">Or paste this link into your browser: ${link}</p>
    `
  );
}
