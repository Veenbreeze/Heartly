"use client";

import { useState } from "react";
import {
  Crown,
  ImagePlus,
  Lock,
  Music2,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ANIMATION_TYPES,
  FONT_OPTIONS,
  MUSIC_TRACKS,
  type AnimationType,
  type GiftContent,
} from "@/lib/gift/schema";
import type { PublishSettings, StudioCapabilities } from "@/components/studio/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function PanelSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-3xl border border-line bg-white/70 p-5", className)}>
      <h3 className="font-display text-lg text-plum">{title}</h3>
      {description ? (
        <p className="mt-1 text-xs leading-relaxed text-ink-soft">{description}</p>
      ) : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs">{label}</Label>
        {hint ? <span className="text-[10px] text-ink-soft">{hint}</span> : null}
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Content                                                                    */
/* -------------------------------------------------------------------------- */

export function ContentPanel({
  content,
  update,
}: {
  content: GiftContent;
  update: (patch: Partial<GiftContent>) => void;
}) {
  function updateQuestion(index: number, patch: Partial<NonNullable<GiftContent["questions"]>[number]>) {
    const questions = [...(content.questions ?? [])];
    const current = questions[index];
    if (!current) return;
    questions[index] = { ...current, ...patch };
    update({ questions });
  }

  function addQuestion() {
    if ((content.questions?.length ?? 0) >= 10) return;
    update({
      questions: [
        ...(content.questions ?? []),
        {
          id: crypto.randomUUID(),
          question: "A question for you",
          options: ["Yes", "No"],
        },
      ],
    });
  }

  function removeQuestion(index: number) {
    update({
      questions: (content.questions ?? []).filter((_, i) => i !== index),
    });
  }

  return (
    <div className="space-y-5">
      <PanelSection title="The words" description="The part they will read twice.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="To" hint="Recipient">
            <Input
              value={content.recipientName}
              maxLength={120}
              onChange={(event) => update({ recipientName: event.target.value })}
              placeholder="Their name"
            />
          </Field>
          <Field label="From" hint="Sender">
            <Input
              value={content.senderName}
              maxLength={120}
              onChange={(event) => update({ senderName: event.target.value })}
              placeholder="Your name"
            />
          </Field>
        </div>
        <Field label="Title" hint={`${content.title.length}/160`}>
          <Input
            value={content.title}
            maxLength={160}
            onChange={(event) => update({ title: event.target.value })}
            placeholder="A little something for you"
          />
        </Field>
        <Field label="Message" hint={`${content.message.length}/5000`}>
          <Textarea
            value={content.message}
            maxLength={5000}
            rows={6}
            onChange={(event) => update({ message: event.target.value })}
            placeholder="Say the thing you have been meaning to say."
          />
        </Field>
      </PanelSection>

      <PanelSection
        title="Date details"
        description="Useful for invitations and questions. Leave blank for a simple note."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Date">
            <Input
              value={content.date?.date ?? ""}
              maxLength={40}
              onChange={(event) =>
                update({
                  date: {
                    date: event.target.value,
                    time: content.date?.time ?? "",
                    venue: content.date?.venue ?? "",
                    address: content.date?.address ?? "",
                  },
                })
              }
              placeholder="Saturday, 14 February"
            />
          </Field>
          <Field label="Time">
            <Input
              value={content.date?.time ?? ""}
              maxLength={20}
              onChange={(event) =>
                update({
                  date: {
                    date: content.date?.date ?? "",
                    time: event.target.value,
                    venue: content.date?.venue ?? "",
                    address: content.date?.address ?? "",
                  },
                })
              }
              placeholder="7:00 PM"
            />
          </Field>
        </div>
        <Field label="Place">
          <Input
            value={content.date?.venue ?? ""}
            maxLength={160}
            onChange={(event) =>
              update({
                date: {
                  date: content.date?.date ?? "",
                  time: content.date?.time ?? "",
                  venue: event.target.value,
                  address: content.date?.address ?? "",
                },
              })
            }
            placeholder="The little place on the corner"
          />
        </Field>
        <Field label="Address">
          <Input
            value={content.date?.address ?? ""}
            maxLength={300}
            onChange={(event) =>
              update({
                date: {
                  date: content.date?.date ?? "",
                  time: content.date?.time ?? "",
                  venue: content.date?.venue ?? "",
                  address: event.target.value,
                },
              })
            }
            placeholder="Street, city"
          />
        </Field>
      </PanelSection>

      <PanelSection
        title="Questions"
        description="Give them something to answer. Great for date invitations and playful gifts."
      >
        {(content.questions ?? []).map((question, index) => (
          <div
            key={question.id}
            className="rounded-2xl border border-line bg-cream/60 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <Input
                value={question.question}
                maxLength={300}
                onChange={(event) =>
                  updateQuestion(index, { question: event.target.value })
                }
                placeholder="Will you have dinner with me?"
                className="bg-white"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeQuestion(index)}
                aria-label="Remove question"
              >
                <Trash2 />
              </Button>
            </div>
            <div className="mt-3 space-y-2">
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <span className="w-4 text-[10px] text-ink-soft">
                    {optionIndex + 1}
                  </span>
                  <Input
                    value={option}
                    maxLength={80}
                    onChange={(event) => {
                      const options = [...question.options];
                      options[optionIndex] = event.target.value;
                      updateQuestion(index, { options });
                    }}
                    className="h-9 bg-white text-sm"
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={question.options.length <= 2}
                    onClick={() =>
                      updateQuestion(index, {
                        options: question.options.filter((_, i) => i !== optionIndex),
                      })
                    }
                    aria-label="Remove option"
                  >
                    <X />
                  </Button>
                </div>
              ))}
              {question.options.length < 6 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateQuestion(index, {
                      options: [...question.options, `Option ${question.options.length + 1}`],
                    })
                  }
                >
                  <Plus /> Add option
                </Button>
              ) : null}
            </div>
          </div>
        ))}
        {(content.questions?.length ?? 0) < 10 ? (
          <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
            <Plus /> Add a question
          </Button>
        ) : null}
      </PanelSection>

      <PanelSection
        title="Hidden reveal"
        description="Add a second message that appears only after they tap the reveal button."
      >
        <Field label="Reveal title">
          <Input
            value={content.reveal?.title ?? ""}
            maxLength={160}
            onChange={(event) =>
              update({
                reveal: {
                  title: event.target.value,
                  message: content.reveal?.message ?? "",
                },
              })
            }
            placeholder="There is one more thing…"
          />
        </Field>
        <Field label="Reveal message">
          <Textarea
            value={content.reveal?.message ?? ""}
            maxLength={2000}
            rows={3}
            onChange={(event) =>
              update({
                reveal: {
                  title: content.reveal?.title ?? "",
                  message: event.target.value,
                },
              })
            }
            placeholder="The part you almost did not say."
          />
        </Field>
      </PanelSection>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Design                                                                     */
/* -------------------------------------------------------------------------- */

const palettes = [
  { name: "Blush", background: "#FFF9F7", accent: "#E85D75", secondary: "#FCE7EF", text: "#29212A" },
  { name: "Midnight", background: "#1F1724", accent: "#F3C6D3", secondary: "#3A2A42", text: "#FFF9F7" },
  { name: "Garden", background: "#F4F8F2", accent: "#6B8F71", secondary: "#DDE9D8", text: "#243027" },
  { name: "Golden", background: "#FFF8EC", accent: "#B8862F", secondary: "#F7E7C6", text: "#33281A" },
  { name: "Sea", background: "#F2F8FA", accent: "#2F7F8F", secondary: "#D6EDF1", text: "#1C3338" },
];

const animationLabels: Record<AnimationType, string> = {
  none: "Still",
  fade: "Soft fade",
  float: "Floating light",
  confetti: "Confetti",
  petals: "Falling petals",
  hearts: "Rising hearts",
  stars: "Night stars",
  sparkles: "Sparkles",
  waves: "Ocean waves",
  candles: "Candlelight",
  butterflies: "Butterflies",
  bubbles: "Rising bubbles",
  snow: "Soft snow",
};

const basicAnimations: AnimationType[] = ["none", "fade", "float"];

export function DesignPanel({
  content,
  update,
  capabilities,
}: {
  content: GiftContent;
  update: (patch: Partial<GiftContent>) => void;
  capabilities: StudioCapabilities;
}) {
  function setTheme(patch: Partial<GiftContent["theme"]>) {
    update({ theme: { ...content.theme, ...patch } });
  }

  return (
    <div className="space-y-5">
      <PanelSection title="Palette" description="Start from a mood, then adjust the colours.">
        <div className="grid grid-cols-5 gap-2">
          {palettes.map((palette) => (
            <button
              key={palette.name}
              type="button"
              onClick={() => setTheme(palette)}
              className="group rounded-xl border border-line p-1 transition hover:border-rose/50"
              aria-label={`Use ${palette.name} palette`}
            >
              <span className="flex h-12 overflow-hidden rounded-lg">
                <span className="flex-1" style={{ backgroundColor: palette.background }} />
                <span className="flex-1" style={{ backgroundColor: palette.accent }} />
                <span className="flex-1" style={{ backgroundColor: palette.secondary }} />
              </span>
              <span className="mt-1 block text-center text-[10px] text-ink-soft">
                {palette.name}
              </span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["background", "Background"],
              ["accent", "Accent"],
              ["secondary", "Secondary"],
              ["text", "Text"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-2 py-1.5">
                <input
                  type="color"
                  value={content.theme[key]}
                  onChange={(event) => setTheme({ [key]: event.target.value })}
                  className="size-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  aria-label={label}
                />
                <span className="font-mono text-[11px] uppercase text-ink-soft">
                  {content.theme[key]}
                </span>
              </div>
            </Field>
          ))}
        </div>
      </PanelSection>

      <PanelSection title="Type" description="Playfair and Inter are always available.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Heading font">
            <Select
              value={content.theme.headingFont}
              onValueChange={(value) =>
                setTheme({ headingFont: value as GiftContent["theme"]["headingFont"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((font) => {
                  const locked =
                    (font === "cormorant" || font === "lora") &&
                    !capabilities.customFonts;
                  return (
                    <SelectItem key={font} value={font} disabled={locked}>
                      <span className="capitalize">{font}</span>
                      {locked ? " · Premium" : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Body font">
            <Select
              value={content.theme.bodyFont}
              onValueChange={(value) =>
                setTheme({ bodyFont: value as GiftContent["theme"]["bodyFont"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((font) => {
                  const locked =
                    (font === "cormorant" || font === "lora") &&
                    !capabilities.customFonts;
                  return (
                    <SelectItem key={font} value={font} disabled={locked}>
                      <span className="capitalize">{font}</span>
                      {locked ? " · Premium" : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </PanelSection>

      <PanelSection title="Motion" description="Gentle movement makes the moment feel alive.">
        <Field label="Animation">
          <Select
            value={content.animation.type}
            onValueChange={(value) =>
              update({
                animation: {
                  ...content.animation,
                  type: value as AnimationType,
                },
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ANIMATION_TYPES.map((animation) => {
                const locked =
                  !basicAnimations.includes(animation) &&
                  !capabilities.advancedAnimation;
                return (
                  <SelectItem key={animation} value={animation} disabled={locked}>
                    {animationLabels[animation]}
                    {locked ? " · Premium" : ""}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Intensity">
          <div className="flex rounded-full bg-blush/70 p-1">
            {(["low", "medium", "high"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => update({ animation: { ...content.animation, intensity: value } })}
                className={cn(
                  "flex-1 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition",
                  content.animation.intensity === value
                    ? "bg-white text-plum shadow-sm"
                    : "text-ink-soft hover:text-plum",
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </Field>
        {!capabilities.advancedAnimation ? (
          <p className="flex items-center gap-1.5 text-[11px] text-ink-soft">
            <Crown className="size-3 text-rose" /> Advanced animations are included in Premium.
          </p>
        ) : null}
      </PanelSection>

      <PanelSection title="Music" description="A soft ambient loop, generated in the browser.">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-cream/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-blush text-rose">
              <Music2 className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-plum">Background music</p>
              <p className="text-[11px] text-ink-soft">
                Plays only after they open the gift.
              </p>
            </div>
          </div>
          <Switch
            checked={content.music.enabled}
            disabled={!capabilities.music}
            onCheckedChange={(checked) =>
              update({
                music: {
                  enabled: checked,
                  track: checked && content.music.track === "none" ? "dreamy" : content.music.track,
                },
              })
            }
            aria-label="Enable background music"
          />
        </div>
        <Field label="Track">
          <Select
            value={content.music.track}
            onValueChange={(value) =>
              update({
                music: {
                  ...content.music,
                  track: value as GiftContent["music"]["track"],
                },
              })
            }
            disabled={!content.music.enabled || !capabilities.music}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MUSIC_TRACKS.map((track) => (
                <SelectItem key={track} value={track}>
                  {track === "none" ? "No music" : track[0].toUpperCase() + track.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {!capabilities.music ? (
          <p className="flex items-center gap-1.5 text-[11px] text-ink-soft">
            <Crown className="size-3 text-rose" /> Music is included in Premium.
          </p>
        ) : null}
      </PanelSection>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Media                                                                      */
/* -------------------------------------------------------------------------- */

export function MediaPanel({
  giftId,
  content,
  update,
  capabilities,
}: {
  giftId: string;
  content: GiftContent;
  update: (patch: Partial<GiftContent>) => void;
  capabilities: StudioCapabilities;
}) {
  const [uploading, setUploading] = useState(false);
  const atLimit = content.media.length >= capabilities.maxMedia;

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    if (atLimit) {
      toast.error(`Your plan includes ${capabilities.maxMedia} photos per gift.`);
      return;
    }
    setUploading(true);
    const uploaded: GiftContent["media"] = [];
    for (const file of Array.from(files).slice(0, capabilities.maxMedia - content.media.length)) {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`/api/gifts/${giftId}/media`, {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        media?: { id: string; url: string; alt: string };
      };
      if (!response.ok || !data.ok || !data.media) {
        toast.error(data.error ?? "Could not upload that image.");
        continue;
      }
      uploaded.push(data.media);
    }
    if (uploaded.length) {
      update({ media: [...content.media, ...uploaded] });
      toast.success(uploaded.length === 1 ? "Photo added." : `${uploaded.length} photos added.`);
    }
    setUploading(false);
  }

  async function removeMedia(index: number) {
    const item = content.media[index];
    if (!item) return;
    update({ media: content.media.filter((_, i) => i !== index) });
    if (item.id) {
      await fetch(`/api/gifts/${giftId}/media?mediaId=${item.id}`, {
        method: "DELETE",
      }).catch(() => undefined);
    }
  }

  return (
    <div className="space-y-5">
      <PanelSection
        title="Photos"
        description={`${content.media.length} of ${capabilities.maxMedia} photos used. JPG, PNG, WebP, or GIF up to 4MB.`}
      >
        <label
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-petal bg-cream/60 px-6 py-10 text-center transition hover:border-rose",
            (atLimit || uploading) && "cursor-not-allowed opacity-60",
          )}
        >
          <UploadCloud className="size-7 text-rose" />
          <span className="mt-3 text-sm font-medium text-plum">
            {uploading ? "Uploading…" : atLimit ? "Photo limit reached" : "Add photos"}
          </span>
          <span className="mt-1 text-[11px] text-ink-soft">
            They will appear in a soft gallery inside the gift.
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="sr-only"
            disabled={atLimit || uploading}
            onChange={(event) => {
              void uploadFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>

        {content.media.length ? (
          <div className="grid grid-cols-2 gap-3">
            {content.media.map((item, index) => (
              <div
                key={`${item.url}-${index}`}
                className="group relative overflow-hidden rounded-2xl border border-line bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.alt || ""}
                  className="aspect-square w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => void removeMedia(index)}
                  className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-white/90 text-ink shadow transition hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove photo"
                >
                  <X className="size-3.5" />
                </button>
                <input
                  value={item.alt}
                  onChange={(event) => {
                    const media = [...content.media];
                    media[index] = { ...item, alt: event.target.value };
                    update({ media });
                  }}
                  placeholder="Describe the photo"
                  maxLength={200}
                  className="w-full border-t border-line bg-white px-2.5 py-2 text-[11px] outline-none"
                  aria-label="Photo description"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-2xl bg-blush/40 px-4 py-3 text-[11px] text-ink-soft">
            <ImagePlus className="size-4 text-rose" />
            Photos are optional. Words alone can be enough.
          </div>
        )}
        {capabilities.tier === "free" && atLimit ? (
          <p className="flex items-center gap-1.5 text-[11px] text-ink-soft">
            <Crown className="size-3 text-rose" /> Premium includes up to 20 photos per gift.
          </p>
        ) : null}
      </PanelSection>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Publish                                                                    */
/* -------------------------------------------------------------------------- */

export function PublishPanel({
  settings,
  setSettings,
  capabilities,
  status,
  slug,
}: {
  settings: PublishSettings;
  setSettings: (next: PublishSettings) => void;
  capabilities: StudioCapabilities;
  status: string;
  slug: string;
}) {
  const visibilities: { value: PublishSettings["visibility"]; title: string; body: string }[] = [
    { value: "unlisted", title: "Unlisted", body: "Only people with the link can open it." },
    { value: "public", title: "Public", body: "May appear in the Heartly gallery." },
    { value: "password", title: "Password", body: "Requires a password to open." },
  ];

  return (
    <div className="space-y-5">
      <PanelSection title="Who can open it?" description="Unlisted is the safest default.">
        <div className="space-y-2">
          {visibilities.map((option) => {
            const locked = option.value === "password" && !capabilities.passwordProtection;
            return (
              <button
                key={option.value}
                type="button"
                disabled={locked}
                onClick={() => setSettings({ ...settings, visibility: option.value })}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition",
                  settings.visibility === option.value
                    ? "border-rose bg-blush/40"
                    : "border-line bg-white hover:border-rose/30",
                  locked && "opacity-50",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-4 items-center justify-center rounded-full border",
                    settings.visibility === option.value
                      ? "border-rose bg-rose text-white"
                      : "border-line",
                  )}
                >
                  {settings.visibility === option.value ? (
                    <span className="size-1.5 rounded-full bg-white" />
                  ) : null}
                </span>
                <span>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-plum">
                    {option.title}
                    {locked ? <Lock className="size-3 text-rose" /> : null}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-ink-soft">
                    {option.body}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {settings.visibility === "password" ? (
          <Field label="Password">
            <Input
              value={settings.password}
              onChange={(event) => setSettings({ ...settings, password: event.target.value })}
              placeholder="At least 4 characters"
              minLength={4}
              maxLength={72}
              type="text"
            />
          </Field>
        ) : null}
      </PanelSection>

      <PanelSection title="Timing" description="Give it an opening night, or a gentle expiry.">
        <Field label="Deliver at" hint={capabilities.scheduledDelivery ? undefined : "Premium"}>
          <Input
            type="datetime-local"
            value={settings.scheduledAt}
            disabled={!capabilities.scheduledDelivery}
            onChange={(event) => setSettings({ ...settings, scheduledAt: event.target.value })}
          />
        </Field>
        <Field label="Expire at" hint={capabilities.giftExpiry ? undefined : "Premium"}>
          <Input
            type="datetime-local"
            value={settings.expiresAt}
            disabled={!capabilities.giftExpiry}
            onChange={(event) => setSettings({ ...settings, expiresAt: event.target.value })}
          />
        </Field>
      </PanelSection>

      <PanelSection title="Presentation">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-cream/60 px-4 py-3">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-plum">
              Remove Heartly branding
              {!capabilities.removeBranding ? <Crown className="size-3 text-rose" /> : null}
            </p>
            <p className="text-[11px] text-ink-soft">
              Keeps the gift feeling entirely yours.
            </p>
          </div>
          <Switch
            checked={settings.removeBranding}
            disabled={!capabilities.removeBranding}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, removeBranding: checked })
            }
            aria-label="Remove Heartly branding"
          />
        </div>
      </PanelSection>

      <PanelSection title="Gift status">
        <div className="flex items-center justify-between rounded-2xl border border-line bg-cream/60 px-4 py-3">
          <div>
            <p className="text-sm font-medium capitalize text-plum">{status}</p>
            <p className="text-[11px] text-ink-soft">
              {status === "published" ? `/g/${slug}` : "Not shared yet"}
            </p>
          </div>
          <Badge variant={status === "published" ? "success" : "outline"}>
            {status === "published" ? "Live" : "Draft"}
          </Badge>
        </div>
      </PanelSection>
    </div>
  );
}
