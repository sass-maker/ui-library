import { site as anchor } from "../../products/anchor/site.config";
import { site as calorie } from "../../products/calorie/site.config";
import { site as habits } from "../../products/habits/site.config";
import { site as journal } from "../../products/journal/site.config";
import { site as kith } from "../../products/kith/site.config";
import { site as motion } from "../../products/motion/site.config";
import { site as setline } from "../../products/setline/site.config";
import { site as storagedaddy } from "../../products/storagedaddy/site.config";
import { site as performancedaddy } from "../../products/performancedaddy/site.config";
import { site as browserdaddy } from "../../products/browserdaddy/site.config";
import { site as contextdaddy } from "../../products/contextdaddy/site.config";
import type { SiteConfig } from "./types";

export const catalog = {
  kith,
  setline,
  anchor,
  motion,
  calorie,
  journal,
  habits,
  storagedaddy,
  performancedaddy,
  browserdaddy,
  contextdaddy
} as const satisfies Record<string, SiteConfig>;

export type ProductId = keyof typeof catalog;
export const PRODUCT_IDS = Object.keys(catalog) as ProductId[];

export function resolveProductId(raw?: string): ProductId {
  const id = raw?.trim() || "kith";
  if (id in catalog) return id as ProductId;
  throw new Error(`Unknown PRODUCT="${id}". Use: ${PRODUCT_IDS.join(", ")}`);
}
