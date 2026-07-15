import { Header } from "@/components/Header";
import { AdminBookingTable } from "@/components/AdminBookingTable";

export default function AdminPage() {
  return (
    <>
      <Header />
      <main>
        <AdminBookingTable />
      </main>
    </>
  );
}
