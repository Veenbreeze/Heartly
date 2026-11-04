import { createPublicSupabaseClient } from "@/lib/supabase/public";
import {
  fallbackCategories,
  fallbackPlans,
  fallbackTemplates,
  findCategory,
  findTemplate,
} from "@/lib/templates/catalog";
import type { Category, Plan, Template, TemplateWithCategory } from "@/lib/types";

export interface Catalogue {
  categories: Category[];
  templates: Template[];
  plans: Plan[];
  source: "database" | "fallback";
}

export async function getCatalogue(): Promise<Catalogue> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return {
      categories: fallbackCategories,
      templates: fallbackTemplates,
      plans: fallbackPlans,
      source: "fallback",
    };
  }

  try {
    const [categoriesResult, templatesResult, plansResult] = await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("templates")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
      supabase.from("plans").select("*").eq("is_active", true).order("sort_order"),
    ]);

    if (categoriesResult.error) throw categoriesResult.error;
    if (templatesResult.error) throw templatesResult.error;
    if (plansResult.error) throw plansResult.error;

    if (!categoriesResult.data?.length || !templatesResult.data?.length) {
      throw new Error("No catalogue rows found");
    }

    return {
      categories: categoriesResult.data as Category[],
      templates: templatesResult.data as Template[],
      plans: plansResult.data as Plan[],
      source: "database",
    };
  } catch {
    return {
      categories: fallbackCategories,
      templates: fallbackTemplates,
      plans: fallbackPlans,
      source: "fallback",
    };
  }
}

export async function getTemplateWithCategory(
  slug: string,
): Promise<{ template: TemplateWithCategory; category: Category } | null> {
  const catalogue = await getCatalogue();
  const template = findTemplate(catalogue.templates, slug);
  if (!template) return null;
  const category = findCategory(catalogue.categories, template.category_id);
  if (!category) return null;
  return { template: { ...template, categories: category }, category };
}

export async function getCategoryWithTemplates(slug: string) {
  const catalogue = await getCatalogue();
  const category = findCategory(catalogue.categories, slug);
  if (!category) return null;
  return {
    category,
    templates: catalogue.templates.filter(
      (template) => template.category_id === category.id,
    ),
  };
}

export function getFallbackPlan(code: string): Plan {
  return (
    fallbackPlans.find((plan) => plan.code === code) ?? fallbackPlans[0]
  );
}
