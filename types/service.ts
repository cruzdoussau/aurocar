export type ServiceCategory = "lavado" | "tapiceria" | "premium" | "focos";

export type AurocarService = {
  id: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  description: string;
  image: string;
  durationMinutes: number;
  priceLabel: string;
  price?: number;
  includes: string[];
  benefits?: string[];
};
