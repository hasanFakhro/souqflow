import { auth } from "@/lib/auth";

import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import CatalogShareLink from "@/components/CatalogShareLink";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

<<<<<<< HEAD
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
=======
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
      phone: true,
    },
  });
>>>>>>> 530fde41434bc7827392efb1361231f4f123420f

  if (!user) {
    redirect("/signin");
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const catalogUrl = `${protocol}://${host}/catalog/${user.id}`;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-4">
        <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
<<<<<<< HEAD
          Good to see you{" "}
          {user.name
            ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
            : ""}
=======
          Good to see you
>>>>>>> 530fde41434bc7827392efb1361231f4f123420f
        </h1>

        <span className="text-3xl">👋</span>
      </div>

<<<<<<< HEAD
      <ProfileForm user={user} business={business} />
=======
      <ProfileForm user={user} />
      <CatalogShareLink catalogUrl={catalogUrl} />
>>>>>>> 530fde41434bc7827392efb1361231f4f123420f
    </div>
  );
}