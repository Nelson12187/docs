import Link from "next/link";

export default function EncomendasHome() {
	return (
		<div className="max-w-3xl mx-auto px-6 py-10">
			<h1 className="text-3xl font-semibold mb-6">Gestão de Encomendas</h1>
			<ul className="space-y-3">
				<li><Link className="text-blue-600" href="/encomendas/lojas">Cadastro de Lojas</Link></li>
				<li><Link className="text-blue-600" href="/encomendas/produtos">Cadastro de Produtos</Link></li>
				<li><Link className="text-blue-600" href="/encomendas/checkout">Checkout (M-Pesa / e-Mola)</Link></li>
				<li><Link className="text-blue-600" href="/encomendas/rastreio">Rastreio</Link></li>
			</ul>
		</div>
	);
}

