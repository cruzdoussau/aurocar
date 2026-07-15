import Image from "next/image";
import { BadgeCheck, Gem, ShieldCheck, UserCheck } from "lucide-react";
import { serviceImages } from "@/lib/constants";

const stats = [
  ["Productos premium", Gem],
  ["Atencion personalizada", UserCheck],
  ["Personal capacitado", ShieldCheck],
  ["Resultados garantizados", BadgeCheck]
];

export function About() {
  return (
    <section id="nosotros" className="container-x grid gap-10 py-24 lg:grid-cols-2 lg:items-center">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 shadow-glow">
        <Image src={serviceImages.vip} alt="Aurocar lavado VIP" fill className="object-cover" />
      </div>
      <div>
        <p className="mb-3 text-sm font-black uppercase text-electric">Nosotros</p>
        <h2 className="font-display text-6xl leading-none sm:text-7xl">Cuidamos tu vehiculo como si fuera nuestro</h2>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          En Aurocar nos especializamos en detailing automotriz, lavado profesional y limpieza de tapiceria. Trabajamos con productos de calidad, procesos cuidadosos y atencion personalizada para recuperar la limpieza, proteccion y presentacion de cada vehiculo.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {stats.map(([label, Icon]) => (
            <div key={label as string} className="premium-card rounded-lg p-4">
              <Icon className="mb-3 text-electric" size={22} />
              <p className="font-bold">{label as string}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
