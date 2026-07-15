import { company, services } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink py-10">
      <div className="container-x grid gap-8 md:grid-cols-4">
        <div>
          <p className="font-display text-4xl">{company.legalName}</p>
          <p className="text-sm text-slate-400">{company.tagline}</p>
        </div>
        <div>
          <p className="mb-3 font-black uppercase">Navegacion</p>
          <div className="grid gap-2 text-sm text-slate-400">
            <a href="#servicios">Servicios</a>
            <a href="#agendar">Agendar</a>
            <a href="#contacto">Contacto</a>
            <a href="/admin/login">Admin</a>
          </div>
        </div>
        <div>
          <p className="mb-3 font-black uppercase">Servicios</p>
          <div className="grid gap-2 text-sm text-slate-400">
            {services.slice(0, 5).map((service) => <span key={service.id}>{service.name}</span>)}
          </div>
        </div>
        <div>
          <p className="mb-3 font-black uppercase">Horario y pago</p>
          <p className="text-sm text-slate-400">{company.scheduleLabel}</p>
          <a className="mt-3 inline-block text-sm font-bold text-electric" href={company.paymentLink} target="_blank" rel="noreferrer">Mercado Pago</a>
        </div>
      </div>
      <div className="container-x mt-8 border-t border-white/10 pt-5 text-xs text-slate-500">
        © {new Date().getFullYear()} Aurocar. Aviso de privacidad · Terminos y condiciones.
      </div>
    </footer>
  );
}
