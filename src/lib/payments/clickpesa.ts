import { createHmac, timingSafeEqual } from "node:crypto";

const API_BASE =
  process.env.CLICKPESA_API_BASE_URL?.replace(/\/$/, "") ||
  "https://api.clickpesa.com/third-parties";

let cachedToken: { token: string; expiresAt: number } | null = null;

function clickpesaConfigured() {
  return Boolean(
    process.env.CLICKPESA_CLIENT_ID?.trim() &&
      process.env.CLICKPESA_API_KEY?.trim() &&
      process.env.CLICKPESA_CHECKSUM_KEY?.trim(),
  );
}

export function canonicalJson(value: unknown): string {
  function normalize(input: unknown): unknown {
    if (Array.isArray(input)) return input.map(normalize);
    if (input && typeof input === "object") {
      return Object.keys(input as Record<string, unknown>)
        .sort()
        .reduce<Record<string, unknown>>((result, key) => {
          result[key] = normalize((input as Record<string, unknown>)[key]);
          return result;
        }, {});
    }
    return input;
  }
  return JSON.stringify(normalize(value));
}

export function checksumFor(payload: unknown): string {
  const key = process.env.CLICKPESA_CHECKSUM_KEY?.trim() ?? "";
  return createHmac("sha256", key).update(canonicalJson(payload)).digest("hex");
}

export function verifyChecksum(
  payload: Record<string, unknown>,
  provided: string | null | undefined,
): boolean {
  if (!provided) return false;
  const clean = { ...payload };
  delete clean.checksum;
  delete clean.checksumMethod;
  const expected = checksumFor(clean);
  if (provided.length !== expected.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(provided.toLowerCase()),
      Buffer.from(expected.toLowerCase()),
    );
  } catch {
    return false;
  }
}

async function getAccessToken(): Promise<string> {
  if (!clickpesaConfigured()) throw new Error("CLICKPESA_NOT_CONFIGURED");
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const response = await fetch(`${API_BASE}/generate-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "client-id": process.env.CLICKPESA_CLIENT_ID!.trim(),
      "api-key": process.env.CLICKPESA_API_KEY!.trim(),
    },
    body: JSON.stringify({}),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`CLICKPESA_TOKEN_FAILED:${response.status}`);
  }

  const data = (await response.json()) as {
    token?: string;
    data?: { token?: string; accessToken?: string };
  };
  const tokenValue = data.token ?? data.data?.token ?? data.data?.accessToken;
  if (!tokenValue) throw new Error("CLICKPESA_TOKEN_MISSING");
  // ClickPesa returns the token with its Bearer prefix already attached.
  const token = tokenValue.replace(/^Bearer\s+/i, "").trim();
  if (!token) throw new Error("CLICKPESA_TOKEN_MISSING");

  cachedToken = { token, expiresAt: Date.now() + 55 * 60_000 };
  return token;
}

function findCheckoutUrl(value: unknown): string | null {
  if (typeof value === "string" && /^https?:\/\//.test(value)) return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findCheckoutUrl(item);
      if (found) return found;
    }
    return null;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value as Record<string, unknown>)) {
      const found = findCheckoutUrl(item);
      if (found) return found;
    }
  }
  return null;
}

export interface ClickPesaCheckoutInput {
  amount: number;
  currency: "TZS" | "USD";
  orderReference: string;
  description: string;
  callbackUrl?: string;
}

export async function createClickPesaCheckout(
  input: ClickPesaCheckoutInput,
): Promise<string> {
  const token = await getAccessToken();
  const body = {
    totalPrice: String(input.amount),
    orderReference: input.orderReference,
    orderCurrency: input.currency,
    description: input.description,
    ...(input.callbackUrl ? { callbackUrl: input.callbackUrl } : {}),
  };
  const payload = { ...body, checksum: checksumFor(body) };

  const response = await fetch(`${API_BASE}/checkout-link/generate-checkout-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "client-id": process.env.CLICKPESA_CLIENT_ID!.trim(),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`CLICKPESA_CHECKOUT_FAILED:${response.status}`);
  }

  const data = (await response.json()) as { checkoutLink?: unknown };
  const url = findCheckoutUrl(data.checkoutLink ?? data);
  if (!url) throw new Error("CLICKPESA_CHECKOUT_URL_MISSING");
  return url;
}

export async function initiateClickPesaUssdPush(input: {
  amount: number;
  orderReference: string;
  phoneNumber: string;
}): Promise<{ id: string; status: string }> {
  const token = await getAccessToken();
  const body = {
    amount: String(input.amount),
    currency: "TZS" as const,
    orderReference: input.orderReference,
    phoneNumber: input.phoneNumber,
  };
  const response = await fetch(
    `${API_BASE}/payments/initiate-ussd-push-request`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "client-id": process.env.CLICKPESA_CLIENT_ID!.trim(),
      },
      body: JSON.stringify({ ...body, checksum: checksumFor(body) }),
      cache: "no-store",
    },
  );
  const result = (await response.json().catch(() => ({}))) as {
    id?: unknown;
    status?: unknown;
    message?: unknown;
  };
  if (!response.ok) {
    const reason = typeof result.message === "string" ? result.message : "";
    throw new Error(`CLICKPESA_PUSH_FAILED:${response.status}:${reason.slice(0, 100)}`);
  }
  if (typeof result.id !== "string") throw new Error("CLICKPESA_PUSH_RESPONSE_INVALID");
  return { id: result.id, status: typeof result.status === "string" ? result.status : "PROCESSING" };
}

export async function queryClickPesaPayment(reference: string) {
  const token = await getAccessToken();
  const response = await fetch(
    `${API_BASE}/payments/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (!response.ok) return null;
  const value = (await response.json()) as unknown;
  const item = Array.isArray(value) ? value[0] : value;
  if (!item || typeof item !== "object") return null;
  const status = (item as { status?: unknown }).status;
  return typeof status === "string" ? status.toLowerCase() : null;
}

export function clickpesaIsConfigured() {
  return clickpesaConfigured();
}
