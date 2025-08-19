import { useEffect, useState } from "react";

type Store = {
	id: string;
	name: string;
	description?: string | null;
	createdAt: string;
};

export default function LojasPage() {
	const [stores, setStores] = useState<Store[]>([]);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [loading, setLoading] = useState(false);
	const ownerId = "demo-owner"; // substitua por autenticação real

	useEffect(() => {
		fetch("/api/stores").then(r => r.json()).then(setStores);
	}, []);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		try {
			const res = await fetch("/api/stores", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, description, ownerId }),
			});
			if (res.ok) {
				const created = await res.json();
				setStores([created, ...stores]);
				setName("");
				setDescription("");
			}
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="max-w-3xl mx-auto px-6 py-10">
			<h1 className="text-2xl font-semibold mb-4">Cadastro de Lojas</h1>
			<form onSubmit={onSubmit} className="space-y-3 mb-8">
				<input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome da loja" className="border p-2 w-full" required />
				<input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Descrição" className="border p-2 w-full" />
				<button disabled={loading} className="bg-blue-600 text-white px-4 py-2">{loading?"Salvando...":"Salvar"}</button>
			</form>
			<ul className="space-y-2">
				{stores.map(s=> (
					<li key={s.id} className="border p-3 rounded">
						<div className="font-medium">{s.name}</div>
						<div className="text-sm text-gray-600">{s.description}</div>
					</li>
				))}
			</ul>
		</div>
	);
}

