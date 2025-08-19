import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/clients/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { storeId } = req.query as { storeId?: string };
    const products = await prisma.product.findMany({
      where: storeId ? { storeId } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(products);
  }

  if (req.method === "POST") {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { storeId, name, sku, description, priceCents, currency, active } = body ?? {};
    if (!storeId || !name || !sku || !priceCents || !currency) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const product = await prisma.product.create({
      data: { storeId, name, sku, description, priceCents, currency, active: active ?? true },
    });
    return res.status(201).json(product);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}

