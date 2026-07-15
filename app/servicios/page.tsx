import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Services } from "@/components/Services";

export default function ServiciosPage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <Services />
      </main>
      <Footer />
    </>
  );
}
