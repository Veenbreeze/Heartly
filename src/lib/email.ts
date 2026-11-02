import { emailConfigured } from "@/lib/env";

export interface TransactionalEmail {
  to: string | null | undefined;
  subject: string;
  text: string;
  html?: string;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function emailParagraphs(lines: string[]) {
  return lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
}

/**
 * Sends a transactional email through Resend's HTTP API.
 * Returns false when email is not configured or the provider rejects the
 * request. Callers must never surface delivery failures to end users.
 */
export async function sendTransactionalEmail({
  to,
  subject,
  text,
  html,
}: TransactionalEmail): Promise<boolean> {
  if (!emailConfigured() || !to) return false;

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;
  const from =
    process.env.EMAIL_FROM?.trim() || "Heartly <hello@heartly.example>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text,
        html: html ?? `<div>${emailParagraphs(text.split("\n\n"))}</div>`,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
