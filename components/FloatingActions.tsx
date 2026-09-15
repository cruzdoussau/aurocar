"use client";

import { usePathname } from "next/navigation";
import { company } from "@/lib/constants";

export function FloatingActions() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <a href={company.whatsappNumber ? `https://wa.me/${company.whatsappNumber}` : "/#contacto"} className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-lg font-black text-white shadow-glow" aria-label="Contactar por WhatsApp">W</a>
      <a href="/agendar#agendar" className="fixed bottom-5 left-4 z-50 rounded-lg bg-action px-4 py-3 text-xs font-black uppercase tracking-wide text-white shadow-red md:hidden">Agendar</a>
    </>
  );
}
