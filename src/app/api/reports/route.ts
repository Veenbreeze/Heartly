import { headers } from "next/headers";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { apiError, apiOk, assertSameOrigin, readJson } from "@/lib/api";

const reportSchema = z.object({
  giftSlug: z.string().max(40).optional(),
  reason: z.enum([
    "spam",
    "harassment",
    "copyright",
    "explicit",
    "impersonation",
    "other",
  ]),
  details: z.string().trim().max(2000).optional(),
  website: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  if (!(await assertSameOrigin())) return apiError("Invalid origin", 403);
  const requestHeaders = await headers();
  if (!rateLimit(clientKey(requestHeaders, "report"), 5, 60 * 60_000).allowed) {
    return apiError("Please wait before sending another report.", 429);
  }

  const { data: body, error } = await readJson<unknown>(request);
  if (error) return apiError(error, 400);
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) return apiError("Choose a reason for the report.", 400);
  if (parsed.data.website) return apiOk();

  const admin = getAdminClient();
  if (!admin) return apiError("Reporting is not configured yet", 503);

  let giftId: string | null = null;
  if (parsed.data.giftSlug) {
    const { data: gift } = await admin
      .from("gifts")
      .select("id")
      .eq("slug", parsed.data.giftSlug)
      .maybeSingle();
    giftId = gift?.id ?? null;
  }

  const user = await getCurrentUser();
  const { error: insertError } = await admin.from("reports").insert({
    reporter_id: user?.id ?? null,
    gift_id: giftId,
    reason: parsed.data.reason,
    details: parsed.data.details ?? null,
  });

  if (insertError) return apiError("Could not send the report", 500);
  return apiOk({
    message: "Thank you. Our team will review this report.",
  });
}
