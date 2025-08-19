import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/clients/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { storeId } = req.query as { storeId?: string };
    const orders = await prisma.order.findMany({
      where: storeId ? { storeId } : undefined,
      include: { items: true, payments: true, shipment: true },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(orders);
  }

  if (req.method === "POST") {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { storeId, customer, items, shippingAddress, currency, shippingCents } = body ?? {};
    if (!storeId || !items || !Array.isArray(items) || items.length === 0 || !currency) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const subtotalCents = items.reduce((acc: number, it: any) => acc + (it.unitPriceCents * it.quantity), 0);
    const totalCents = subtotalCents + (shippingCents ?? 0);

    const created = await prisma.order.create({
      data: {
        store: { connect: { id: storeId } },
        currency,
        subtotalCents,
        shippingCents: shippingCents ?? 0,
        totalCents,
        customer: customer ? {
          connectOrCreate: {
            where: { email: customer.email ?? `anon_${Date.now()}@example.com` },
            create: { name: customer.name ?? null, email: customer.email ?? null, phone: customer.phone ?? null },
          }
        } : undefined,
        items: {
          create: items.map((it: any) => ({
            productId: it.productId,
            quantity: it.quantity,
            unitPriceCents: it.unitPriceCents,
            totalCents: it.unitPriceCents * it.quantity,
          }))
        },
      },
      include: { items: true },
    });

    if (shippingAddress) {
      const address = await prisma.address.create({ data: shippingAddress });
      await prisma.addressOnOrderShipping.create({ data: { orderId: created.id, addressId: address.id } });
    }

    return res.status(201).json(created);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}

