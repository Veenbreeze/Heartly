import type { Category, Plan, Template } from "@/lib/types";
import seed from "./seed-data.json";

// The fallback catalogue mirrors the SQL seed exactly. It keeps marketing pages
// and the studio preview usable before a Supabase project is connected and
// during static builds. When Supabase is configured, server queries take
// precedence and the database remains the source of truth.
export const fallbackCategories = seed.categories as unknown as Category[];
export const fallbackTemplates = seed.templates as unknown as Template[];
export const fallbackPlans = seed.plans as unknown as Plan[];

export function findCategory(
  categories: Category[],
  value: string,
): Category | undefined {
  return categories.find(
    (category) => category.id === value || category.slug === value,
  );
}

export function findTemplate(
  templates: Template[],
  value: string,
): Template | undefined {
  return templates.find(
    (template) => template.id === value || template.slug === value,
  );
}

export function templatesInCategory(
  templates: Template[],
  categoryId: string,
): Template[] {
  return templates.filter((template) => template.category_id === categoryId);
}

export function categoryName(
  categories: Category[],
  categoryId: string,
): string {
  return findCategory(categories, categoryId)?.name ?? "Digital gift";
}

export function templateById(templates: Template[], templateId: string) {
  return templates.find((template) => template.id === templateId) ?? null;
}

export function templateArtPalette(template: Template | undefined) {
  const colors = template?.default_colors ?? {};
  const content = (template?.default_content ?? {}) as {
    theme?: Record<string, string>;
  };
  return {
    background: colors.background ?? content.theme?.background ?? "#FFF9F7",
    accent: colors.accent ?? content.theme?.accent ?? "#E85D75",
    secondary: colors.secondary ?? content.theme?.secondary ?? "#FCE7EF",
    text: colors.text ?? content.theme?.text ?? "#29212A",
  };
}
