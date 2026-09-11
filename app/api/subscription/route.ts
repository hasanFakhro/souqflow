import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  activateSubscriptionForUser,
  getSubscriptionState,
  isSubscriptionExempt,
} from "@/lib/subscription";

export async function GET() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isSubscriptionExempt(user.role)) {
    return NextResponse.json({ isActive: true, expiresAt: null });
  }

  const subscription = await getSubscriptionState(user.id);

  return NextResponse.json({
    isActive: subscription.isActive,
    expiresAt: subscription.expiresAt?.toISOString() ?? null,
  });
}

// Temporary mock confirmation. Replace this with verified Wish Money payment
// data before enabling real billing.
export async function POST() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isSubscriptionExempt(user.role)) {
    return NextResponse.json({ isActive: true, expiresAt: null });
  }

  try {
    const subscription = await activateSubscriptionForUser(user.id);

    if (!subscription) {
      return NextResponse.json({ error: "Account could not be activated." }, { status: 404 });
    }

    return NextResponse.json({
      isActive: true,
      expiresAt: subscription.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Unable to complete temporary subscription activation", error);
    return NextResponse.json(
      { error: "Unable to activate your subscription. Please try again." },
      { status: 500 }
    );
  }
}
