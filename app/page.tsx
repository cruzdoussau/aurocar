import { About } from "@/components/About";
import { BookingForm } from "@/components/BookingForm";
import { BookingSteps } from "@/components/BookingSteps";
import { Contact } from "@/components/Contact";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { Gallery } from "@/components/Gallery";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PaymentSection } from "@/components/PaymentSection";
import { Services } from "@/components/Services";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <BookingSteps />
        <BookingForm />
        <PaymentSection />
        <About />
        <Gallery />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
