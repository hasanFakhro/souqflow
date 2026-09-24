import Sidebar from "./sidebar";
import SubscriptionWarning from "../../components/SubscriptionWarning";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
      userId: userId,
    },
    select: {
      name: true,
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 md:flex">
      <Sidebar businessName={business?.name} />

      <main className="min-w-0 flex-1 p-6 md:p-10">
        <SubscriptionWarning />
        {children}
      </main>
    </div>
  );
}