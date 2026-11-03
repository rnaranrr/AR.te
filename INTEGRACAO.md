# AR.te — Integração front ↔ back

O `AR.te-integracao.zip` contém **todos os arquivos que mudaram** em relação ao seu projeto original, no mesmo caminho.
Copie por cima (`AR.te/server/...` e `AR.te/client/...`).

## 1. Configuração
- `server/.env` (modelo em `server/.env.example`): **`SECRET_KEY` é obrigatória e precisa ser válida**: pelo menos 32 caracteres aleatórios, sem valor padrão no código.
  O servidor **não inicia** com a chave ausente, curta, repetitiva ou com cara de exemplo, e mostra o que corrigir. Para gerar uma:
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` (cole o resultado em `SECRET_KEY=`). Trocar a chave desconecta todo mundo.
- `client/.env` (modelo em `client/.env.example`): `VITE_API_URL`. Reinicie o Vite depois de criar ou alterar.
- Rode o servidor e o script de moderador **de dentro da pasta `server`** (uploads e `.env` usam caminhos relativos).
- **Rode `server/migracao_concursos.sql` no MySQL antes de iniciar**, se ainda não rodou (o `sync` não altera tabelas existentes).
  A moderação **não exige nova migração**: a tabela `moderator` já existe no modelo e `post.deleted_at` também.
- **Rode `server/migracao_status_titulo.sql` em seguida** (bancos já existentes): renomeia `post_status` → `post_analysis_status` e limita `post_title` a 100 caracteres,
  como no diagrama ER. Ela corta em 100 os títulos que passarem disso. Bancos criados do zero com este código não precisam dela. **Rode o SQL antes de iniciar o servidor.**
  A API também passou a usar o nome `post_analysis_status` nos posts.
- `locales/en.json`: se o seu tem alterações próprias, não sobrescreva; adicione só as chaves novas (grupos `mod.*`, `post.*` e as das rodadas anteriores).

## 2. Moderação

### Primeiro moderador
```
cd server
npm run create-moderator
```
O script pede identificador, nome exibido, usuário vinculado (opcional) e a chave de acesso (digitada sem aparecer na tela).
Depois disso, **só moderadores logados** cadastram outros moderadores (menu da barra de moderação → "Cadastrar um Moderador").

### Como funciona
- **Login separado**: `/mod/login` com identificador (`moderator_idname`) e chave de acesso (guardada criptografada em `moderator_acesskey_hash`).
  O token de moderador (`role: "moderator"`, 8 h) fica em `modToken`; o de usuário continua em `token`. As duas sessões podem coexistir.
  Um token de moderador **não vale** como login de usuário, e o contrário também. O vínculo com um usuário (`moderator_userprofile`) é opcional.
- **Quem pode o quê**: qualquer usuário logado (ou moderador) vê a lista; só moderador altera status e cadastra moderadores.
- **A denúncia é o voto**: no card da moderação, **clicar no ícone/contador de denúncias** denuncia o post ou remove a sua denúncia, como curtir e descurtir
  (o triângulo fica preenchido quando você já denunciou; em post banido só dá para remover a própria denúncia). O menu do post também tem
  "Denunciar post" / "Remover denúncia". Um voto por usuário por post, removível a qualquer momento.
  A 1ª denúncia coloca o post "em análise" (selo **"Em análise"** ao lado do título); se todas forem removidas e ele ainda estiver só
  "em análise", volta ao padrão e sai da lista. Decisões de moderador (banido, restaurado) não são alteradas por votos.
- **Lista**: posts denunciados, um abaixo do outro, **do mais denunciado para o menos denunciado**.
- **Alterar status** (dropdown, só moderador): Em análise, Banido, Restaurado.
- **Exclusão lógica (soft delete)**: `deleted_at` é o que oculta o post da plataforma.
  - *Banir* = `post_analysis_status = banned` + `deleted_at` preenchido (o post some de feed, busca, perfil e comentários, mas continua no banco).
  - *Restaurar* ou *Em análise* = `deleted_at` volta a nulo e o post reaparece.
  - *Autor exclui o próprio post* (menu do post → "Excluir post") = só preenche `deleted_at`. Esses posts não aparecem para a moderação.
  - Única exceção: **excluir a conta** continua apagando tudo de fato, pois as chaves estrangeiras exigem que os posts saiam junto com o usuário.

### Decisões que tomei (me diga se quiser outra)
- **Opiniões** (veja a seção "Tela do post em moderação"): a votação continua sendo só o número de denúncias; as opiniões são texto livre da comunidade
  para argumentar, e ficam na tela `/mod/:postid`. O card mantém os dois botões do mockup: **"Alterar status do post"** (dropdown, só moderador) e **"Ver opiniões do post"** (abre `/mod/:postid`; se já estiver nela, rola até as opiniões).
- **Post banido**: não aceita novas denúncias (resposta 409), mas quem já denunciou pode remover a sua.
- Na tela de moderação, usuário comum vê só "Ver opiniões do post"; moderador vê também o dropdown de status ao lado dele.

## 3. O que está ligado à API
Login e cadastro; feed (Para você e Seguindo, rolagem infinita); post individual; criar e **excluir** post; curtir, repostar, comentar
e curtir comentário; denunciar e remover denúncia; selo "Em análise"; seguir; perfil e edição; excluir conta; reposts na timeline;
mensagens diretas; pesquisa (usuário, texto e `#tag`); raffles (criação, página com participações e vínculo no formulário de post);
moderação completa.

### Tela do post em moderação (`/mod/:postid`)
- Clicar em um post da lista (no título, no texto ou em qualquer área do card que não seja botão, link, mídia ou menu) abre `/mod/:postid`.
- A tela mostra o **mesmo card** em destaque (status, ícone/contador de denúncias que funciona como voto, dropdown de status para moderador, botão "Ver opiniões do post") e, **no lugar dos comentários**, a seção **Opiniões**.
- Qualquer usuário logado pode opinar (1 a 1000 caracteres) e remover a **própria** opinião; moderador sem login de usuário só lê.
- A coluna `opinion.report_id` é obrigatória, então a opinião fica ligada à **1ª denúncia do post**. Se essa denúncia for removida, as opiniões passam para a próxima
  denúncia do mesmo post; se não houver outra, são apagadas. Excluir a conta apaga as opiniões do usuário e preserva as de terceiros ligadas às denúncias dele.
- Post sem denúncias não recebe opiniões (resposta 409). Se o último voto for removido e o post voltar ao padrão, a tela volta para a lista.

### Controle de acesso (quem vê o quê)
Verificado no código: as 30 rotas do `App.jsx` batem com a tabela, os 74 links/redirecionamentos do front apontam para rotas existentes
e cada endpoint da API tem a mesma proteção da tela correspondente.

| Tela / rota | Visitante | Usuário | Moderador |
|---|---|---|---|
| `/` | vai para `/login` | vai para `/feed` | vai para `/mod` |
| `/login`, `/register` | sim | redireciona para `/feed` | sim |
| `/mod/login` | sim | sim | redireciona para `/mod` |
| `/feed` ("Para você"), `/post/:id`, `/user/:username` (+ abas e listas de seguidores/seguindo) | **sim** | sim | sim |
| `/following`, `/search`, `/chat*`, `/profile*`, `/post/new`, `/raffle/new` | login | sim | login de usuário |
| `/mod`, `/mod/:postid` | login | sim | sim |
| `/mod/create` | login de moderador | login de moderador | sim |
| endereço inexistente | volta para `/` | volta para `/` | volta para `/` |

Quem é mandado ao login volta, depois de entrar, para a tela que tentou abrir. No menu lateral, o botão "Sair" vira "Entrar" para visitantes.
API pública para visitantes: cadastro e login, `GET /posts`, `/posts/:id` e seus comentários, `/raffles/:id/posts` e `/users/:username`. O resto exige token
(a pesquisa passou a exigir login, como no TCC). Decisão: o post de um raffle é público como qualquer post; participar exige login.

### Traduções (pt e en)
- Front: todos os textos visíveis usam `t('...')`; `pt.json` e `en.json` têm as mesmas chaves e os mesmos `{{placeholders}}`. Só ficam fixos o nome "AR.te" e os rótulos "PT"/"EN".
- **Mensagens do servidor também são traduzidas**: o front envia `Accept-Language` com o idioma da interface e `middlewares/translateResponses.js` troca
  as mensagens de erro/sucesso pelo inglês (dicionário em `utils/messagesEn.js`). Mensagem sem tradução continua em português.
- **Regra para código novo**: toda mensagem nova do servidor entra em `utils/messagesEn.js`. Confira com `npm run check-messages` (sai com erro se faltar alguma).
- O atributo `lang` do HTML acompanha o idioma escolhido.

### Perfil: seguidores e seguindo
- Em qualquer perfil, clicar em **Seguidores** ou **Seguindo** (nas estatísticas) abre a lista daquele perfil: `/user/:username/followers` e `/user/:username/following`
  (no perfil próprio: `/profile/followers` e `/profile/following`). A tela tem as duas abas e o botão de voltar ao perfil.
- A lista usa **o mesmo componente da lista de mensagens diretas** (`ListElement`: foto, nome e @username, com o mesmo estilo), sem a coluna da última mensagem. Clicar leva ao perfil da pessoa.
- Carrega 20 por vez com rolagem infinita. API: `GET /users/:username/followers` e `/following` (`?limit=20&offset=0`, devolve `{ users, total }`). Como o perfil, as listas são públicas.

### Outras mudanças de interface (4ª rodada)
- **Aba Comissões**: banner e tabela de preços ausentes **não aparecem** (antes mostravam um quadrado com texto). Sem nenhum dos dois, só o status aparece.
- **Cores**: não há mais vermelho na interface; mensagens de erro, a exclusão de conta e o hover de remover usam a cor de destaque (roxo).
  Regra para código novo: usar só as cores do tema (`destaque`, `cinza`, `discreto`, `fundo`, `texto-main`).
- **Editar perfil**: acima de "Excluir conta" há o botão **Sair**, que encerra a sessão neste navegador e volta ao login.

### Anti-scraping de IA (último objetivo do TCC)
- `client/public/robots.txt`: nega todo o site aos rastreadores de empresas de IA generativa (GPTBot, ClaudeBot, Google-Extended, CCBot,
  PerplexityBot, Bytespider, Meta-ExternalAgent etc.) e, para os demais, bloqueia só as áreas privadas (`/chat`, `/mod`, `/profile/edit`, criação de post e raffle).
- `client/index.html`: `<meta name="robots" content="noai, noimageai">` (vale para todas as páginas, pois o site é uma SPA).
- **Servidor**: `server/robots.txt` (a API e `/uploads` bloqueados para qualquer robô) servido em `GET /robots.txt`, e o header
  `X-Robots-Tag: noai, noimageai` em todas as respostas, inclusive nas imagens de `/uploads`, que é onde as artes realmente ficam.
- **Limite honesto**: `robots.txt`, meta tag e header são pedidos de opt-out; só quem respeita o padrão obedece. Por isso o texto do TCC deve
  falar em "camada de opt-out" (como já faz) e manter o Nightshade como trabalho futuro. A lista de rastreadores muda com o tempo: revise-a antes de publicar.
- A lista fica no próprio `robots.txt`; para incluir um robô novo, acrescente uma linha `User-agent: NomeDoRobo` no grupo de IA.

## 4. Padrão de comentários (siga em código novo)
- Português; `// Texto` com espaço, **inicial maiúscula e sem ponto final**. No JSX: `{/* Texto */}`. No CSS: `/* Texto */`.
- **Primeira linha de todo arquivo**: `// Tipo: o que o arquivo faz` (Página, Componente, Formulário, Rotas, Modelo, Middleware, Utilitário, Serviço, Script, Configuração, Servidor, Models ou Estilo).
- **Funções e componentes**: uma linha acima. **Estados e efeitos**: comentário acima do grupo.
- **Rotas**: duas linhas, `// VERBO /caminho` e a descrição (e `// Corpo da requisição: {...}` quando houver). Bloco `catch`: `// Falha inesperada: registra no console e responde com erro`.
- **JSX**: um comentário por seção da tela. Não use `{/* */}` antes do elemento dentro de `.map(...)` com parênteses (quebra o JSX).
- **Models**: cabeçalho com a tabela e um comentário por coluna. Pendências ficam neste guia, não no código.

## 5. Arquivos que não são usados por nenhuma tela
Marcados no cabeçalho e **podem ser apagados**: `pages/Messages/DMhub.jsx`, `pages/search/SearchResults.jsx` (vazio),
`components/form/NewPost.css` (vazio) e `mockup/timelinemock.js`. Os componentes `DMuser`, `ModPage` e `DMhub`, que tinham o nome
`Comissions` herdado de cópia, foram renomeados.

## 6. Roteiro de teste
1. Cadastrar, logar, feed abre. 2. Postar com 2 imagens e tags `arte; teste`. 3. Curtir/repostar, recarregar: estado mantido.
4. Comentar e curtir comentário. 5. 2º usuário: seguir o 1º, aba "Seguindo". 6. Mensagem direta (chega em até 5 s).
7. Pesquisar `arte`, `@usuario`, `#teste`. 8. Criar raffle, participar com outro usuário, voltar ao raffle.
9. Repostar post de outro usuário e ver na Timeline. 10. Excluir conta descartável (senha errada recusa, certa volta ao login).

**Moderação**
11. `npm run create-moderator`; abrir `/mod/login` e entrar; a barra mostra o nome do moderador.
12. Com 3 usuários, denunciar o mesmo post: o contador sobe e o post entra na lista; o mais denunciado fica no topo.
13. 2ª denúncia do mesmo usuário é recusada; "Remover minha denúncia" baixa o contador; sem nenhuma denúncia o post sai da lista.
14. Como moderador, "Alterar status" → Banido: o post some do feed, da busca e do perfil, mas continua na lista; → Restaurado: reaparece.
15. Como moderador, cadastrar um 2º moderador (e tentar o mesmo identificador de novo: recusa). Entrar com ele.
16. Como usuário comum: o dropdown de status não aparece; o botão "Entrar como moderador" aparece na barra.
17. Post denunciado mostra o selo "Em análise" ao lado do título; ao remover todas as denúncias o selo some.
18. Autor: menu do post → "Excluir post": some na hora, não volta ao recarregar e não aparece na moderação.
19. Anti-scraping: abrir `http://localhost:5173/robots.txt` (lista de robôs de IA); `curl -I http://localhost:3000/uploads/posts/<arquivo>` deve
    mostrar `X-Robots-Tag: noai, noimageai`; no navegador, "exibir código-fonte" da página mostra a meta tag `robots`.
20. Sem login: abrir `/` → `/login`; `/search`, `/chat`, `/profile`, `/post/new`, `/following`, `/mod` → `/login` (e, depois de entrar, volta para a tela pedida);
    `/feed`, um post e `/user/<nome>` abrem normalmente; `/mod/create` → `/mod/login`; o menu lateral mostra "Entrar" em vez de "Sair".
21. Logado: `/`, `/login` e `/register` vão para o feed; um endereço inexistente volta para `/`.
22. Idioma: com a interface em English, provocar erros (senha errada, 2ª denúncia, `/post/999999`, imagem inválida no perfil): as mensagens vêm em inglês; em Português, em português.
23. Moderação: clicar no card (fora de botões e mídia) abre `/mod/<id>`; opinar, ver a opinião aparecer no topo, removê-la; com 2 denúncias, remover a 1ª e conferir que as opiniões continuam.
24. Chave: iniciar o servidor com `SECRET_KEY` vazia ou curta deve falhar com uma mensagem clara; com uma chave gerada pelo comando acima, inicia normalmente.
25. Voto: na moderação, clicar no ícone de denúncias soma 1 (triângulo preenchido); clicar de novo remove. Em post banido o ícone fica desativado se você não denunciou.
26. "Ver opiniões do post" abre `/mod/<id>`; dentro dela, o mesmo botão rola até a seção de opiniões.
27. Título: um post com mais de 100 caracteres é recusado (o contador do formulário mostra `/100`).
28. Perfil com e sem seguidores: clicar em "Seguidores" e em "Seguindo" abre a lista certa; trocar de aba mantém o perfil; clicar numa pessoa abre o perfil dela; perfil vazio mostra a mensagem de lista vazia.
29. Como visitante (sem login): `/user/<nome>/followers` abre; `/profile/followers` manda para o login.
30. Aba Comissões de um perfil sem banner e sem tabela: só o status aparece; com apenas um dos dois, só aparece o que existe.
31. Editar perfil: "Sair" aparece acima de "Excluir conta" e leva ao login; provocar um erro de formulário e conferir que a mensagem aparece em roxo.

## 7. Pendências
- Nenhum recurso previsto no TCC ficou sem ligação à API.
- **Segurança ainda pendente** (vale fazer antes de publicar): limitar tentativas de login (ex.: `express-rate-limit`) e restringir o CORS ao endereço do front.
  (A `SECRET_KEY` sem valor padrão e com validação já está feita.)
- O modelo e o diagrama ER agora coincidem em `post_analysis_status` e `post_title` (100 caracteres).

## 8. O que foi verificado
Sintaxe de todo o servidor (`node --check`) e do cliente (parser JSX do TypeScript), ausência de identificadores indefinidos, JSON das
traduções, **todas as chaves `t('...')` existentes em pt e en**, cabeçalhos e estilo de comentários em todos os arquivos.
`npm run build` do cliente passou na sua máquina. O `npm run lint` apontou 13 erros e 2 avisos, todos corrigidos nesta versão
(variáveis e props sem uso, bloco `catch` vazio, `__dirname` no `vite.config.js` e dependências de hooks). Como não tenho o ESLint no meu ambiente,
emulei as regras: o emulador reproduziu os seus erros na versão anterior e deu zero na corrigida; rode `npm run lint` de novo para confirmar.
Efeito colateral das dependências de hooks: trocar o idioma na tela de edição de perfil recarrega o formulário.
Também conferi: a matriz de acesso das rotas (30/30), os alvos de navegação (74/74), a proteção dos endpoints, a paridade pt/en (188 chaves usadas no código, nenhuma ausente),
a cobertura das 95 mensagens do servidor (`npm run check-messages`) e o middleware de tradução com um teste unitário (que achou e corrigiu um bug com arrays).
**Não executei contra o seu MySQL nem no navegador** (sem banco no ambiente de teste): as rotas de moderação foram revisadas por leitura.
Rode o roteiro da seção 6 e me envie o erro exato de qualquer etapa que falhar.
