import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/clients/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const shipment = await prisma.shipment.findUnique({ where: { id }, include: { events: true } });
    if (!shipment) return res.status(404).json({ error: "Not found" });
    return res.status(200).json(shipment);
  }

  if (req.method === "PATCH") {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { status, carrier, trackingCode } = body ?? {};
    const updated = await prisma.shipment.update({ where: { id }, data: { status, carrier, trackingCode } });
    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    await prisma.shipment.delete({ where: { id } });
    return res.status(204).end();
  }

  res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
  return res.status(405).end("Method Not Allowed");
}

