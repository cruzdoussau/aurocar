import { CalendarCheck, CheckCheck, ClipboardList, CreditCard, MessageCircle } from "lucide-react";

const steps = [
  ["Elige tu servicio", ClipboardList],
  ["Selecciona fecha y hora", CalendarCheck],
  ["Envia tu solicitud", MessageCircle],
  ["Aurocar confirma la cita", CheckCheck],
  ["Realiza el pago", CreditCard]
];

export function BookingSteps() {
  return (
    <section id="como-funciona" className="border-y border-white/10 bg-carbon/60 py-20">
      <div className="container-x">
        <p className="mb-3 text-sm font-black uppercase text-electric">Como funciona</p>
        <h2 className="font-display text-6xl leading-none sm:text-7xl">Agenda tu servicio en pocos pasos</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-5">
          {steps.map(([label, Icon], index) => (
            <div key={label as string} className="premium-card rounded-lg p-5">
              <span className="mb-5 grid h-11 w-11 place-items-center rounded-lg bg-action font-black">{index + 1}</span>
              <Icon className="mb-4 text-electric" size={24} />
              <p className="font-bold">{label as string}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-lg border border-action/40 bg-action/10 p-5 text-sm font-bold text-red-100">
          La solicitud de reserva no garantiza automaticamente el horario. Aurocar revisara la disponibilidad y confirmara la cita antes de solicitar el pago.
        </div>
      </div>
    </section>
  );
}
