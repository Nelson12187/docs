import React, { useEffect, useState } from "react";
import Head from "next/head";

type Store = {
  id: string; name: string; slug: string; ownerEmail: string; phone?: string | null; logoUrl?: string | null;
};

export default function StoresAdminPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", ownerEmail: "" });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch("/api/stores");
    const data = await res.json();
    setStores(data);
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/stores", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      setForm({ name: "", slug: "", ownerEmail: "" });
      await load();
    } finally { setLoading(false); }
  };

  return (
    <>
      <Head><title>Admin - Lojas</title></Head>
      <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>Lojas</h1>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
          <input placeholder="Nome" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input placeholder="Slug" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
          <input placeholder="Email do proprietário" value={form.ownerEmail} onChange={e => setForm(f => ({ ...f, ownerEmail: e.target.value }))} />
          <button disabled={loading} type="submit">{loading ? "Salvando..." : "Criar loja"}</button>
        </form>

        <ul style={{ marginTop: 24 }}>
          {stores.map(s => (
            <li key={s.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 8, marginBottom: 12 }}>
              <div style={{ fontWeight: 600 }}>{s.name}</div>
              <div style={{ color: "#666" }}>{s.slug} · {s.ownerEmail}</div>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}

