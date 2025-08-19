import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/clients/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: "Not found" });
    return res.status(200).json(product);
  }

  if (req.method === "PATCH") {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { name, description, priceCents, currency, active } = body ?? {};
    const updated = await prisma.product.update({
      where: { id },
      data: { name, description, priceCents, currency, active },
    });
    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    await prisma.product.delete({ where: { id } });
    return res.status(204).end();
  }

  res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
  return res.status(405).end("Method Not Allowed");
}

