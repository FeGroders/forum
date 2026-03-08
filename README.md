# DevForum

Fórum de desenvolvedores construído com React, TypeScript e Supabase. Um espaço para a comunidade compartilhar conhecimento, tirar dúvidas e discutir tecnologia.

## Funcionalidades

- **Posts** — criação de posts com suporte a Markdown e syntax highlighting
- **Categorias & Tags** — organização por tópicos (JavaScript, Python, Web Dev, DevOps…)
- **Comentários** — respostas aninhadas com suporte a réplicas
- **Votação** — sistema de upvote/downvote em posts e comentários
- **Notificações** — alertas em tempo real de comentários, réplicas e votos
- **Perfil** — bio, avatar, links de redes sociais e badges de tecnologia
- **Badges** — mais de 40 badges com ícones oficiais para linguagens e frameworks
- **Busca** — pesquisa global de posts
- **Auth** — registro e login com e-mail/senha via Supabase Auth

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Estilo | Tailwind CSS + shadcn/ui |
| Roteamento | React Router v7 |
| Formulários | React Hook Form + Zod |
| Estado do servidor | TanStack Query v5 |
| Backend / DB | Supabase (PostgreSQL + Auth + RLS) |
| Ícones | Lucide React + Simple Icons |

## Pré-requisitos

- Node.js 18+
- Uma conta no [Supabase](https://supabase.com) (gratuita)

## Como rodar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/devforum.git
cd devforum
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

Crie um projeto em [supabase.com](https://supabase.com), vá em **Settings → API** e copie a URL e a chave anon.

```bash
cp .env.example .env
```

Edite o `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

### 4. Execute as migrations

No **SQL Editor** do seu projeto Supabase, execute os arquivos em ordem:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_tags_insert_policy.sql
supabase/migrations/003_social_fields.sql
supabase/migrations/004_badges.sql
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173).

## Scripts disponíveis

```bash
npm run dev      # Servidor de desenvolvimento com HMR
npm run build    # Build de produção (TypeScript + Vite)
npm run preview  # Pré-visualizar o build de produção
npm run lint     # Verificar erros de lint com ESLint
```

## Estrutura do projeto

```
src/
├── components/
│   ├── auth/          # Proteção de rotas autenticadas
│   ├── badges/        # BadgeIcon e BadgeSelector
│   ├── comments/      # Listagem e formulário de comentários
│   ├── layout/        # Header, Sidebar, Layout principal
│   ├── notifications/ # Painel de notificações
│   ├── posts/         # PostCard, PostForm, PostList
│   └── ui/            # Componentes base (shadcn/ui)
├── context/
│   └── AuthContext.tsx
├── hooks/             # useProfile, usePosts, useComments…
├── lib/
│   ├── badges.ts      # Definições dos badges de tecnologia
│   ├── supabase.ts    # Cliente Supabase
│   └── utils.ts
├── pages/             # Páginas (Home, Post, Profile, Login…)
└── types/             # Interfaces TypeScript globais

supabase/
└── migrations/        # Scripts SQL do banco de dados
```

## Banco de dados

O schema principal inclui as tabelas:

- `profiles` — dados do usuário (username, bio, redes sociais, badges)
- `categories` — categorias dos posts
- `tags` — tags associadas aos posts
- `posts` — publicações com suporte a pinagem e bloqueio
- `post_tags` — relação N:N entre posts e tags
- `comments` — comentários com suporte a respostas aninhadas
- `votes` — votos em posts e comentários
- `notifications` — notificações de interações

Todas as tabelas usam **Row-Level Security (RLS)** do PostgreSQL.

## Como contribuir

Contribuições são muito bem-vindas!

### Fluxo

1. Faça um fork do repositório
2. Crie uma branch para sua feature ou correção:
   ```bash
   git checkout -b feature/minha-feature
   ```
3. Faça suas alterações e commit com mensagens descritivas:
   ```bash
   git commit -m "feat: adiciona sistema de notificações por e-mail"
   ```
4. Abra um **Pull Request** descrevendo o que foi feito e por quê

### Convenções

- Commits no padrão [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, etc.)
- Todo componente novo deve ser tipado com TypeScript
- Novas migrations devem seguir a numeração sequencial (`005_...sql`)
- UI em português (pt-BR)

### Ideias de contribuição

- [ ] Pesquisa avançada com filtros combinados
- [ ] Paginação infinita nos posts
- [ ] Editor de Markdown com pré-visualização
- [ ] Moderação de posts e comentários
- [ ] API de webhooks para integrações externas
- [ ] Suporte a múltiplos idiomas (i18n)
- [ ] Testes automatizados (Vitest + Testing Library)

## Licença

Distribuído sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
