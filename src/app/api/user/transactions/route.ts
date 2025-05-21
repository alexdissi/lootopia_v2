import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer le filtre depuis les paramètres de la requête
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("filter");

    // Construire la requête en fonction du filtre
    const whereClause: any = {
      userId: session.user.id,
    };

    // Ajouter le filtre de type de transaction s'il est spécifié et différent de "ALL"
    if (filter && filter !== "ALL") {
      whereClause.transactionType = filter;
    }

    // Récupérer les transactions
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

    // Récupérer l'utilisateur pour son ID Stripe
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    // Si l'utilisateur a un ID Stripe, récupérer ses factures
    let invoiceMap = new Map();
    if (user?.stripeCustomerId) {
      try {
        const invoices = await stripe.invoices.list({
          customer: user.stripeCustomerId,
          limit: 100,
        });

        // Créer une carte des factures par date de création pour faciliter la correspondance
        invoices.data.forEach((invoice) => {
          invoiceMap.set(
            new Date(invoice.created * 1000).toISOString().split("T")[0],
            invoice.id,
          );
        });
      } catch (stripeError) {
        console.error(
          "Erreur lors de la récupération des factures Stripe:",
          stripeError,
        );
      }
    }

    // Enrichir les transactions avec les IDs de facture si possible
    const enrichedTransactions = transactions.map((transaction) => {
      let invoiceId = undefined;

      // Si c'est un achat, essayer de faire correspondre par date
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
