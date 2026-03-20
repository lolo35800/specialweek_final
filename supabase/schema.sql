-- ================================================
-- VériIA — Schéma Supabase
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- ================================================

-- ── 1. PROFILES (étend auth.users) ───────────────

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  bio text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger : crée un profil vide à chaque inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  base_username text;
  final_username text;
  counter int := 0;
BEGIN
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  final_username := base_username;

  -- Si le username est déjà pris, on ajoute un suffixe numérique
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::text;
  END LOOP;

  INSERT INTO profiles (id, username)
  VALUES (NEW.id, final_username)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ── 2. POSTS ─────────────────────────────────────

CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('quiz', 'fake_or_real')),
  content jsonb NOT NULL DEFAULT '{}',
  thumbnail_url text,
  likes_count int NOT NULL DEFAULT 0,
  plays_count int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  is_flagged boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ── 3. LIKES ─────────────────────────────────────

CREATE TABLE likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, post_id)
);


-- ── 4. PLAY SESSIONS ─────────────────────────────

CREATE TABLE play_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE SET NULL,
  post_id uuid NOT NULL REFERENCES posts ON DELETE CASCADE,
  score int NOT NULL,
  total int NOT NULL,
  duration_s int,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ── 5. CHALLENGES ──────────────────────────────────

CREATE TABLE challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('quiz', 'fake_or_real')),
  join_code text UNIQUE NOT NULL,
  config jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ── 6. CHALLENGE PARTICIPATIONS ────────────────────

CREATE TABLE challenge_participations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score int,
  total int,
  duration_s int,
  completed_at timestamptz,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, user_id)
);


-- ── 7. FONCTIONS RPC (likes / plays counters) ────

CREATE OR REPLACE FUNCTION increment_likes(post_id uuid)
RETURNS void AS $$
  UPDATE posts SET likes_count = likes_count + 1 WHERE id = post_id;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_likes(post_id uuid)
RETURNS void AS $$
  UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = post_id;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_plays(post_id uuid)
RETURNS void AS $$
  UPDATE posts SET plays_count = plays_count + 1 WHERE id = post_id;
$$ LANGUAGE sql SECURITY DEFINER;


-- ── 8. ROW LEVEL SECURITY ────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_sessions ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own"    ON profiles FOR UPDATE USING (auth.uid() = id);

-- posts
CREATE POLICY "posts_select_published" ON posts FOR SELECT
  USING (is_published = true AND is_flagged = false);

CREATE POLICY "posts_select_admin" ON posts FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "posts_insert_auth" ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "posts_update_own" ON posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "posts_delete_own_or_admin" ON posts FOR DELETE
  USING (
    auth.uid() = author_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- likes
CREATE POLICY "likes_select_public" ON likes FOR SELECT USING (true);
CREATE POLICY "likes_insert_auth"   ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete_own"    ON likes FOR DELETE USING (auth.uid() = user_id);

-- play_sessions
CREATE POLICY "play_sessions_insert_any" ON play_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "play_sessions_select_own" ON play_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- challenges
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "challenges_select_auth" ON challenges FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "challenges_insert_prof" ON challenges FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'professeur')
  );

CREATE POLICY "challenges_update_own" ON challenges FOR UPDATE
  USING (auth.uid() = creator_id);

-- challenge_participations
ALTER TABLE challenge_participations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cp_select_own_or_creator" ON challenge_participations FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM challenges WHERE challenges.id = challenge_id AND challenges.creator_id = auth.uid()
    )
  );

CREATE POLICY "cp_insert_auth" ON challenge_participations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cp_update_own" ON challenge_participations FOR UPDATE
  USING (auth.uid() = user_id);
