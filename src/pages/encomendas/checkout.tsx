import { useEffect, useState } from "react";

type Product = { id: string; name: string; price: number; currency: string };

export default function CheckoutPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [cart, setCart] = useState<Record<string, number>>({});
	const [msisdn, setMsisdn] = useState("");
	const [provider, setProvider] = useState<"MPESA"|"EMOLA">("MPESA");
	const [orderId, setOrderId] = useState<string | null>(null);
	const [status, setStatus] = useState<string>("");

	useEffect(() => {
		fetch("/api/products").then(r=>r.json()).then(setProducts);
	}, []);

	const total = products.reduce((sum, p) => sum + (cart[p.id] ?? 0) * Number(p.price), 0);

	function toggleQty(productId: string, delta: number) {
		setCart(prev => ({ ...prev, [productId]: Math.max(0, (prev[productId] ?? 0) + delta) }));
	}

	async function createOrder() {
		const items = Object.entries(cart).filter(([,q]) => q>0).map(([productId, quantity]) => ({ productId, quantity }));
		if (items.length === 0) return;
		const res = await fetch("/api/orders", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ items })
		});
		if (res.ok) {
			const order = await res.json();
			setOrderId(order.id);
			setStatus(`Pedido criado. Código de rastreio: ${order.trackingCode}`);
		}
	}

	async function pay() {
		if (!orderId || !msisdn) return;
		const endpoint = provider === "MPESA" ? "/api/payments/mpesa" : "/api/payments/emola";
		const res = await fetch(endpoint, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ orderId, msisdn })
		});
		if (res.ok) setStatus("Pagamento concluído");
	}

	return (
		<div className="max-w-3xl mx-auto px-6 py-10">
			<h1 className="text-2xl font-semibold mb-4">Checkout</h1>
			<div className="space-y-3">
				{products.map(p => (
					<div key={p.id} className="border p-3 rounded flex justify-between items-center">
						<div>
							<div className="font-medium">{p.name}</div>
							<div className="text-sm text-gray-600">{p.currency} {p.price}</div>
						</div>
						<div className="flex items-center gap-2">
							<button className="px-2 py-1 border" onClick={()=>toggleQty(p.id,-1)}>-</button>
							<div className="w-8 text-center">{cart[p.id] ?? 0}</div>
							<button className="px-2 py-1 border" onClick={()=>toggleQty(p.id, 1)}>+</button>
						</div>
					</div>
				))}
			</div>
			<div className="mt-4 font-semibold">Total: MZN {total}</div>
			<div className="mt-4 flex gap-2">
				<button className="bg-green-600 text-white px-4 py-2" onClick={createOrder} disabled={total<=0}>Criar Pedido</button>
			</div>
			{orderId && (
				<div className="mt-6 space-y-3">
					<div className="font-medium">Pagamento</div>
					<input value={msisdn} onChange={e=>setMsisdn(e.target.value)} placeholder="Número (MSISDN)" className="border p-2 w-full" />
					<div className="flex gap-4 items-center">
						<label className="flex items-center gap-2"><input type="radio" checked={provider==="MPESA"} onChange={()=>setProvider("MPESA")} /> M-Pesa</label>
						<label className="flex items-center gap-2"><input type="radio" checked={provider==="EMOLA"} onChange={()=>setProvider("EMOLA")} /> e-Mola</label>
					</div>
					<button className="bg-blue-600 text-white px-4 py-2" onClick={pay} disabled={!msisdn}>Pagar</button>
				</div>
			)}
			{status && <div className="mt-4 text-sm text-green-700">{status}</div>}
		</div>
	);
}

