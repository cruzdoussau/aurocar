export type ServiceCategory = "lavado" | "tapiceria" | "premium" | "focos";

export type VehicleType = "City car" | "Sedan" | "SUV" | "Camioneta XL" | "Furgon";

export type AurocarService = {
  id: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  description: string;
  image: string;
  durationMinutes: number;
  priceLabel: string;
  prices?: Partial<Record<VehicleType, number>>;
  includes: string[];
  benefits?: string[];
};
