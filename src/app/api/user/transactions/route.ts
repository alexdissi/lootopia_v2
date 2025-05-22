import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("filter");
    const whereClause: any = {
      userId: session.user.id,
    };

    if (filter && filter !== "ALL") {
      whereClause.transactionType = filter;
    }

    const transactions = await prisma.transactionHistory.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        amount: true,
        transactionType: true,
        description: true,
        createdAt: true,
      },
      take: 50,
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    const invoiceMap = new Map();
    if (user?.stripeCustomerId) {
      try {
        const invoices = await stripe.invoices.list({
          customer: user.stripeCustomerId,
          limit: 100,
        });

        invoices.data.forEach((invoice) => {
          invoiceMap.set(
            new Date(invoice.created * 1000).toISOString().split("T")[0],
            invoice.id,
          );
        });
      } catch (stripeError) {
        return NextResponse.json(
          {
            error: stripeError instanceof Error,
          },
          { status: 500 },
        );
      }
    }

    const enrichedTransactions = transactions.map((transaction) => {
      let invoiceId = undefined;

      if (transaction.transactionType === "BOUGHT") {
        const transactionDate = new Date(transaction.createdAt)
          .toISOString()
          .split("T")[0];
        if (invoiceMap.has(transactionDate)) {
          invoiceId = invoiceMap.get(transactionDate);
        }
      }

      return {
        id: transaction.id,
        amount: transaction.amount,
        transactionType: transaction.transactionType,
        description: transaction.description,
        createdAt: transaction.createdAt,
        invoiceId: invoiceId,
      };
    });

    return NextResponse.json(enrichedTransactions);
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions:", error);
    return NextResponse.json(
      {
        error:
          "Une erreur s'est produite lors de la récupération des transactions",
      },
      { status: 500 },
    );
  }
}
