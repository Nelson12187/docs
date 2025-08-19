import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/clients/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "POST") return res.status(405).json({ error: "Método não suportado" });
	try {
		const owner = await prisma.user.upsert({
			where: { email: "owner@example.com" },
			update: {},
			create: { email: "owner@example.com", name: "Demo Owner" },
		});
		const store = await prisma.store.create({ data: { name: "Loja Demo", description: "Exemplos", ownerId: owner.id } });
		await prisma.product.createMany({
			data: [
				{ name: "Caixa Pequena", price: 100, currency: "MZN", storeId: store.id },
				{ name: "Caixa Média", price: 250, currency: "MZN", storeId: store.id },
				{ name: "Caixa Grande", price: 400, currency: "MZN", storeId: store.id },
			],
			skipDuplicates: true,
		});
		return res.status(200).json({ ok: true });
	} catch (error: any) {
		return res.status(500).json({ error: error?.message ?? "Erro interno" });
	}
}

