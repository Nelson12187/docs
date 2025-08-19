import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/clients/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query as { code: string };
  const shipment = await prisma.shipment.findFirst({
    where: { trackingCode: code },
    include: { order: true, events: true },
  });
  if (!shipment) return res.status(404).json({ error: "Not found" });
  return res.status(200).json(shipment);
}

