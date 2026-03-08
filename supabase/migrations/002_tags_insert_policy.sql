-- Permite que usuários autenticados criem e atualizem tags
CREATE POLICY "tags_insert_auth" ON public.tags
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "tags_update_auth" ON public.tags
  FOR UPDATE USING (auth.uid() IS NOT NULL);
