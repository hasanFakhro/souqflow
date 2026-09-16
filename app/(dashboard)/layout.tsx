import Sidebar from "./sidebar";
import SubscriptionWarning from "../../components/SubscriptionWarning";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 md:flex">
      <Sidebar />

      <main className="min-w-0 flex-1 p-6 md:p-10">
        {children}
      </main>

      <SubscriptionWarning />
    </div>
  );
}