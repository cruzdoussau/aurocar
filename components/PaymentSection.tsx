import { AlertTriangle, CreditCard } from "lucide-react";
import { company } from "@/lib/constants";

export function PaymentSection() {
  return (
    <section className="container-x py-20">
      <div className="premium-card grid gap-8 rounded-lg p-6 md:grid-cols-[1fr_auto] md:items-center md:p-9">
        <div>
          <p className="mb-3 text-sm font-black uppercase text-electric">Pago seguro</p>
          <h2 className="font-display text-5xl leading-none sm:text-6xl">Pago seguro con Mercado Pago</h2>
          <p className="mt-4 max-w-2xl text-slate-300">El pago se realiza unicamente despues de que Aurocar confirme tu fecha y horario.</p>
          <p className="mt-4 flex gap-2 rounded-lg border border-gold/40 bg-gold/10 p-4 text-sm font-bold text-yellow-100">
            <AlertTriangle className="shrink-0" size={18} />
            No realices el pago antes de recibir la confirmacion de tu reserva.
          </p>
        </div>
        <a href={company.paymentLink} target="_blank" rel="noreferrer" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-action px-6 text-sm font-black uppercase text-white shadow-red">
          <CreditCard size={19} />
          Ir a Mercado Pago
        </a>
      </div>
    </section>
  );
}
