const faqs = [
  ["La reserva queda confirmada inmediatamente?", "No. Primero recibimos tu solicitud, revisamos disponibilidad y luego confirmamos por WhatsApp o correo."],
  ["Cuando debo pagar?", "Solo despues de recibir la confirmacion de Aurocar."],
  ["Puedo pagar antes de la confirmacion?", "No es recomendable. El pago debe realizarse cuando la cita ya esta confirmada."],
  ["Que pasa si necesito cambiar la fecha?", "Puedes contactar a Aurocar para revisar nuevos horarios disponibles."],
  ["Cuanto demora cada servicio?", "Depende del servicio y del estado del vehiculo. Las duraciones quedan configuradas en la ficha de cada servicio."],
  ["Atienden los domingos?", "No. La atencion es de lunes a sabado, de 09:00 a 18:00 horas."],
  ["Que medios de pago aceptan?", "El pago online se realiza mediante Mercado Pago una vez confirmada la reserva."],
  ["Debo retirar objetos personales?", "Si. Recomendamos retirar objetos personales antes del servicio para trabajar con mayor cuidado."]
];

export function FAQ() {
  return (
    <section className="container-x py-24">
      <p className="mb-3 text-sm font-black uppercase text-electric">Preguntas frecuentes</p>
      <h2 className="font-display text-6xl leading-none sm:text-7xl">Antes de agendar</h2>
      <div className="mt-10 grid gap-3 md:grid-cols-2">
        {faqs.map(([question, answer]) => (
          <details key={question} className="premium-card rounded-lg p-5">
            <summary className="cursor-pointer text-base font-black text-white">{question}</summary>
            <p className="mt-4 text-sm leading-6 text-slate-300">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
