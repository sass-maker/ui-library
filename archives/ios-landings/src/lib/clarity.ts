import type { ProductId } from "./catalog";

const clarityProjectIds: Partial<Record<ProductId, string>> = {
  anchor: "y6bwr0anyd",
  browserdaddy: "ymdsbwwko3",
  calorie: "y6bultfwvf",
  contextdaddy: "yoig7ab0eb",
  kith: "y6bus3owf7",
  motion: "y6bvl31bna",
  performancedaddy: "ymdspsyir7",
  setline: "y6bunkz9vz"
};

export function clarityProjectIdFor(productId: ProductId): string | undefined {
  return clarityProjectIds[productId];
}
