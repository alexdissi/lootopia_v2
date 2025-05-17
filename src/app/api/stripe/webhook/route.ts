import type { Stripe } from "stripe";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await (await req.blob()).text(),
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    if (err! instanceof Error) console.log(err);
    console.log(`❌ Error message: ${errorMessage}`);
    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 },
    );
  }

  const permittedEvents: string[] = [
    "checkout.session.completed",
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
  ];

  if (permittedEvents.includes(event.type)) {
    let data;

    try {
      switch (event.type) {
        case "checkout.session.completed":
          data = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutSessionCompleted(data);
          break;
        case "payment_intent.payment_failed":
          data = event.data.object as Stripe.PaymentIntent;
          break;
        case "payment_intent.succeeded":
          data = event.data.object as Stripe.PaymentIntent;
          await handlePaymentIntentSucceeded(data);
          break;
        default:
          throw new Error(`Unhandled event: ${event.type}`);
      }
    } catch (error) {
      console.error("Error processing webhook:", error);
      return NextResponse.json(
        { message: "Webhook handler failed" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ message: "Received" }, { status: 200 });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (!session.customer || !session.metadata?.userId || !session.metadata?.currencyAmount) {
    console.error("Missing required metadata in checkout session");
    return;
  }

  const userId = session.metadata.userId;
  const currencyAmount = parseInt(session.metadata.currencyAmount, 10);
  
  if (isNaN(currencyAmount)) {
    console.error("Invalid currency amount:", session.metadata.currencyAmount);
    return;
  }

  try {
    let virtualCurrency = await prisma.virtualCurrency.findFirst({
      where: { userId }
    });
    
    if (!virtualCurrency) {
      virtualCurrency = await prisma.virtualCurrency.create({
        data: {
          userId,
          amount: currencyAmount
        }
      });
    } else {
      virtualCurrency = await prisma.virtualCurrency.update({
        where: { id: virtualCurrency.id },
        data: { amount: virtualCurrency.amount + currencyAmount }
      });
    }

    await prisma.transactionHistory.create({
      data: {
        userId,
        virtualCurrencyId: virtualCurrency.id,
        amount: currencyAmount,
        transactionType: "BOUGHT",
        stripeSessionId: session.id,
        description: `Purchased ${currencyAmount} currency units`
      }
    });
  } catch (error) {
    console.error("Failed to update virtual currency:", error);
    throw error;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  if (!paymentIntent.metadata?.userId || !paymentIntent.metadata?.currencyAmount) {
    return;
  }

  const userId = paymentIntent.metadata.userId;
  const currencyAmount = parseInt(paymentIntent.metadata.currencyAmount, 10);
  
  if (isNaN(currencyAmount)) {
    console.error("Invalid currency amount:", paymentIntent.metadata.currencyAmount);
    return;
  }

  try {
    let virtualCurrency = await prisma.virtualCurrency.findFirst({
      where: { userId }
    });
    
    if (!virtualCurrency) {
      virtualCurrency = await prisma.virtualCurrency.create({
        data: {
          userId,
          amount: currencyAmount
        }
      });
    } else {
      virtualCurrency = await prisma.virtualCurrency.update({
        where: { id: virtualCurrency.id },
        data: { amount: virtualCurrency.amount + currencyAmount }
      });
    }

    await prisma.transactionHistory.create({
      data: {
        userId,
        virtualCurrencyId: virtualCurrency.id,
        amount: currencyAmount,
        transactionType: "BOUGHT",
        description: `Purchased ${currencyAmount} currency units via PaymentIntent`
      }
    });
  } catch (error) {
    console.error("Failed to update virtual currency:", error);
    throw error;
  }
}