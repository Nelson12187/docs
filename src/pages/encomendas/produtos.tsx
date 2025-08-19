import { useEffect, useState } from "react";

type Store = { id: string; name: string };
type Product = { id: string; name: string; price: number; currency: string; storeId: string };

export default function ProdutosPage() {
	const [stores, setStores] = useState<Store[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [storeId, setStoreId] = useState("");
	const [name, setName] = useState("");
	const [price, setPrice] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetch("/api/stores").then(r=>r.json()).then(setStores);
	}, []);

	useEffect(() => {
		const url = storeId ? `/api/products?storeId=${storeId}` : "/api/products";
		fetch(url).then(r=>r.json()).then(setProducts);
	}, [storeId]);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		try {
			const res = await fetch("/api/products", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, price: Number(price), storeId }),
			});
			if (res.ok) {
				const created = await res.json();
				setProducts([created, ...products]);
				setName("");
				setPrice("");
			}
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="max-w-3xl mx-auto px-6 py-10">
			<h1 className="text-2xl font-semibold mb-4">Cadastro de Produtos</h1>
			<div className="mb-4">
				<select value={storeId} onChange={e=>setStoreId(e.target.value)} className="border p-2 w-full">
					<option value="">Selecione uma loja</option>
					{stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
				</select>
			</div>
			<form onSubmit={onSubmit} className="space-y-3 mb-8">
				<input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome do produto" className="border p-2 w-full" required />
				<input value={price} onChange={e=>setPrice(e.target.value)} placeholder="Preço (MZN)" className="border p-2 w-full" required />
				<button disabled={loading || !storeId} className="bg-blue-600 text-white px-4 py-2">{loading?"Salvando...":"Salvar"}</button>
			</form>
			<ul className="space-y-2">
				{products.map(p=> (
					<li key={p.id} className="border p-3 rounded flex justify-between">
						<div>{p.name}</div>
						<div className="font-mono">{p.currency} {p.price}</div>
					</li>
				))}
			</ul>
		</div>
	);
}

