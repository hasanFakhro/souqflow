import Sidebar from "./sidebar";
import SubscriptionWarning from "../../components/SubscriptionWarning";
import { auth } from "@/lib/auth";
import { BusinessProvider } from "@/context/BusinessContext";
import prisma from "@/lib/prisma";
import NotificationBell from "@/components/NotificationBell";
import OrderCustomerNotification from "@/components/OrderCustomerNotification";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const business = await prisma.business.findUnique({
    where: {
      userId,
    },
    select: {
      name: true,
      logo: true,
    },
  });

  return (
    <BusinessProvider initialBusinessName={business?.name ?? "SouqFlow"} initialBusinessLogo={business?.logo ?? null}>
      <div className="dashboard-shell min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 md:flex">
        <Sidebar />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
          <SubscriptionWarning />
          <div className="mb-4 flex items-center justify-end gap-3 sm:mb-6">
            <NotificationBell />
            <OrderCustomerNotification />
          </div>
          {children}
        </main>
      </div>
    </BusinessProvider>
  );
}
