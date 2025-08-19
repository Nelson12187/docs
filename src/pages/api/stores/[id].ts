import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/clients/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const store = await prisma.store.findUnique({ where: { id } });
    if (!store) return res.status(404).json({ error: "Not found" });
    return res.status(200).json(store);
  }

  if (req.method === "PATCH") {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { name, ownerEmail, phone, logoUrl } = body ?? {};
    const updated = await prisma.store.update({
      where: { id },
      data: { name, ownerEmail, phone, logoUrl },
    });
    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    await prisma.store.delete({ where: { id } });
    return res.status(204).end();
  }

  res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
  return res.status(405).end("Method Not Allowed");
}

