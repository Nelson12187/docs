import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/clients/prisma";

// Mock de integração com e-Mola: atualiza pagamento como AUTHORIZED e depois SETTLED
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		if (req.method !== "POST") return res.status(405).json({ error: "Método não suportado" });
		const { orderId, msisdn } = req.body ?? {};
		if (!orderId || !msisdn) return res.status(400).json({ error: "orderId e msisdn são obrigatórios" });
		const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true } });
		if (!order) return res.status(404).json({ error: "Pedido não encontrado" });
		await prisma.payment.update({
			where: { orderId },
			data: { provider: "EMOLA", providerRef: `MSISDN:${msisdn}`, status: "AUTHORIZED" },
		});
		// Simula liquidação imediata
		await prisma.payment.update({ where: { orderId }, data: { status: "SETTLED" } });
		await prisma.order.update({ where: { id: orderId }, data: { status: "PAID" } });
		return res.status(200).json({ ok: true });
	} catch (error: any) {
		return res.status(500).json({ error: error?.message ?? "Erro interno" });
	}
}

