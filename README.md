# 🛍️ App de Controle de Encomendas Online

Aplicação full-stack em Next.js com Prisma e Postgres para cadastro de lojas, produtos, pedidos, pagamentos (M‑Pesa e e‑Mola) e rastreio de encomendas.

## Recursos
- Cadastro de lojas e produtos
- Criação de pedidos e carrinho de compras
- Checkout com M‑Pesa e e‑Mola (mock por padrão, integrações reais via env)
- Rastreio por código com eventos
- Endpoints REST (Next.js API Routes)

## Executar localmente
1. Copie `.env.example` para `.env` e configure `DATABASE_URL` (Postgres)
2. Instale dependências e gere o client do Prisma:
```bash
yarn
yarn generate
```
3. Rode as migrações:
```bash
yarn migrate:dev
```
4. Suba o servidor de dev:
```bash
yarn dev
```

Abra http://localhost:3001

## Rotas principais
- Admin lojas: `/admin/stores`
- Loja por slug: `/loja/[slug]`
- Rastreio: `/rastreio/[codigo]`

## API principal
- `POST /api/orders` cria pedido
- `POST /api/checkout` inicia pagamento M‑Pesa/e‑Mola
- `GET /api/tracking/[code]` consulta rastreio

Integrações M‑Pesa e e‑Mola retornam sucesso simulado se variáveis de ambiente não estiverem configuradas.
