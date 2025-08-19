import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/clients/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		if (req.method === "GET") {
			const { storeId } = req.query;
			const products = await prisma.product.findMany({
				where: storeId ? { storeId: String(storeId) } : undefined,
				orderBy: { createdAt: "desc" },
			});
			return res.status(200).json(products);
		}

		if (req.method === "POST") {
			const { name, description, price, currency, storeId } = req.body ?? {};
			if (!name || !price || !storeId) return res.status(400).json({ error: "name, price e storeId são obrigatórios" });
			const product = await prisma.product.create({
				data: { name, description, price, currency: currency ?? "MZN", storeId },
			});
			return res.status(201).json(product);
		}

		return res.status(405).json({ error: "Método não suportado" });
	} catch (error: any) {
		return res.status(500).json({ error: error?.message ?? "Erro interno" });
	}
}

