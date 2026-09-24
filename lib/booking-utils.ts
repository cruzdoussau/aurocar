import { format, isBefore, isSunday, parseISO, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { company, services } from "@/lib/constants";
import type { Booking } from "@/types/booking";

export function isBookableDate(value: string) {
  const date = parseISO(value);
  const today = startOfDay(new Date());
  return !isBefore(date, today) && !isSunday(date);
}

export function isBookableTime(value: string) {
  return company.timeSlots.includes(value);
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function serviceDuration(serviceId: string) {
  return services.find((service) => service.id === serviceId)?.durationMinutes || 60;
}

export function slotFitsSchedule(time: string, durationMinutes: number) {
  return timeToMinutes(time) + durationMinutes <= timeToMinutes(company.closingTime);
}

export function slotConflicts(candidateTime: string, candidateServiceId: string, existingTime: string, existingServiceId: string) {
  const candidateStart = timeToMinutes(candidateTime);
  const candidateEnd = candidateStart + serviceDuration(candidateServiceId);
  const existingStart = timeToMinutes(existingTime);
  const existingEnd = existingStart + serviceDuration(existingServiceId);
  return candidateStart < existingEnd && existingStart < candidateEnd;
}

export function bookingBlocksSlot(booking: Pick<Booking, "status" | "created_at">, now = Date.now()) {
  if (booking.status === "confirmada") return true;
  if (booking.status !== "pendiente") return false;
  const createdAt = Date.parse(booking.created_at);
  if (Number.isNaN(createdAt)) return true;
  return createdAt + company.pendingHoldMinutes * 60_000 > now;
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
