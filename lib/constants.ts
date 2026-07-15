import type { AurocarService } from "@/types/service";

export const company = {
  name: "Aurocar",
  legalName: "AURO CAR",
  tagline: "Detailing de autos y limpieza de tapiceria",
  instagram: "@Aurocar2025",
  instagramUrl: "https://www.instagram.com/Aurocar2025",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  address: process.env.NEXT_PUBLIC_AUROCAR_ADDRESS || "Direccion por confirmar",
  paymentLink: "https://link.mercadopago.cl/aurocar",
  scheduleLabel: "Lunes a sabado de 09:00 a 18:00 horas. Domingo cerrado.",
  availableDays: [1, 2, 3, 4, 5, 6],
  timeSlots: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
  vehicleTypes: ["City car", "Sedan", "SUV", "Camioneta XL", "Furgon"]
};

export const serviceImages = {
  simple: "/imagenes/WhatsApp Image 2026-07-14 at 17.48.24.jpeg",
  vip: "/imagenes/WhatsApp Image 2026-07-14 at 17.48.25 (1).jpeg",
  focos: "/imagenes/WhatsApp Image 2026-07-14 at 17.48.25 (2).jpeg",
  intermedio: "/imagenes/WhatsApp Image 2026-07-14 at 17.48.25.jpeg",
  premium: "/imagenes/WhatsApp Image 2026-07-14 at 19.45.19.jpeg",
  tapiceria: "/imagenes/WhatsApp Image 2026-07-14 at 19.45.20.jpeg",
  precios: "/imagenes/WhatsApp Image 2026-07-07 at 17.55.34.jpeg",
  hero: "/imagenes/ChatGPT Image 14 jul 2026, 23_27_41.png"
};

export const services: AurocarService[] = [
  {
    id: "lavado-simple",
    slug: "lavado-simple",
    name: "Lavado simple",
    category: "lavado",
    description: "Limpieza exterior basica para mantener tu vehiculo limpio y presentable.",
    image: serviceImages.simple,
    durationMinutes: 60,
    priceLabel: "Precio editable",
    includes: [
      "Lavado exterior con hidrolavadora",
      "Limpieza de llantas y neumaticos",
      "Renovador de neumaticos",
      "Aspirado interior basico",
      "Limpieza de marcos y puertas"
    ]
  },
  {
    id: "lavado-intermedio",
    slug: "lavado-intermedio",
    name: "Lavado intermedio",
    category: "lavado",
    description: "Una limpieza mas detallada del interior y exterior de tu vehiculo.",
    image: serviceImages.intermedio,
    durationMinutes: 90,
    priceLabel: "Precio editable",
    includes: [
      "Todo lo del lavado simple",
      "Limpieza detallada de paneles y consola",
      "Limpieza profunda del interior",
      "Detalle en puertas y compartimientos",
      "Terminacion mas completa"
    ]
  },
  {
    id: "tapiceria",
    slug: "limpieza-de-tapiceria",
    name: "Limpieza de tapiceria",
    category: "tapiceria",
    description: "Recuperamos la limpieza, frescura y apariencia interior de tu vehiculo.",
    image: serviceImages.tapiceria,
    durationMinutes: 150,
    priceLabel: "Precio editable",
    includes: [
      "Aspirado profundo",
      "Aplicacion de productos especiales",
      "Cepillado profesional",
      "Extraccion de suciedad y manchas",
      "Desinfeccion"
    ],
    benefits: ["Eliminacion de malos olores", "Reduccion de acaros y bacterias"]
  },
  {
    id: "lavado-premium",
    slug: "lavado-premium",
    name: "Lavado premium",
    category: "premium",
    description: "Limpieza completa con productos premium, desinfeccion y proteccion.",
    image: serviceImages.premium,
    durationMinutes: 180,
    priceLabel: "Desde $35.000 segun vehiculo",
    includes: [
      "Todo lo del lavado intermedio",
      "Productos premium para interior y exterior",
      "Limpieza profunda de plasticos y vinilos",
      "Limpieza y desinfeccion a vapor",
      "Limpieza profunda de tapiceria",
      "Proteccion y renovacion de superficies"
    ]
  },
  {
    id: "lavado-vip",
    slug: "lavado-vip",
    name: "Lavado VIP",
    category: "premium",
    description: "La experiencia de cuidado mas completa para clientes exigentes.",
    image: serviceImages.vip,
    durationMinutes: 150,
    priceLabel: "Precio editable",
    includes: [
      "Todo lo del lavado intermedio",
      "Productos premium",
      "Limpieza profunda de plasticos y vinilos",
      "Proteccion y renovacion de superficies",
      "Acabado superior de brillo y proteccion",
      "Aromatizacion premium"
    ]
  },
  {
    id: "pulido-focos",
    slug: "pulido-de-focos",
    name: "Pulido de focos",
    category: "focos",
    description: "Recupera la iluminacion, seguridad y apariencia de tus focos.",
    image: serviceImages.focos,
    durationMinutes: 75,
    priceLabel: "Precio editable",
    includes: [
      "Mejora la iluminacion nocturna",
      "Aumenta la seguridad",
      "Mejora la estetica del vehiculo",
      "Evita cambiar los focos",
      "Valoriza el automovil"
    ]
  }
];

export const bookingStatuses = ["pendiente", "confirmada", "rechazada", "completada", "cancelada"] as const;
