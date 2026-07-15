import type { Metadata } from "next";
import "./globals.css";
import { company } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Aurocar | Detailing, lavado y limpieza de tapiceria",
  description: "Agenda online tu lavado, detailing o limpieza de tapiceria en Aurocar. Solicitud con confirmacion previa y pago seguro por Mercado Pago.",
  metadataBase: new URL("https://aurocar.cl"),
  openGraph: {
    title: "Aurocar | Tu auto como nuevo, siempre",
    description: "Limpieza, proteccion y renovacion automotriz con atencion personalizada.",
    type: "website",
    images: ["/imagenes/WhatsApp Image 2026-07-14 at 19.45.19.jpeg"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        {children}
        <a
          href={company.whatsappNumber ? `https://wa.me/${company.whatsappNumber}` : "#contacto"}
          className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-lg font-black text-white shadow-glow"
          aria-label="Contactar por WhatsApp"
        >
          W
        </a>
        <a
          href="#agendar"
          className="fixed bottom-5 left-4 z-50 rounded-lg bg-action px-4 py-3 text-xs font-black uppercase tracking-wide text-white shadow-red md:hidden"
        >
          Agendar
        </a>
      </body>
    </html>
  );
}
