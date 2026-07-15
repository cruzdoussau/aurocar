import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { services } from "@/lib/constants";

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();

  return (
    <>
      <Header />
      <main className="container-x grid gap-10 py-32 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-white/10">
          <Image src={service.image} alt={service.name} fill className="object-cover" />
        </div>
        <div>
          <p className="mb-3 text-sm font-black uppercase text-electric">{service.priceLabel}</p>
          <h1 className="font-display text-7xl leading-none">{service.name}</h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">{service.description}</p>
          <ul className="mt-7 grid gap-3">
            {service.includes.map((item) => (
              <li key={item} className="flex gap-3 text-slate-200">
                <CheckCircle2 className="shrink-0 text-electric" />
                {item}
              </li>
            ))}
          </ul>
          <a href="/agendar" className="mt-8 inline-flex rounded-lg bg-action px-6 py-4 text-sm font-black uppercase text-white shadow-red">Agendar ahora</a>
        </div>
      </main>
      <Footer />
    </>
  );
}
