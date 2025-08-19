import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/clients/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, payments: true, shipment: { include: { events: true } }, shippingAddress: { include: { address: true } } },
    });
    if (!order) return res.status(404).json({ error: "Not found" });
    return res.status(200).json(order);
  }

  if (req.method === "PATCH") {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { status } = body ?? {};
    const updated = await prisma.order.update({ where: { id }, data: { status } });
    return res.status(200).json(updated);
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).end("Method Not Allowed");
}

