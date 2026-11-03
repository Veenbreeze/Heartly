import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

type AuthEmailPayload = {
  user: { email?: string; new_email?: string };
  email?: Record<string, unknown>;
  email_data?: Record<string, unknown>;
};

const actionLabels: Record<string, string> = {
  signup: "Confirm your Heartly account",
  recovery: "Reset your Heartly password",
  email_change: "Confirm your email change",
  invite: "Accept your Heartly invitation",
  magiclink: "Sign in to Heartly",
};

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function confirmationUrl(tokenHash: string, type: string, redirectTo: string) {
  if (!tokenHash) return "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!supabaseUrl) throw new Error("Supabase URL is not configured");
  const query = new URLSearchParams({
    token: tokenHash,
    type,
    redirect_to: redirectTo,
  });
  return `${supabaseUrl.replace(/\/$/, "")}/auth/v1/verify?${query.toString()}`;
}

async function sendEmail({
  to,
  code,
  actionUrl,
  subject,
}: {
  to: string;
  code: string;
  actionUrl: string;
  subject: string;
}) {
  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: Deno.env.get("EMAILJS_SERVICE_ID"),
      template_id: Deno.env.get("EMAILJS_TEMPLATE_ID"),
      user_id: Deno.env.get("EMAILJS_PUBLIC_KEY"),
      accessToken: Deno.env.get("EMAILJS_PRIVATE_KEY"),
      template_params: {
        to_email: to,
        otp_code: code,
        action_url: actionUrl,
        action_label: subject,
        email_subject: subject,
        app_name: "Heartly",
      },
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("EmailJS did not accept the auth email");
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("Not found", { status: 404 });

  const secret = Deno.env.get("SEND_EMAIL_HOOK_SECRET") ?? "";
  const encodedSecret = secret.replace(/^v1,whsec_/, "");
  if (!encodedSecret) return new Response("Email hook is not configured", { status: 500 });

  let payload: AuthEmailPayload;
  try {
    const rawBody = await request.text();
    const verified = new Webhook(encodedSecret).verify(
      rawBody,
      Object.fromEntries(request.headers),
    ) as AuthEmailPayload;
    payload = verified;
  } catch {
    return new Response("Invalid auth hook signature", { status: 401 });
  }

  const emailData = payload.email_data ?? payload.email ?? {};
  const actionType = asText(emailData.email_action_type);
  const subject = actionLabels[actionType] ?? "Your Heartly account code";
  const redirectTo = asText(emailData.redirect_to) || asText(emailData.site_url);
  try {
    const currentEmail = asText(payload.user.email);
    const newEmail = asText(payload.user.new_email);
    const token = asText(emailData.token);
    const tokenHash = asText(emailData.token_hash);
    const tokenNew = asText(emailData.token_new);
    const tokenHashNew = asText(emailData.token_hash_new);

    if (actionType === "email_change" && currentEmail && newEmail && tokenNew) {
      await sendEmail({
        to: currentEmail,
        code: token,
        actionUrl: confirmationUrl(tokenHashNew, actionType, redirectTo),
        subject,
      });
      await sendEmail({
        to: newEmail,
        code: tokenNew,
        actionUrl: confirmationUrl(tokenHash, actionType, redirectTo),
        subject,
      });
    } else {
      const to = newEmail && actionType === "email_change" ? newEmail : currentEmail;
      if (!to) throw new Error("Auth hook did not include a recipient");
      await sendEmail({
        to,
        code: token || tokenNew,
        actionUrl: confirmationUrl(tokenHash || tokenHashNew, actionType, redirectTo),
        subject,
      });
    }
  } catch {
    return new Response("Could not send confirmation email", { status: 502 });
  }

  return new Response("{}", {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
