import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/clients/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const stores = await prisma.store.findMany({ orderBy: { createdAt: "desc" } });
    return res.status(200).json(stores);
  }

  if (req.method === "POST") {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { name, slug, ownerEmail, phone, logoUrl } = body ?? {};
    if (!name || !slug || !ownerEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const store = await prisma.store.create({
      data: { name, slug, ownerEmail, phone: phone ?? null, logoUrl: logoUrl ?? null },
    });
    return res.status(201).json(store);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}

