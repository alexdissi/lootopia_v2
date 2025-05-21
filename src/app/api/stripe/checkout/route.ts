import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  const { priceId, currencyAmount } = await req.json();
  const session = await auth.api.getSession({ headers: await headers() });

  const userEmail = session?.user.email;
  if (!userEmail)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!currencyAmount || isNaN(Number(currencyAmount))) {
    return NextResponse.json(
      { error: "Invalid currency amount" },
      { status: 400 },
    );
  }

  let user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
    });

    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeCustomerId: customer.id,
      },
    });
  }

  const sessionStripe = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: user.stripeCustomerId ?? undefined,
    payment_method_types: ["card", "revolut_pay"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/payment?status=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/payment?status=cancel`,
    invoice_creation: {
      enabled: true,
    },
    metadata: {
      userId: user.id ?? "",
      email: user.email ?? undefined,
      currencyAmount: currencyAmount.toString(),
    },
  });

  return NextResponse.json({ url: sessionStripe.url });
}
