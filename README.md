# Simas Turbo Garage

## 1. Identificação
* **Nome do Aplicativo:** Simas Turbo Garage
* **Integrantes do Grupo:**
  * André Emygdio Ferreira - RM565592
  * Gabriel Lourenço Martins - RM562194
  * Giovane Amato dos Santos - RM561336
  * Matheus Roque Arantes - RM561959
  * Orlando Gonçalves de Arruda - RM561584

---

## 2. Mapa de Autoria

| Integrante | Responsabilidade Principal | Arquivos Principais |
| :--- | :--- | :--- |
| André Emygdio | Services de Favoritos, Tipos e Persistência de Sessão | `src/types/api.ts`, `src/lib/queryKeys.ts`, `src/services/favorites.ts`, `src/services/storage.ts`, `src/session/session.tsx` |
| Gabriel Lourenço | Autenticação, Login e SecureStore | `src/screens/LoginScreen.tsx`, `src/contexts/AuthContext.tsx` |
| Giovane Amato | Fluxo de Autenticação (SignIn, SignUp, ForgotPassword), Setup do SecureStore e Customização de Layout e cores| `src/screens/SignInScreen.tsx`, `src/screens/SignUpScreen.tsx`, `src/screens/ForgotPasswordScreen.tsx`, `package.json`, `src/screens` |
| Matheus Roque | Hook e Tela de Favoritos, Navegação e Detalhes do Produto | `src/hooks/useFavorites.ts`, `src/screens/FavoritesScreen.tsx`, `src/navigation.ts`, `App.tsx`, `src/screens/ProductsScreen.tsx`, `src/screens/ProductDetailScreen.tsx`, `src/hooks/useCartMutations.ts` |
| Orlando Gonçalves | Persistência Segura (SecureStore), Validação com /auth/me e Interceptor 401 | `src/services/storage.ts`, `src/session/session.tsx`, `src/services/auth.ts`, `src/services/http.ts`, `App.tsx` |

---

## 3. Como Rodar

### Pré-requisitos
* Node.js (versão 18+ ou LTS)
* Expo CLI
* Aplicativo Expo Go ou Emulador/Dispositivo físico configurado

### Passo a Passo
1. Clone o repositório:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd mockmerce-app-SimasTurbo-Garage
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   npx expo install
   ```

3. Configure as variáveis de ambiente:
   * Duplique o arquivo `.env.example` para `.env`:
     ```bash
     cp .env.example .env
     ```
   * Preencha as chaves no `.env`:
     ```env
     EXPO_PUBLIC_API_URL=https://api.mockmerce.com.br/v1
     EXPO_PUBLIC_API_KEY=sua_api_key_aqui
     EXPO_PUBLIC_STUDENT_RM=seu_rm_aqui
     ```

4. Inicie o aplicativo:
   ```bash
   npx expo start
   ```
---

## 4. Acesso à Loja
* **API Key da Loja:** ``sk_live_3563e773b1bd86200fae38daf912f9f8d1453a3c812a960c``

*(Utilizada pelo corretor para testar a loja isolada no backend da turma).*

---

## 5. Credenciais de Teste

* **E-mail:** `jailsonmendes@garage.com`
* **Senha:** `SucoDeLaranja`

---

## 6. Decisões Técnicas


1. **Persistência segura e validação de sessão na inicialização**
   * **Por quê:** O token JWT é armazenado no `expo-secure-store` (armazenamento criptografado do sistema). Ao abrir o aplicativo, a sessão é validada contra o backend via `GET /v1/auth/me`, restaurando o comprador automaticamente ou devolvendo-o ao login caso o token esteja adulterado ou expirado.
   * **Commit:** `6d7dace`

2. **Logout reativo automático no Interceptor de Response para status 401**
   * **Por quê:** Em vez de tratar erros de autorização de forma dispersa em cada tela, centralizamos no interceptor do Axios um listener reativo que aciona o `signOut()` e limpa o cache imediatamente sempre que uma rota de comprador retornar 401.
   * **Commit:** `d40dbe4`

3. **Resgate offline de favoritos integrado diretamente no `queryFn` do TanStack Query**
   * **Por quê:** Para não utilizar o `useEffect` para busca de dados, a persistência e o resgate em modo avião foram embutidos na função `queryFn` do `useQuery`. Em caso de falha de conexão, os dados salvos localmente são retornados com a flag `isOffline` ativada para exibir o aviso na UI.
   * **Commit:** `9c9b849`

4. **Isolamento de cache de favoritos por comprador com limpeza no logout**
   * **Por quê:** Os dados locais de favoritos são indexados pelo ID do comprador (`favorites_cache_${customerId}`). No momento do `signOut()`, o cache do cliente é removido do SecureStore e o `queryClient.clear()` é executado, impedindo que um novo login herde favoritos de outro usuário.
   * **Commit:** `7de61cd`

5. **Mutações de carrinho e compra orientadas a confirmação do servidor sem atualização otimista**
   * **Por quê:** Conforme a diretriz do CP4 (pág. 5 do PDF), estoque e valores monetários não devem ser previstos na UI. Todas as mutações de carrinho aguardam a resposta do backend antes de atualizar a interface, evitando divergências em cenários de estoque esgotado (422).
   * **Commit:** `0aaf1ee`

---

## 7. Decisões de Produto
* **Proposta da Loja:** Simas Turbo Garage — Loja especializada em peças de alta performance, autopeças e acessórios automotivos.
* **Público-alvo:** Entusiastas de carros, mecânicos e preparadores automotivos.
* **Escolhas de Interface & Telas:** Layout temático, cards com destaque visual para especificações técnicas da peça e alertas rápidos de estoque.

---

## 8. Declaração de Uso de IA

* **Ferramentas Utilizadas:** Antigravity (modelo: Gemini 3.7 flash - medium)
* **Onde foi utilizada:**Estruturação inicial do README, geração de layout & animações e correções de sintaxes e lógica
* **O que foi alterado manualmente após a geração:**Cores, nomes das variáveis para algo mais coerente, comentários para uma explicação mais clara).

---

## 9. Diário de Erro

### Giovane Amato - Bug 1: [Data/Hora: 27/08 às 13:50]
1. **O que apareceu:** Erro de build e tela vermelha no Metro: `Incompatible React versions: The "react" (19.2.3) and "react-native-renderer" (19.1.0) packages must have the exact same version`.
2. **Como investigou:** Olhei o log do terminal e conferi as versões declaradas em `package.json` e travadas no `package-lock.json`.
3. **Qual era a causa:** O npm atualizou o `react` para a versão `19.2.3`, gerando conflito com a versão `19.1.0` suportada pelo renderer do React Native no Expo SDK 54.
4. **O que mudou para resolver:** Fixei a versão exata do `react` para `19.1.0` e do `@types/react` para `~19.1.10` no `package.json` e reinstalei as dependências (`commit 685323c`).

### Giovane Amato - Bug 2: [Data/Hora: 27/08 às 14:30]
1. **O que apareceu:** Erro de inicialização do bundler do Expo: `Error: Cannot find module 'babel-preset-expo'`.
2. **Como investigou:** Verifiquei o arquivo `babel.config.js` que requisitava o preset e inspecionei as dependências em `devDependencies` no `package.json`.
3. **Qual era a causa:** A biblioteca `babel-preset-expo` não constava instalada nas dependências de desenvolvimento do projeto após clonar o repositório.
4. **O que mudou para resolver:** Instalei o pacote com `npm install babel-preset-expo --save-dev` e registrei a dependência no package.json (`commit c95ceab`).

### Orlando Gonçalves - [Data/Hora: 30/08 às 18:20]
1. **O que apareceu:** Ao adulterar o token para teste de segurança, a chamada para `/v1/cart` falhava com 401 mas o app permanecia na tela interna em vez de deslogar.
2. **Como investigou:** Analisei o fluxo no `session.tsx` e notei que os interceptors de response do Axios rejeitavam a Promise sem disparar a troca de estado global da sessão.
3. **Qual era a causa:** Faltava um listener no interceptor de resposta para capturar o status 401 e acionar a limpeza de token e estado.
4. **O que mudou para resolver:** Implementei o `setUnauthorizedHandler` no `http.ts` acionando automaticamente o `signOut()` e `queryClient.clear()` no status 401 (`commit d40dbe4`).

### Matheus Roque - [Data/Hora: 30/08 às 22:40]
1. **O que apareceu:** Ao ativar o modo avião, a tela de Favoritos renderizava a tela de erro `Network Error` em vez de exibir a lista de favoritos salvos.
2. **Como investigou:** Inspecionei o ciclo de vida do `useQuery` no hook `useFavorites` e o tratamento de falhas de rede do TanStack Query.
3. **Qual era a causa:** A query falhava antes de ler os dados persistidos no armazenamento local, caindo diretamente no estado `isError`.
4. **O que mudou para resolver:** Embuti o resgate de cache local dentro da própria `queryFn` do `useQuery`, retornando os itens persistidos com a flag `isOffline: true` em caso de erro de rede (`commit 9c9b849`).

### André Emygdio - [Data/Hora: 30/08 às 23:00]
1. **O que apareceu:** Ao fazer logout e autenticar com uma conta diferente no mesmo dispositivo, a lista de favoritos da conta anterior continuava visível.
2. **Como investigou:** Verifiquei as chaves salvas no `expo-secure-store` e percebi que os favoritos estavam salvos em uma chave estática compartilhada.
3. **Qual era a causa:** O cache local não possuía isolamento por ID de comprador e não era apagado na função de logout.
4. **O que mudou para resolver:** Indexei a persistência local com `favorites_cache_${customerId}` e adicionei a limpeza explícita `removeCustomerFavoritesCache` no `signOut()` (`commit 7de61cd`).


---

## 10. Limitações Conhecidas
* **Paginação com rolagem infinita no catálogo:** O app consome a listagem com paginação no servidor (`?search=`), trazendo a primeira página de 20 itens, mas ainda não possui *infinite scroll* (`onEndReached` no FlatList) para carregar páginas subsequentes (`page=2, 3...`).
* **Filtros combinados de marca e categoria:** A API disponibiliza filtros por `categoryId` e `brandId`, porém a interface atual disponibiliza apenas a busca textual por nome de produto.
* **Sincronização manual pós-modo avião:** Ao desativar o modo avião, a lista de favoritos exibe os dados salvos em cache até que o usuário execute um gesto de *pull-to-refresh* para sincronizar novamente com o servidor.
* **Atualização em tempo real de status de pedidos:** Se o status de um pedido mudar externamente no painel administrativo, a tela de detalhes do pedido não atualiza por WebSockets/Polling em tempo real, exigindo que o usuário recarregue a tela.
