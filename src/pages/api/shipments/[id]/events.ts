import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/clients/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  if (req.method === "POST") {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { status, description, location, occurredAt } = body ?? {};
    if (!status) return res.status(400).json({ error: "status required" });
    const event = await prisma.trackingEvent.create({
      data: {
        shipmentId: id,
        status,
        description: description ?? null,
        location: location ?? null,
        occurredAt: occurredAt ? new Date(occurredAt) : undefined,
      },
    });
    return res.status(201).json(event);
  }

  if (req.method === "GET") {
    const events = await prisma.trackingEvent.findMany({ where: { shipmentId: id }, orderBy: { occurredAt: "desc" } });
    return res.status(200).json(events);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}

