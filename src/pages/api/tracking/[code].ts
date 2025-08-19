import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/clients/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		const { code } = req.query;
		if (!code || typeof code !== "string") return res.status(400).json({ error: "Código inválido" });
		const order = await prisma.order.findFirst({
			where: { trackingCode: code },
			include: { shipment: true, items: true },
		});
		if (!order) return res.status(404).json({ error: "Código não encontrado" });
		return res.status(200).json({
			trackingCode: order.trackingCode,
			status: order.shipment?.status ?? "CREATED",
			currentCity: order.shipment?.currentCity ?? null,
			notes: order.shipment?.notes ?? null,
			updatedAt: order.shipment?.updatedAt ?? order.updatedAt,
		});
	} catch (error: any) {
		return res.status(500).json({ error: error?.message ?? "Erro interno" });
	}
}

