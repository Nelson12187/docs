import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function TrackingPage() {
  const router = useRouter();
  const { codigo } = router.query as { codigo?: string };
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!codigo) return;
    (async () => {
      const res = await fetch(`/api/tracking/${codigo}`);
      if (!res.ok) {
        setError("Código não encontrado");
        setData(null);
      } else {
        setError(null);
        setData(await res.json());
      }
    })();
  }, [codigo]);

  return (
    <>
      <Head><title>Rastreio</title></Head>
      <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>Rastreio</h1>
        <div style={{ marginTop: 8 }}>
          <input
            placeholder="Código de rastreio"
            defaultValue={codigo ?? ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = (e.target as HTMLInputElement).value.trim();
                if (value) router.push(`/rastreio/${value}`);
              }
            }}
          />
          <button style={{ marginLeft: 8 }} onClick={() => {
            const el = document.querySelector("input") as HTMLInputElement | null;
            const value = el?.value.trim();
            if (value) router.push(`/rastreio/${value}`);
          }}>Buscar</button>
        </div>

        {error && <p style={{ color: "#c00", marginTop: 12 }}>{error}</p>}
        {data && (
          <section style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 600 }}>Pedido: {data.order?.id ?? "-"}</div>
            <div>Código: {data.trackingCode ?? "-"}</div>
            <div>Status: {data.status}</div>
            <h2 style={{ marginTop: 12, fontWeight: 600 }}>Eventos</h2>
            <ul>
              {data.events?.map((ev: any) => (
                <li key={ev.id}>
                  {new Date(ev.occurredAt).toLocaleString()} — {ev.status} {ev.location ? `(${ev.location})` : ""} {ev.description ? `– ${ev.description}` : ""}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}

