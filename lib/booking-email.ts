import { formatHumanDate } from "@/lib/booking-utils";
import { formatPrice } from "@/lib/constants";
import type { Booking } from "@/types/booking";

type EmailDelivery = {
  customer: boolean;
  aurocar: boolean;
  configured: boolean;
};

type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function detailRows(booking: Booking) {
  const details = [
    ["Código", booking.booking_code],
    ["Servicio", booking.service_name],
    ["Vehículo", booking.vehicle_type],
    ["Precio", formatPrice(booking.price)],
    ["Fecha", formatHumanDate(booking.booking_date)],
    ["Hora", `${booking.booking_time} hrs`]
  ];

  return details
    .map(([label, value]) => `<tr><td style="padding:7px 12px;color:#64748b;font-size:13px">${escapeHtml(label)}</td><td style="padding:7px 12px;color:#0f172a;font-size:14px;font-weight:700">${escapeHtml(value)}</td></tr>`)
    .join("");
}

function emailShell(title: string, lead: string, content: string) {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a"><div style="max-width:620px;margin:0 auto;padding:32px 16px"><div style="border-radius:18px 18px 0 0;background:#05070b;padding:24px;text-align:center"><div style="font-size:24px;font-weight:900;color:#fff;letter-spacing:.08em">AURO <span style="color:#ef4444">CAR</span></div><div style="margin-top:5px;color:#94a3b8;font-size:12px">Detailing de autos y limpieza de tapicería</div></div><div style="border-radius:0 0 18px 18px;background:#fff;padding:30px"><h1 style="margin:0 0 12px;font-size:24px">${escapeHtml(title)}</h1><p style="margin:0 0 22px;color:#475569;line-height:1.6">${escapeHtml(lead)}</p>${content}<p style="margin:24px 0 0;color:#64748b;font-size:12px;line-height:1.5">Este correo fue generado automáticamente por la agenda online de Aurocar.</p></div></div></body></html>`;
}

async function sendEmail(apiKey: string, from: string, message: EmailMessage) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [message.to],
      subject: message.subject,
      html: message.html,
      reply_to: message.replyTo
    }),
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend respondió ${response.status}: ${errorText.slice(0, 300)}`);
  }
}

export async function sendBookingRequestEmails(booking: Booking): Promise<EmailDelivery> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.BOOKING_FROM_EMAIL;
  const aurocarEmail = process.env.BOOKING_NOTIFICATION_EMAIL;

  if (!apiKey || !from || !aurocarEmail) {
    console.warn("Booking email skipped: RESEND_API_KEY, BOOKING_FROM_EMAIL or BOOKING_NOTIFICATION_EMAIL is missing.");
    return { customer: false, aurocar: false, configured: false };
  }

  const table = `<table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:12px">${detailRows(booking)}</table>`;
  const customerHtml = emailShell(
    "Recibimos tu solicitud",
    `Hola ${booking.customer_name}. Tu solicitud quedó registrada y Aurocar revisará la disponibilidad antes de confirmarla. Conserva el código ${booking.booking_code}.`,
    `${table}<div style="margin-top:20px;border-radius:12px;background:#fff7ed;padding:16px;color:#9a3412;font-size:14px;line-height:1.5">El horario se mantendrá reservado durante 30 minutos mientras revisamos tu solicitud. La cita todavía no está confirmada.</div>`
  );
  const aurocarHtml = emailShell(
    "Nueva solicitud de reserva",
    `${booking.customer_name} acaba de solicitar una hora desde la agenda online.`,
    `${table}<div style="margin-top:20px;border-radius:12px;background:#f8fafc;padding:16px;color:#334155;font-size:14px;line-height:1.6"><strong>Contacto:</strong> ${escapeHtml(booking.phone)} · ${escapeHtml(booking.email)}<br><strong>Patente:</strong> ${escapeHtml(booking.license_plate)}<br><strong>Vehículo:</strong> ${escapeHtml(`${booking.vehicle_brand} ${booking.vehicle_model}`)}${booking.notes ? `<br><strong>Notas:</strong> ${escapeHtml(booking.notes)}` : ""}</div><p style="margin:20px 0 0"><a href="https://www.aurocarwash.cl/admin" style="display:inline-block;border-radius:10px;background:#0f172a;padding:12px 18px;color:#fff;text-decoration:none;font-weight:700">Revisar en el panel</a></p>`
  );

  const results = await Promise.allSettled([
    sendEmail(apiKey, from, {
      to: booking.email,
      subject: `Recibimos tu solicitud ${booking.booking_code} | Aurocar`,
      html: customerHtml,
      replyTo: aurocarEmail
    }),
    sendEmail(apiKey, from, {
      to: aurocarEmail,
      subject: `Nueva solicitud ${booking.booking_code}: ${booking.service_name}`,
      html: aurocarHtml,
      replyTo: booking.email
    })
  ]);

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`Booking email delivery failed (${index === 0 ? "customer" : "aurocar"})`, result.reason);
    }
  });

  return {
    customer: results[0].status === "fulfilled",
    aurocar: results[1].status === "fulfilled",
    configured: true
  };
}
