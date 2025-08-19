import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/clients/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { orderId, trackingCode } = req.query as { orderId?: string; trackingCode?: string };
    const shipments = await prisma.shipment.findMany({
      where: {
        OR: [
          orderId ? { orderId } : undefined,
          trackingCode ? { trackingCode } : undefined,
        ].filter(Boolean) as any,
      },
      include: { events: true },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(shipments);
  }

  if (req.method === "POST") {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { orderId, carrier, trackingCode } = body ?? {};
    if (!orderId) return res.status(400).json({ error: "orderId required" });
    const created = await prisma.shipment.create({
      data: { orderId, carrier: carrier ?? null, trackingCode: trackingCode ?? null },
    });
    return res.status(201).json(created);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}

