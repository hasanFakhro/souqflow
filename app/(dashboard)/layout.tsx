import Sidebar from "./sidebar";
import SubscriptionWarning from "../../components/SubscriptionWarning";
import { auth } from "@/lib/auth";
import { BusinessProvider } from "@/context/BusinessContext";
import prisma from "@/lib/prisma";
import NotificationBell from "@/components/NotificationBell";

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
    },
  });

  return (
    <BusinessProvider initialBusinessName={business?.name ?? "SouqFlow"}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 md:flex">
        <Sidebar />

        <main className="min-w-0 flex-1 p-6 md:p-10">
          <SubscriptionWarning />
          <div className="mb-6 flex justify-end">
            <NotificationBell />
          </div>
          {children}
        </main>
      </div>
    </BusinessProvider>
  );
}
