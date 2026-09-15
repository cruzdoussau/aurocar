import type { Metadata } from "next";
import "./globals.css";
import { FloatingActions } from "@/components/FloatingActions";

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
        <FloatingActions />
      </body>
    </html>
  );
}
