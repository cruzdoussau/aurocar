import { format, isBefore, isSunday, parseISO, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { company } from "@/lib/constants";
import type { Booking } from "@/types/booking";

export function isBookableDate(value: string) {
  const date = parseISO(value);
  const today = startOfDay(new Date());
  return !isBefore(date, today) && !isSunday(date);
}

export function isBookableTime(value: string) {
  return company.timeSlots.includes(value);
}

export function generateBookingCode(sequence: number) {
  return `AUR-${new Date().getFullYear()}-${String(sequence).padStart(4, "0")}`;
}

export function formatHumanDate(value: string) {
  return format(parseISO(value), "EEEE d 'de' MMMM yyyy", { locale: es });
}

export function buildWhatsAppMessage(booking: Booking) {
  if (booking.status === "rechazada") {
    return `Hola, ${booking.customer_name}. Gracias por contactar a Aurocar. Lamentablemente el horario solicitado ya no se encuentra disponible. Podemos ayudarte a elegir otra fecha u horario.`;
  }

  return `Hola, ${booking.customer_name}. Tu reserva en Aurocar ha sido confirmada para el dia ${formatHumanDate(booking.booking_date)} a las ${booking.booking_time}, correspondiente al servicio ${booking.service_name}. Una vez confirmada tu cita, puedes realizar el pago en: ${company.paymentLink}`;
}
