import { useState } from "react";

export default function RastreioPage() {
	const [code, setCode] = useState("");
	const [info, setInfo] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);

	async function buscar() {
		setError(null);
		setInfo(null);
		const res = await fetch(`/api/tracking/${encodeURIComponent(code)}`);
		if (res.ok) setInfo(await res.json()); else setError("Código não encontrado");
	}

	return (
		<div className="max-w-md mx-auto px-6 py-10">
			<h1 className="text-2xl font-semibold mb-4">Rastreio de Encomenda</h1>
			<input value={code} onChange={e=>setCode(e.target.value)} placeholder="Código de rastreio" className="border p-2 w-full" />
			<button onClick={buscar} className="mt-3 bg-blue-600 text-white px-4 py-2" disabled={!code}>Buscar</button>
			{error && <div className="mt-4 text-red-700 text-sm">{error}</div>}
			{info && (
				<div className="mt-4 border p-3 rounded">
					<div className="font-medium">{info.trackingCode}</div>
					<div className="text-sm">Status: {info.status}</div>
					{info.currentCity && <div className="text-sm">Cidade atual: {info.currentCity}</div>}
					{info.notes && <div className="text-sm">Notas: {info.notes}</div>}
					<div className="text-xs text-gray-500">Atualizado em: {new Date(info.updatedAt).toLocaleString()}</div>
				</div>
			)}
		</div>
	);
}

