import { BookingForm } from "@/components/BookingForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PaymentSection } from "@/components/PaymentSection";

export default function AgendarPage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <BookingForm />
        <PaymentSection />
      </main>
      <Footer />
    </>
  );
}
