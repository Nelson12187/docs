import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

type Product = { id: string; name: string; priceCents: number; currency: string };
type Store = { id: string; name: string; slug: string };

export default function StoreFrontPage() {
  const router = useRouter();
  const { slug } = router.query as { slug?: string };
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<string, { product: Product; quantity: number }>>({});

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const storesRes = await fetch(`/api/stores`);
      const stores: Store[] = await storesRes.json();
      const s = stores.find(x => x.slug === slug) ?? null;
      setStore(s);
      if (s) {
        const prodRes = await fetch(`/api/products?storeId=${s.id}`);
        setProducts(await prodRes.json());
      }
    })();
  }, [slug]);

  const totalCents = useMemo(() => Object.values(cart).reduce((acc, it) => acc + it.product.priceCents * it.quantity, 0), [cart]);

  const checkout = async () => {
    if (!store) return;
    const items = Object.values(cart).map(({ product, quantity }) => ({ productId: product.id, quantity, unitPriceCents: product.priceCents }));
    if (items.length === 0) return;

    const orderRes = await fetch(`/api/orders`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ storeId: store.id, currency: products[0]?.currency ?? "MZN", items }) });
    const order = await orderRes.json();

    const phone = prompt("Telefone (M-Pesa/e-Mola): ") || "";
    const provider = (prompt("Provedor (MPESA ou EMOLA): ") || "MPESA").toUpperCase();
    const payRes = await fetch(`/api/checkout`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ orderId: order.id, provider, phone }) });
    const result = await payRes.json();
    alert(`Pagamento iniciado. Ref: ${result.providerRef || "-"}`);
    setCart({});
  };

  return (
    <>
      <Head><title>{store ? store.name : "Loja"}</title></Head>
      <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>{store?.name ?? "Carregando..."}</h1>
        <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginTop: 16 }}>
          {products.map(p => (
            <li key={p.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ margin: "8px 0" }}>{(p.priceCents / 100).toLocaleString(undefined, { style: "currency", currency: p.currency })}</div>
              <button onClick={() => setCart(c => ({ ...c, [p.id]: { product: p, quantity: (c[p.id]?.quantity ?? 0) + 1 } }))}>Adicionar</button>
            </li>
          ))}
        </ul>

        <section style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Carrinho</h2>
          <ul>
            {Object.values(cart).map(({ product, quantity }) => (
              <li key={product.id}>
                {product.name} × {quantity} — {(product.priceCents * quantity / 100).toLocaleString(undefined, { style: "currency", currency: product.currency })}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 8, fontWeight: 600 }}>Total: {(totalCents / 100).toLocaleString(undefined, { style: "currency", currency: products[0]?.currency ?? "MZN" })}</div>
          <button disabled={totalCents === 0} onClick={checkout} style={{ marginTop: 12 }}>Finalizar</button>
        </section>
      </main>
    </>
  );
}

