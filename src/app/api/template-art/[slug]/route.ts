import { NextResponse } from "next/server";
import { getCatalogue } from "@/lib/templates/data";
import { findCategory, findTemplate, templateArtPalette } from "@/lib/templates/catalog";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrap(value: string, max: number): string[] {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = `${line} ${word}`.trim();
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { categories, templates } = await getCatalogue();
  const template = findTemplate(templates, slug);
  if (!template) {
    return new NextResponse("Not found", { status: 404 });
  }
  const category = findCategory(categories, template.category_id);
  const palette = templateArtPalette(template);
  const title =
    (template.default_content as { title?: string }).title ?? template.name;
  const lines = wrap(title, 18);
  const lineHeight = 92;
  const startY = 450 - ((lines.length - 1) * lineHeight) / 2;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-label="${escapeXml(template.name)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.background}"/>
      <stop offset="55%" stop-color="${palette.secondary}"/>
      <stop offset="100%" stop-color="${palette.background}"/>
    </linearGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="70"/></filter>
  </defs>
  <rect width="1200" height="900" fill="url(#bg)"/>
  <circle cx="1010" cy="170" r="220" fill="${palette.accent}" opacity="0.22" filter="url(#blur)"/>
  <circle cx="180" cy="760" r="240" fill="${palette.accent}" opacity="0.16" filter="url(#blur)"/>
  <g fill="none" stroke="${palette.accent}" stroke-opacity="0.22">
    <circle cx="600" cy="450" r="310"/>
    <circle cx="600" cy="450" r="360"/>
  </g>
  <g transform="translate(600 450)" opacity="0.9">
    <path d="M0 -34 C-26 -66 -76 -42 -70 -6 C-65 26 -24 52 0 72 C24 52 65 26 70 -6 C76 -42 26 -66 0 -34 Z" fill="${palette.accent}" fill-opacity="0.12"/>
  </g>
  <text x="600" y="150" text-anchor="middle" font-family="Georgia, serif" font-size="22" letter-spacing="8" fill="${palette.text}" opacity="0.55">HEARTLY</text>
  <text x="600" y="215" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="24" letter-spacing="5" fill="${palette.accent}">${escapeXml((category?.name ?? "DIGITAL GIFT").toUpperCase())}</text>
  ${lines
    .map(
      (line, index) =>
        `<text x="600" y="${startY + index * lineHeight}" text-anchor="middle" font-family="Georgia, serif" font-size="78" fill="${palette.text}">${escapeXml(line)}</text>`,
    )
    .join("\n  ")}
  <text x="600" y="700" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="${palette.text}" opacity="0.6">A little something, made personal.</text>
  <g transform="translate(600 795)" fill="${palette.accent}">
    <circle cx="-18" cy="0" r="5" opacity="0.4"/>
    <circle cx="0" cy="0" r="6"/>
    <circle cx="18" cy="0" r="5" opacity="0.4"/>
  </g>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
    },
  });
}
