import Image from "next/image";
import { serviceImages } from "@/lib/constants";

const gallery = [
  ["Pulido de focos", serviceImages.focos],
  ["Limpieza de tapiceria", serviceImages.tapiceria],
  ["Lavado exterior", serviceImages.simple],
  ["Interior", serviceImages.intermedio],
  ["Terminaciones premium", serviceImages.premium]
];

export function Gallery() {
  return (
    <section className="border-y border-white/10 bg-carbon/60 py-20">
      <div className="container-x">
        <p className="mb-3 text-sm font-black uppercase text-electric">Antes y despues</p>
        <h2 className="font-display text-6xl leading-none sm:text-7xl">Resultados que se notan</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-5">
          {gallery.map(([label, image]) => (
            <article key={label} className="premium-card overflow-hidden rounded-lg">
              <div className="relative aspect-[3/4]">
                <Image src={image} alt={label} fill className="object-cover" sizes="(min-width: 768px) 20vw, 100vw" />
              </div>
              <p className="p-4 text-sm font-black uppercase text-slate-100">{label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
