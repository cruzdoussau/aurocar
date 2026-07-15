import { services } from "@/lib/constants";
import { ServiceCard } from "@/components/ServiceCard";

export function Services() {
  return (
    <section id="servicios" className="container-x py-24">
      <p className="mb-3 text-sm font-black uppercase text-electric">Nuestros servicios</p>
      <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <h2 className="max-w-3xl font-display text-6xl leading-none sm:text-7xl">El servicio perfecto para tu auto</h2>
        <p className="max-w-md text-slate-300">Cada plan esta pensado para una necesidad distinta: mantenimiento diario, limpieza profunda, terminaciones premium o recuperacion de focos.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
}
