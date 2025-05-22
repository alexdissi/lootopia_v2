import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function GET({ params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const invoiceId = params.id;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: "Aucun compte client Stripe trouvé" },
        { status: 404 },
      );
    }

    const invoice = await stripe.invoices.retrieve(invoiceId);

    if (invoice.customer !== user.stripeCustomerId) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à accéder à cette facture" },
        { status: 403 },
      );
    }

    if (invoice.invoice_pdf) {
      return NextResponse.redirect(invoice.invoice_pdf);
    } else {
      return NextResponse.json(
        { error: "Le PDF de cette facture n'est pas disponible" },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du PDF de la facture:",
      error,
    );
    return NextResponse.json(
      { error: "Une erreur s'est produite lors de la récupération du PDF" },
      { status: 500 },
    );
  }
}
