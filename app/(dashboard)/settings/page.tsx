import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";

import { redirect } from "next/navigation";

import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const userId = session.user.id;

  const [user, business] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        image: true,
        email: true,
        phone: true,
      },
    }),

    prisma.business.findUnique({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            phone: true,
          },
        },
      },
    }),
  ]);

  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-4">
        <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
          Good to see you{" "}
          {user.name
            ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
            : ""}
        </h1>

        <span className="text-3xl">👋</span>
      </div>

      <ProfileForm user={user} business={business} />
    </div>
  );
}