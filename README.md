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

A divisão abaixo organiza os responsáveis pela revisão, validação e manutenção de cada função antes dos commits. Ela não declara autoria exclusiva nem substitui o histórico de contribuições; a autoria efetiva será consolidada com o grupo na revisão da declaração de IA.

| Função | Responsável | Arquivos |
| :--- | :--- | :--- |
| **Avaliações — formulário, fotos e listagem** | Gabriel Lourenço | `src/screens/ReviewScreen.tsx`, `src/components/ReviewsSection.tsx`, `src/components/Estrelas.tsx`, `src/components/ResumoAvaliacoes.tsx`, `src/hooks/useReviews.ts`, `src/services/reviews.ts`, `src/types/avaliacao.ts` |
| **Autenticação — telas e chamadas de login/cadastro** | Gabriel Lourenço | `src/screens/SignInScreen.tsx`, `src/screens/SignUpScreen.tsx`, `src/screens/ForgotPasswordScreen.tsx`, `src/services/auth.ts` |
| **Localização e pontos de retirada** | André Emygdio | `src/screens/PickupPointsScreen.tsx`, `src/components/PickupMap.tsx`, `src/components/PickupMap.web.tsx`, `src/hooks/usePickupPoints.ts`, `src/services/pickup.ts`, `src/types/localizacao.ts` |
| **Favoritos — tela, consultas e mutações** | André Emygdio | `src/screens/FavoritesScreen.tsx`, `src/hooks/useFavorites.ts`, `src/services/favorites.ts` |
| **Catálogo, busca e detalhe do produto** | Matheus Roque | `src/screens/ProductsScreen.tsx`, `src/screens/ProductDetailScreen.tsx`, `src/hooks/useProducts.ts`, `src/hooks/useProduct.ts`, `src/hooks/useDebounce.ts`, `src/services/products.ts` |
| **Carrinho, checkout e pedidos** | Matheus Roque | `src/screens/CartScreen.tsx`, `src/screens/CheckoutScreen.tsx`, `src/screens/OrderScreen.tsx`, `src/screens/OrdersScreen.tsx`, `src/hooks/useCart.ts`, `src/hooks/useCartMutations.ts`, `src/hooks/useOrders.ts`, `src/hooks/useOrderActions.ts`, `src/services/cart.ts`, `src/services/orders.ts`, `src/lib/orders.ts` |
| **Notificações locais e perfil** | Orlando Gonçalves | `src/screens/ProfileScreen.tsx`, `src/context/NotificationContext.tsx`, `src/services/notifications.ts`, `src/lib/notifications.ts`, `src/lib/notificationNavigation.ts` |
| **Sessão, armazenamento e infraestrutura de dados** | Orlando Gonçalves | `src/session/session.tsx`, `src/services/storage.ts`, `src/services/http.ts`, `src/env.ts`, `src/lib/queryClient.ts`, `src/lib/queryKeys.ts`, `src/types/api.ts` |
| **Identidade visual, componentes e movimento** | Giovane Amato | `src/theme/colors.ts`, `src/components/cp5Styles.ts`, `src/components/ui.tsx`, `src/components/MotionPressable.tsx`, `src/lib/motion.ts`, `src/lib/format.ts`, `assets/IMG_3357.png` |
| **Integração, navegação, configuração e documentação** | Giovane Amato | `App.tsx`, `src/navigation.ts`, `index.js`, `app.json`, `babel.config.js`, `tsconfig.json`, `package.json`, `package-lock.json`, `.env.example`, `.gitignore`, `README.md` |


---

## 3. Como Rodar

### Pré-requisitos
* Node.js compatível com Expo SDK 57 (consulte a documentação oficial do SDK)
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
   npx expo install
   ```

3. Configure as variáveis de ambiente:
   * Duplique o arquivo `.env.example` para `.env`:
     ```bash
     cp .env.example .env
     ```
   * Preencha as chaves no `.env`:
     ```env
     EXPO_PUBLIC_API_URL=https://api.mockmerce.com.br
     EXPO_PUBLIC_API_KEY=sua_api_key_aqui
     EXPO_PUBLIC_STUDENT_RM=seu_rm_aqui

     # Coordenadas da loja cadastradas no painel
     EXPO_PUBLIC_STORE_LATITUDE=
     EXPO_PUBLIC_STORE_LONGITUDE=

     # Não é necessária para executar no Expo Go
     EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
     ```
   * Preencha latitude e longitude com as coordenadas reais da loja, em graus decimais. No painel, cadastre também pelo menos três pontos de retirada em locais diferentes e mantenha um produto disponível para compra.
   * No Expo Go, deixe `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` vazia. Para um build Android próprio, a variável sozinha não configura o mapa: é necessário integrá-la à configuração nativa do Google Maps e gerar um novo build.
   * Mantenha o `.env` e os arquivos de credenciais fora do Git.

4. Inicie o aplicativo:
   ```bash
   npx expo start --go
   ```
---

## 4. Acesso à Loja e conta de teste

A API key deve ser preenchida localmente no `.env`. Compartilhe os dados de acesso com o professor por canal privado; não os publique no repositório.

---

## 6. Decisões Técnicas


1. **Persistência segura e validação de sessão na inicialização**
   * **Por quê:** O token JWT é armazenado no `expo-secure-store` (armazenamento criptografado do sistema). Ao abrir o aplicativo, a sessão é validada contra o backend via `GET /v1/auth/me`, restaurando o comprador automaticamente ou devolvendo-o ao login caso o token esteja adulterado ou expirado.
   * **Commit:** `2947912`

2. **Logout reativo automático no Interceptor de Response para status 401**
   * **Por quê:** Em vez de tratar erros de autorização de forma dispersa em cada tela, centralizamos no interceptor do Axios um listener reativo que aciona o `signOut()` e limpa o cache imediatamente sempre que uma rota de comprador retornar 401.
   * **Commit:** `6d7dace`

3. **Resgate offline de favoritos integrado diretamente no `queryFn` do TanStack Query**
   * **Por quê:** Para não utilizar o `useEffect` para busca de dados, a persistência e o resgate em modo avião foram embutidos na função `queryFn` do `useQuery`. Em caso de falha de conexão, os dados salvos localmente são retornados com a flag `isOffline` ativada para exibir o aviso na UI.
   * **Commit:** `9c9b849`

4. **Isolamento de cache de favoritos por comprador com limpeza no logout**
   * **Por quê:** Os dados locais de favoritos são indexados pelo ID do comprador (`favorites_cache_${customerId}`). No momento do `signOut()`, o cache do cliente é removido do SecureStore e o `queryClient.clear()` é executado, impedindo que um novo login herde favoritos de outro usuário.
   * **Commit:** `7de61cd`

5. **Mutações de carrinho e compra orientadas a confirmação do servidor sem atualização otimista**
   * **Por quê:** Conforme a diretriz do CP4 (pág. 5 do PDF), estoque e valores monetários não devem ser previstos na UI. Todas as mutações de carrinho aguardam a resposta do backend antes de atualizar a interface, evitando divergências em cenários de estoque esgotado (422).
   * **Commit:** `0aaf1ee`

6. **Tipagem estrita de rotas com sobrecargas de função (Function Overloads) sem uso de `any`**
   * **Por quê:** Para cumprir integralmente as diretrizes de qualidade de código e ausência de `any` (RNF-01 e RNF-02), a função de navegação do menu drawer (`navigateTo` em `ProductsScreen.tsx`) foi refatorada com sobrecargas de função do TypeScript vinculadas diretamente ao `RootStackParamList`, assegurando validação estática de telas e parâmetros sem `any`.
   * **Commit:** `e8a2dcf`

---

## 7. Decisões de Produto
* **Proposta da Loja:** Simas Turbo Garage — Loja especializada em peças que você queria e acessórios nada sugestivos (contem ironia).
* **Público-alvo:** Entusiastas de carros, mecânicos e preparadores automotivos.
* **Escolhas de Interface & Telas:** Layout temático, cards com destaque visual para especificações técnicas da peça e alertas rápidos de estoque.

---

## 8. Declaração de Uso de IA

* **Ferramentas Utilizadas:** Antigravity (modelo: Gemini 3.7 flash - medium)
* **Onde foi utilizada:** Estruturação inicial do README, geração de layout & animações e correções de sintaxes e lógica, frefatoração da tipagem estrita de navegação para eliminação de `any` (`navigateTo` em `ProductsScreen.tsx`)
* **O que foi alterado manualmente após a geração:** Cores, nomes das variáveis para algo mais coerente, comentários para uma explicação mais clara.

* **Ferramentas Utilizadas:** Codex (modelo: GPT-6-astra - low)
* **Onde foi utilizada:** documentação e guia de onde implementar animações + sugestões de código de animações
* **O que foi alterado manualmente após a geração:** configurações das animações.

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
* **Paginação do catálogo:** O app exibe a primeira página de produtos retornada pela API e ainda não possui rolagem infinita ou controles para carregar as páginas seguintes.
* **Filtros combinados de marca e categoria:** A API disponibiliza filtros por `categoryId` e `brandId`, porém a interface atual disponibiliza apenas a busca textual por nome de produto.
* **Abertura sem internet:** A restauração da sessão depende de `GET /auth/me`. Se essa consulta falhar, inclusive por falta de conexão, a sessão salva é apagada e o app retorna ao login. Por isso, os favoritos em cache não ficam acessíveis ao reabrir o app offline.
* **Favoritos vazios em cache:** Com a sessão já aberta, o fallback offline aceita apenas listas salvas com pelo menos um favorito. Uma lista vazia salva não é reconhecida como cache utilizável, e a tela apresenta erro se a consulta falhar.
* **Sincronização pós-modo avião:** Não há garantia de atualização imediata dos favoritos quando a conexão volta. O gesto de puxar para atualizar permite buscar os dados atuais do servidor.
* **Atualização em tempo real de status de pedidos:** Se o status de um pedido mudar externamente no painel administrativo, a tela de detalhes do pedido não atualiza por WebSockets/Polling em tempo real, exigindo que o usuário recarregue a tela.
* **Cache de notificações:** São persistidos apenas os últimos 50 IDs de avisos apresentados por cliente. Se o histórico consultado continuar retornando mensagens que saíram desse cache, avisos antigos podem ser notificados novamente.
* **Novos avisos com o app encerrado:** No Caminho B, os avisos novos são buscados quando o app abre, volta ao primeiro plano ou o histórico é atualizado manualmente. Não há recebimento de novas mensagens do servidor enquanto ele permanece encerrado; notificações já apresentadas continuam permitindo abrir o produto.
* **Mapa em build Android próprio:** A configuração atual não aplica `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` ao build. Sem configurar o Google Maps nativo, o app exibe a lista de pontos e um aviso de indisponibilidade do mapa. A execução no Expo Go utiliza a configuração de mapas do próprio Expo Go.

---

## 11. Notificações e Movimento

### Notificações — Caminho B

Escolhemos notificações locais para dispensar Firebase/FCM e credenciais de push. O perfil explica o benefício antes de solicitar permissão. Na abertura da sessão e ao voltar ao primeiro plano, o app consulta `GET /push/messages`, apresenta o histórico e, se autorizado, agenda avisos locais com título, corpo e `data` completos. O canal Android é criado antes da solicitação. A negativa e a indisponibilidade mantêm o histórico utilizável, com acesso aos ajustes e nova tentativa.

O histórico aceita uma lista ou envelope `{ data: [...] }`, com mensagens `{ id, title, body, data }`. Formatos inesperados geram erro legível. Não há registro de aparelhos no Caminho B.

O toque usa `data.produtoId`. Uma abertura com app encerrado consulta a última resposta de notificação e aguarda o navegador autenticado. Uma mensagem de outra conta não navega. Os limites do cache e da consulta de novos avisos estão descritos na seção 10.

Uma notificação local é agendada depois que o app consulta o histórico. Não existe recebimento de novas mensagens do servidor enquanto o aplicativo permanece encerrado; essa é a diferença de transporte prevista no Caminho B. Uma notificação já apresentada pode abrir o produto mesmo após encerrar o app.

### Defesa do movimento

As configurações ficam em `src/lib/motion.ts`. `ANIMATIONS_ENABLED = false` desliga os movimentos implementados, inclusive transições de navegação e drawer. A preferência do sistema é consultada e acompanhada enquanto o aplicativo está aberto.

- **Mantidos:** mola curta nos botões e cards (confirma o toque), entrada escalonada do catálogo com atraso máximo de 270 ms (ajuda a perceber os itens sem atrasar listas longas), saída de itens de carrinho/favoritos e acomodação da lista (explica a remoção), indicador de carregamento e abertura curta do menu existente.
- **Feedback sem movimento:** opacidade ao pressionar, texto e coração alterados ao favoritar, mensagens de erro/sucesso e rótulo de carregamento continuam visíveis. Com “Reduzir movimento”, retiramos escala, deslocamentos e spinner animado.
- **Cortados:** efeitos decorativos contínuos, animação de preços e molas longas. Não ajudam a escolher peças nem confirmar a compra. Não animamos valores financeiros de forma que esconda o total confirmado pelo servidor.

Indicadores nativos controlados pelo sistema, como o gesto de atualizar, seguem o comportamento da plataforma. Testar a preferência de acessibilidade também no aparelho usado na apresentação.
