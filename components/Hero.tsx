import Image from "next/image";
import { BadgeCheck, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import { serviceImages } from "@/lib/constants";

const indicators = [
  ["Acabado premium", Sparkles],
  ["Proteccion y renovacion", ShieldCheck],
  ["Resultados garantizados", BadgeCheck],
  ["Atencion personalizada", UserCheck]
];

export function Hero() {
  return (
    <section id="inicio" className="relative min-h-screen overflow-hidden pt-20">
      <Image src={serviceImages.hero} alt="Vehiculo premium Aurocar" fill priority className="object-cover object-center opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/78 to-ink/28" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
      <div className="container-x relative z-10 flex min-h-[calc(100vh-80px)] items-center py-16">
        <div className="max-w-3xl">
          <p className="mb-4 inline-flex rounded-full border border-electric/40 bg-electric/10 px-4 py-2 text-xs font-black uppercase text-sky-200 shadow-glow">
            Detailing profesional
          </p>
          <h1 className="font-display text-[4.8rem] leading-[.86] text-white sm:text-[7rem] lg:text-[9rem]">
            Tu auto como nuevo, <span className="red-word">siempre</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
            En Aurocar entregamos limpieza, proteccion y renovacion con productos premium y atencion de primer nivel.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#agendar" className="rounded-lg bg-action px-6 py-4 text-sm font-black uppercase text-white shadow-red transition hover:-translate-y-0.5">
              Agendar mi lavado
            </a>
            <a href="#servicios" className="rounded-lg border border-white/15 bg-white/10 px-6 py-4 text-sm font-black uppercase text-white transition hover:bg-white/15">
              Ver servicios
            </a>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {indicators.map(([label, Icon]) => (
              <div key={label as string} className="premium-card rounded-lg p-4">
                <Icon className="mb-3 text-electric" size={22} />
                <p className="text-sm font-bold text-slate-100">{label as string}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
