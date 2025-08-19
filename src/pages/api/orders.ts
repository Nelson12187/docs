import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/clients/prisma";
import { v4 as uuid } from "uuid";

function generateTrackingCode() {
	return `TRK-${uuid().split("-")[0].toUpperCase()}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		if (req.method === "GET") {
			const { id } = req.query;
			if (id) {
				const order = await prisma.order.findUnique({
					where: { id: String(id) },
					include: { items: true, payment: true, shipment: true },
				});
				if (!order) return res.status(404).json({ error: "Pedido não encontrado" });
				return res.status(200).json(order);
			}
			const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
			return res.status(200).json(orders);
		}

		if (req.method === "POST") {
			const { customerId, items, currency } = req.body ?? {};
			if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "items é obrigatório" });
			const productIds = items.map((i: any) => String(i.productId));
			const dbProducts = await prisma.product.findMany({ where: { id: { in: productIds } } });
			if (dbProducts.length !== items.length) return res.status(400).json({ error: "Produto inválido" });
			const total = dbProducts.reduce((sum, p) => {
				const qty = Number(items.find((i: any) => i.productId === p.id)?.quantity ?? 1);
				return sum + qty * Number(p.price);
			}, 0);
			const trackingCode = generateTrackingCode();
			const order = await prisma.order.create({
				data: {
					customerId: customerId ?? null,
					totalAmount: total,
					currency: currency ?? "MZN",
					trackingCode,
					items: {
						create: items.map((i: any) => ({
							productId: i.productId,
							quantity: Number(i.quantity ?? 1),
							unitPrice: Number(dbProducts.find((p) => p.id === i.productId)?.price ?? 0),
						})),
					},
					payment: {
						create: {
							provider: "MPESA",
							amount: total,
							currency: currency ?? "MZN",
							status: "PENDING",
						},
					},
					shipment: {
						create: {
							status: "CREATED",
						},
					},
				},
				include: { items: true, payment: true, shipment: true },
			});
			return res.status(201).json(order);
		}

		return res.status(405).json({ error: "Método não suportado" });
	} catch (error: any) {
		return res.status(500).json({ error: error?.message ?? "Erro interno" });
	}
}

