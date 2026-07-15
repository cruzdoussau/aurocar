export type BookingStatus = "pendiente" | "confirmada" | "rechazada" | "completada" | "cancelada";
export type PaymentStatus = "pendiente" | "pagado" | "no_solicitado";

export type Booking = {
  id: string;
  booking_code: string;
  customer_name: string;
  phone: string;
  email: string;
  vehicle_brand: string;
  vehicle_model: string;
  license_plate: string;
  vehicle_type: string;
  service_id: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  notes?: string | null;
  internal_notes?: string | null;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_link_sent: boolean;
  created_at: string;
  updated_at: string;
};
