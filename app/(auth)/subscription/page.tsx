import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSubscriptionState, isSubscriptionExempt } from "@/lib/subscription";
import SubscriptionCheckout from "./SubscriptionCheckout";

export default async function SubscriptionPage() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id) {
    redirect("/signin");
  }

  if (isSubscriptionExempt(user.role)) {
    redirect("/");
  }

  const subscription = await getSubscriptionState(user.id);

  if (subscription.isActive) {
    redirect("/");
  }

  return <SubscriptionCheckout />;
}
