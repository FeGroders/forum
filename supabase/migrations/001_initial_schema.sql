-- ============================================================
-- DevForum - Schema Inicial
-- ============================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELA: profiles
-- Extende auth.users do Supabase
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  bio         TEXT,
  website     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: categories
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT UNIQUE NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  icon        TEXT DEFAULT 'hash',
  color       TEXT DEFAULT '#6366f1',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: tags
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tags (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT UNIQUE NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: posts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL CHECK (char_length(title) BETWEEN 5 AND 300),
  content     TEXT NOT NULL CHECK (char_length(content) >= 20),
  author_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_pinned   BOOLEAN NOT NULL DEFAULT FALSE,
  is_locked   BOOLEAN NOT NULL DEFAULT FALSE,
  view_count  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: post_tags (relação N:N)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.post_tags (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- ============================================================
-- TABELA: comments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content    TEXT NOT NULL CHECK (char_length(content) BETWEEN 2 AND 5000),
  post_id    UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id  UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: votes (posts e comentários)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.votes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id    UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  vote_type  SMALLINT NOT NULL CHECK (vote_type IN (1, -1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Um usuário só pode votar uma vez por post
  CONSTRAINT votes_post_unique UNIQUE (user_id, post_id),
  -- Um usuário só pode votar uma vez por comentário
  CONSTRAINT votes_comment_unique UNIQUE (user_id, comment_id),
  -- Deve ser voto em post OU comentário, nunca ambos ou nenhum
  CONSTRAINT votes_target_check CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- ============================================================
-- TABELA: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('comment', 'reply', 'upvote', 'downvote', 'mention')),
  post_id    UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
CREATE INDEX IF NOT EXISTS posts_author_id_idx ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS posts_category_id_idx ON public.posts(category_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS comments_post_id_idx ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS comments_author_id_idx ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS votes_post_id_idx ON public.votes(post_id);
CREATE INDEX IF NOT EXISTS votes_comment_id_idx ON public.votes(comment_id);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON public.notifications(user_id, is_read);

-- ============================================================
-- VIEWS: post_vote_counts
-- ============================================================
CREATE OR REPLACE VIEW public.post_vote_counts AS
SELECT
  post_id,
  COUNT(*) FILTER (WHERE vote_type = 1)  AS upvotes,
  COUNT(*) FILTER (WHERE vote_type = -1) AS downvotes,
  SUM(vote_type) AS score
FROM public.votes
WHERE post_id IS NOT NULL
GROUP BY post_id;

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cria perfil automático quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _username TEXT;
BEGIN
  -- Gera username a partir do email
  _username := split_part(NEW.email, '@', 1);

  -- Garante unicidade do username
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = _username) LOOP
    _username := _username || floor(random() * 1000)::TEXT;
  END LOOP;

  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    _username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cria notificação ao adicionar comentário
CREATE OR REPLACE FUNCTION public.handle_new_comment()
RETURNS TRIGGER AS $$
DECLARE
  _post_author_id UUID;
  _parent_author_id UUID;
BEGIN
  -- Notifica autor do post
  SELECT author_id INTO _post_author_id FROM public.posts WHERE id = NEW.post_id;

  IF _post_author_id IS NOT NULL AND _post_author_id != NEW.author_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, post_id, comment_id)
    VALUES (_post_author_id, NEW.author_id, 'comment', NEW.post_id, NEW.id);
  END IF;

  -- Notifica autor do comentário pai (reply)
  IF NEW.parent_id IS NOT NULL THEN
    SELECT author_id INTO _parent_author_id FROM public.comments WHERE id = NEW.parent_id;

    IF _parent_author_id IS NOT NULL AND _parent_author_id != NEW.author_id AND _parent_author_id != _post_author_id THEN
      INSERT INTO public.notifications (user_id, actor_id, type, post_id, comment_id)
      VALUES (_parent_author_id, NEW.author_id, 'reply', NEW.post_id, NEW.id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cria notificação ao votar em post
CREATE OR REPLACE FUNCTION public.handle_new_vote()
RETURNS TRIGGER AS $$
DECLARE
  _owner_id UUID;
  _notif_type TEXT;
BEGIN
  _notif_type := CASE WHEN NEW.vote_type = 1 THEN 'upvote' ELSE 'downvote' END;

  IF NEW.post_id IS NOT NULL THEN
    SELECT author_id INTO _owner_id FROM public.posts WHERE id = NEW.post_id;
  ELSIF NEW.comment_id IS NOT NULL THEN
    SELECT author_id INTO _owner_id FROM public.comments WHERE id = NEW.comment_id;
  END IF;

  IF _owner_id IS NOT NULL AND _owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, post_id, comment_id)
    VALUES (_owner_id, NEW.user_id, _notif_type, NEW.post_id, NEW.comment_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_comment_created
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_comment();

CREATE TRIGGER on_vote_created
  AFTER INSERT ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_vote();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories (somente leitura para usuários)
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (true);

-- Tags (somente leitura para usuários)
CREATE POLICY "tags_select_all" ON public.tags FOR SELECT USING (true);

-- Posts
CREATE POLICY "posts_select_all" ON public.posts FOR SELECT USING (true);
CREATE POLICY "posts_insert_auth" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts_update_own" ON public.posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "posts_delete_own" ON public.posts FOR DELETE USING (auth.uid() = author_id);

-- Post Tags
CREATE POLICY "post_tags_select_all" ON public.post_tags FOR SELECT USING (true);
CREATE POLICY "post_tags_insert_auth" ON public.post_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND author_id = auth.uid())
);
CREATE POLICY "post_tags_delete_own" ON public.post_tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND author_id = auth.uid())
);

-- Comments
CREATE POLICY "comments_select_all" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_auth" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "comments_update_own" ON public.comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "comments_delete_own" ON public.comments FOR DELETE USING (auth.uid() = author_id);

-- Votes
CREATE POLICY "votes_select_all" ON public.votes FOR SELECT USING (true);
CREATE POLICY "votes_insert_auth" ON public.votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "votes_update_own" ON public.votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "votes_delete_own" ON public.votes FOR DELETE USING (auth.uid() = user_id);

-- Notifications (apenas o dono pode ver)
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- DADOS INICIAIS (seed)
-- ============================================================
INSERT INTO public.categories (name, slug, description, icon, color) VALUES
  ('JavaScript', 'javascript', 'Tópicos sobre JavaScript, TypeScript, Node.js e ecossistema', 'code-2', '#f7df1e'),
  ('Python', 'python', 'Tópicos sobre Python, Django, FastAPI, data science e mais', 'terminal', '#3776ab'),
  ('Web Development', 'web-dev', 'HTML, CSS, frameworks e desenvolvimento web em geral', 'globe', '#e34f26'),
  ('DevOps & Cloud', 'devops', 'Docker, Kubernetes, CI/CD, AWS, GCP e Azure', 'cloud', '#326ce5'),
  ('Banco de Dados', 'databases', 'SQL, NoSQL, PostgreSQL, MongoDB, Redis e mais', 'database', '#336791'),
  ('Carreira', 'carreira', 'Dicas de carreira, entrevistas, mercado de trabalho', 'briefcase', '#6366f1'),
  ('Open Source', 'open-source', 'Projetos open source, contribuições e comunidade', 'git-branch', '#24292f'),
  ('Discussão Geral', 'geral', 'Assuntos gerais sobre programação e tecnologia', 'message-circle', '#8b5cf6')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.tags (name, slug) VALUES
  ('react', 'react'), ('vue', 'vue'), ('angular', 'angular'),
  ('node', 'node'), ('typescript', 'typescript'), ('javascript', 'javascript'),
  ('python', 'python'), ('rust', 'rust'), ('go', 'go'), ('java', 'java'),
  ('docker', 'docker'), ('kubernetes', 'kubernetes'), ('aws', 'aws'),
  ('sql', 'sql'), ('nosql', 'nosql'), ('graphql', 'graphql'),
  ('api', 'api'), ('testing', 'testing'), ('security', 'security'),
  ('performance', 'performance'), ('open-source', 'open-source'),
  ('iniciante', 'iniciante'), ('tutorial', 'tutorial'), ('duvida', 'duvida')
ON CONFLICT (slug) DO NOTHING;
