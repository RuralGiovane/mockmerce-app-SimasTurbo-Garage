# Comece aqui 👋 — Semana 3 (Checkout e Pedidos)

Este é o app do seu grupo com tudo das Semanas 1–2 (produtos, carrinho otimista) **+
login/cadastro + guarda de rotas** já prontos (pelo backend). Roda no **Expo Go**.

Hoje o carrinho tem um botão **"Finalizar compra"** que ainda não faz nada. Sua missão
nesta semana é **fechar a compra de verdade**: `checkout → pagamento → pedido → histórico`,
usando as rotas de pedido que o backend já tem.

## 0. Rode como está (5 min)

```bash
npm install
cp .env.example .env      # API Key e RM do grupo (URL já é a nuvem)
npm start                 # Expo Go → abre no Login; crie conta / entre
```

## 1. A base que já veio pronta (leia antes de codar, ~10 min)

Você **não precisa** mexer nisso, mas entenda como funciona — cai na prova mental:
- `src/session/session.tsx` — guarda o login (`signIn`/`signUp` no backend, `isLoggedIn`).
- `src/screens/SignInScreen.tsx` / `SignUpScreen.tsx` — as telas de auth.
- `App.tsx` — a **guarda de rotas**: sem login → `AuthStack`; com login → `AppStack`.

## 2. O que VOCÊ vai construir (mapa → exercícios)

| Arquivo (criar/editar) | O quê | Exercício |
|---|---|---|
| `src/services/orders.ts` | chamadas: checkout, list, get, pay, cancel, timeline | §1 |
| `src/lib/queryKeys.ts` + `src/lib/orders.ts` | keys de pedido + `statusLabel/statusColor` | §1 |
| `src/hooks/useOrders.ts` | `useOrders` / `useOrder` / `useOrderTimeline` (queries) | §2 |
| `src/hooks/useOrderActions.ts` | `useCheckout` / `usePayOrder` / `useCancelOrder` (mutations) | §2 |
| `src/screens/CheckoutScreen.tsx` | revisão + criar pedido | §2 |
| `src/screens/OrderScreen.tsx` | status + pagamento simulado + linha do tempo | §3 |
| `src/screens/OrdersScreen.tsx` | histórico | §3 |
| `src/navigation.ts` + `App.tsx` | registrar Checkout/Order/Orders | §3 |
| `CartScreen` + `ProductsScreen` | "Finalizar" → Checkout; botão "Pedidos" | §3 |

## Regras de ouro

- **A unidade é a VARIANTE** (o carrinho já usa `variantId`); o pedido nasce do carrinho.
- **Pagar não é otimista.** Diferente do carrinho: em pagamento, espere a resposta do
  servidor e reconcilie o cache. Otimismo é pra micro-interação, não pra dinheiro.
- Trate **todos os estados**: carrinho vazio, pagamento **recusado**, loading, erro, sucesso.

Travou? Compare com `../app-professor-completo/` — mas tente antes.