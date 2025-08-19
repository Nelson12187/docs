import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/clients/prisma";
import { initiateMpesaPayment } from "@/clients/payments/mpesa";
import { initiateEmolaPayment } from "@/clients/payments/emola";
import { PaymentProvider, PaymentStatus } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { orderId, provider, phone } = body ?? {} as {
    orderId: string; provider: keyof typeof PaymentProvider; phone: string;
  };

  if (!orderId || !provider || !phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return res.status(404).json({ error: "Order not found" });

  let providerRef: string | undefined;
  let raw: unknown = undefined;
  if (provider === "MPESA") {
    const result = await initiateMpesaPayment({
      phone,
      amountCents: order.totalCents,
      currency: order.currency,
      reference: order.id,
    });
    if (!result.success) return res.status(402).json({ error: result.message ?? "Payment failed" });
    providerRef = result.providerRef;
    raw = result.raw;
  } else if (provider === "EMOLA") {
    const result = await initiateEmolaPayment({
      phone,
      amountCents: order.totalCents,
      currency: order.currency,
      reference: order.id,
    });
    if (!result.success) return res.status(402).json({ error: result.message ?? "Payment failed" });
    providerRef = result.providerRef;
    raw = result.raw;
  } else {
    return res.status(400).json({ error: "Unsupported provider" });
  }

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: provider as PaymentProvider,
      status: PaymentStatus.PAID,
      amountCents: order.totalCents,
      currency: order.currency,
      phone,
      providerRef: providerRef ?? null,
      rawResponse: raw as any,
    },
  });

  await prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } });

  return res.status(200).json({ paymentId: payment.id, providerRef });
}

