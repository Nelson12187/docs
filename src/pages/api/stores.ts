import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/clients/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		if (req.method === "GET") {
			const stores = await prisma.store.findMany({
				orderBy: { createdAt: "desc" },
			});
			return res.status(200).json(stores);
		}

		if (req.method === "POST") {
			const { name, description, ownerId } = req.body ?? {};
			if (!name || !ownerId) return res.status(400).json({ error: "name e ownerId são obrigatórios" });
			const store = await prisma.store.create({ data: { name, description, ownerId } });
			return res.status(201).json(store);
		}

		return res.status(405).json({ error: "Método não suportado" });
	} catch (error: any) {
		return res.status(500).json({ error: error?.message ?? "Erro interno" });
	}
}

