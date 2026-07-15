import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import type { AurocarService } from "@/types/service";

export function ServiceCard({ service }: { service: AurocarService }) {
  return (
    <article className="premium-card group grid overflow-hidden rounded-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={service.image} alt={service.name} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 1024px) 33vw, 100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-ink/80 px-3 py-1 text-xs font-black uppercase text-sky-100">
          {service.priceLabel}
        </span>
      </div>
      <div className="grid gap-5 p-5">
        <div>
          <h3 className="font-display text-4xl uppercase metal-text">{service.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{service.description}</p>
        </div>
        <ul className="grid gap-2">
          {service.includes.slice(0, 5).map((item) => (
            <li key={item} className="flex gap-2 text-sm text-slate-200">
              <CheckCircle2 className="mt-0.5 shrink-0 text-electric" size={16} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <a href={`#agendar?servicio=${service.id}`} className="rounded-lg bg-white px-4 py-3 text-center text-xs font-black uppercase text-ink transition hover:bg-sky-100">
          Agendar este servicio
        </a>
      </div>
    </article>
  );
}
