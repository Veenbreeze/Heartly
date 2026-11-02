import { z } from "zod";

export const TEMPLATE_TYPES = [
  "birthday",
  "love_letter",
  "anniversary",
  "dinner_date",
  "beach_date",
  "friendship",
  "appreciation",
  "valentine",
  "question",
  "surprise",
  "celebration",
  "custom",
] as const;

export type TemplateType = (typeof TEMPLATE_TYPES)[number];

export const ANIMATION_TYPES = [
  "none",
  "fade",
  "float",
  "confetti",
  "petals",
  "hearts",
  "stars",
  "sparkles",
  "waves",
  "candles",
] as const;

export type AnimationType = (typeof ANIMATION_TYPES)[number];

export const MUSIC_TRACKS = ["none", "dreamy", "romantic", "playful"] as const;
export const FONT_OPTIONS = ["playfair", "inter", "cormorant", "lora"] as const;

export const BASIC_ANIMATIONS: AnimationType[] = ["none", "fade", "float"];

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a six-digit hex colour");
const shortText = z.string().trim().max(120);
const longText = z.string().trim().max(5000);

export const themeSchema = z.object({
  background: hexColor.default("#FFF9F7"),
  accent: hexColor.default("#E85D75"),
  secondary: hexColor.default("#FCE7EF"),
  text: hexColor.default("#29212A"),
  headingFont: z.enum(FONT_OPTIONS).default("playfair"),
  bodyFont: z.enum(FONT_OPTIONS).default("inter"),
});

export const mediaItemSchema = z.object({
  id: z.string().max(80).optional(),
  url: z
    .string()
    .trim()
    .max(2000)
    .refine(
      (value) => value.startsWith("https://") || value.startsWith("http://") || value.startsWith("/"),
      "Image URL must be http(s) or a local path",
    ),
  alt: z.string().trim().max(200).default(""),
});

export const questionSchema = z.object({
  id: z.string().min(1).max(80),
  question: z.string().trim().min(1).max(300),
  options: z.array(z.string().trim().min(1).max(80)).min(2).max(6),
});

export const dateDetailsSchema = z.object({
  date: z.string().trim().max(40).default(""),
  time: z.string().trim().max(20).default(""),
  venue: z.string().trim().max(160).default(""),
  address: z.string().trim().max(300).default(""),
});

export const giftContentSchema = z.object({
  version: z.number().int().default(1),
  recipientName: shortText.default(""),
  senderName: shortText.default(""),
  title: z.string().trim().max(160).default(""),
  message: longText.default(""),
  theme: themeSchema,
  animation: z.object({
    type: z.enum(ANIMATION_TYPES).default("fade"),
    intensity: z.enum(["low", "medium", "high"]).default("low"),
  }),
  music: z.object({
    enabled: z.boolean().default(false),
    track: z.enum(MUSIC_TRACKS).default("none"),
  }),
  media: z.array(mediaItemSchema).max(20).default([]),
  date: dateDetailsSchema.optional(),
  questions: z.array(questionSchema).max(10).optional(),
  branding: z
    .object({
      remove: z.boolean().default(false),
    })
    .default({ remove: false }),
  reveal: z
    .object({
      title: z.string().trim().max(160).default(""),
      message: z.string().trim().max(2000).default(""),
    })
    .optional(),
  custom: z.record(z.string(), z.string()).optional(),
});

export type GiftContent = z.infer<typeof giftContentSchema>;
export type GiftTheme = z.infer<typeof themeSchema>;

export function defaultGiftContent(): GiftContent {
  return giftContentSchema.parse({
    version: 1,
    recipientName: "",
    senderName: "",
    title: "",
    message: "",
    theme: {},
    animation: {},
    music: {},
    media: [],
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge(base: unknown, override: unknown): unknown {
  if (!isRecord(base) || !isRecord(override)) return override ?? base;
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    result[key] = deepMerge(base[key], value);
  }
  return result;
}

/** Merge editable content over a template's defaults and validate the result. */
export function mergeGiftContent(
  defaults: unknown,
  content: unknown,
): GiftContent {
  const merged = deepMerge(defaultGiftContent(), defaults ?? {});
  const finalValue = deepMerge(merged, content ?? {});
  return giftContentSchema.parse(finalValue);
}

export function safeGiftContent(defaults: unknown, content: unknown): GiftContent {
  try {
    return mergeGiftContent(defaults, content);
  } catch {
    return defaultGiftContent();
  }
}

export const giftDraftSchema = z.object({
  templateId: z.string().uuid(),
  categoryId: z.string().uuid(),
  content: giftContentSchema,
  revision: z.number().int().min(0).default(0),
});

export const giftPublishSchema = z.object({
  visibility: z.enum(["public", "unlisted", "password"]).default("unlisted"),
  password: z.string().min(4).max(72).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
  removeBranding: z.boolean().default(false),
});

export const responseSchema = z.object({
  responseType: z.enum(["accept", "decline", "answer", "message", "reaction"]),
  responseData: z.record(z.string(), z.string().max(500)).default({}),
  message: z.string().trim().max(2000).optional(),
  respondentName: z.string().trim().max(120).optional(),
});
