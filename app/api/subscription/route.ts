import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  activateSubscriptionForUser,
  getSubscriptionState,
  isSubscriptionExempt,
  type SubscriptionPlan,
} from "@/lib/subscription";

function isSubscriptionPlan(value: unknown): value is SubscriptionPlan {
  return value === "monthly" || value === "yearly";
}

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

export async function POST(request: Request) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isSubscriptionExempt(user.role)) {
    return NextResponse.json({ isActive: true, expiresAt: null });
  }

  let body: unknown = {};

  try {
    body = await request.json();
  } catch {
    // A checkout must send its selected plan; never silently downgrade to monthly.
  }

  const requestedPlan =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as { plan?: unknown }).plan ?? null
      : null;

  if (!isSubscriptionPlan(requestedPlan)) {
    return NextResponse.json(
      { error: "Choose either the monthly or yearly subscription plan before confirming payment." },
      { status: 400 },
    );
  }

  const plan: SubscriptionPlan = requestedPlan;

  try {
    const subscription = await activateSubscriptionForUser(user.id, plan);

    if (!subscription) {
      return NextResponse.json({ error: "Account could not be activated." }, { status: 404 });
    }

    return NextResponse.json({
      isActive: true,
      plan,
      expiresAt: subscription.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Unable to complete temporary subscription activation", error);
    return NextResponse.json(
      { error: "Unable to activate your subscription. Please try again." },
      { status: 500 },
    );
  }
}
