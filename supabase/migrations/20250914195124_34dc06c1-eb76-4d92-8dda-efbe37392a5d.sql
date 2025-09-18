-- Corrección masiva de RLS para optimizar performance
-- Reemplazar auth.uid() directo por (SELECT auth.uid()) en todas las políticas problemáticas

-- 1. NOTIFICATIONS - Recrear políticas con optimización
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
TO authenticated 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE 
TO authenticated 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own notifications" 
ON public.notifications FOR INSERT 
TO authenticated 
WITH CHECK ((SELECT auth.uid()) = sender_id);

-- 2. INCOGNITO POSTS - Optimizar política de creación
DROP POLICY IF EXISTS "Authenticated users can create incognito posts" ON public.incognito_posts;
CREATE POLICY "Authenticated users can create incognito posts" 
ON public.incognito_posts FOR INSERT 
TO authenticated 
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- 3. GROUP MESSAGES - Optimizar todas las políticas
DROP POLICY IF EXISTS "Authenticated users can send group messages" ON public.group_messages;
DROP POLICY IF EXISTS "Group members can send messages" ON public.group_messages;
DROP POLICY IF EXISTS "Group messages are viewable by group members" ON public.group_messages;
DROP POLICY IF EXISTS "Users can delete their own group messages" ON public.group_messages;
DROP POLICY IF EXISTS "Users can update their own group messages" ON public.group_messages;

CREATE POLICY "Group members can send messages" 
ON public.group_messages FOR INSERT 
TO authenticated 
WITH CHECK (
  (SELECT auth.uid()) = sender_id 
  AND EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = group_messages.group_id 
    AND group_members.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Group messages viewable by members" 
ON public.group_messages FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = group_messages.group_id 
    AND group_members.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Users can manage own messages" 
ON public.group_messages FOR UPDATE 
TO authenticated 
USING ((SELECT auth.uid()) = sender_id);

CREATE POLICY "Users can delete own messages" 
ON public.group_messages FOR DELETE 
TO authenticated 
USING ((SELECT auth.uid()) = sender_id);

-- 4. COMMENTS - Optimizar políticas
DROP POLICY IF EXISTS "Los usuarios autenticados pueden crear comentarios" ON public.comments;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus propios comentarios" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

CREATE POLICY "Users can create comments" 
ON public.comments FOR INSERT 
TO authenticated 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own comments" 
ON public.comments FOR DELETE 
TO authenticated 
USING ((SELECT auth.uid()) = user_id);

-- 5. POSTS - Optimizar política de inserción
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
CREATE POLICY "Users can insert their own posts" 
ON public.posts FOR INSERT 
TO authenticated 
WITH CHECK ((SELECT auth.uid()) = user_id);

-- 6. PROFILES - Optimizar políticas
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK ((SELECT auth.uid()) = id);

-- 7. COMMENT REPORTS - Optimizar políticas
DROP POLICY IF EXISTS "Users can create reports" ON public.comment_reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.comment_reports;

CREATE POLICY "Users can create reports" 
ON public.comment_reports FOR INSERT 
TO authenticated 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can view own reports" 
ON public.comment_reports FOR SELECT 
TO authenticated 
USING ((SELECT auth.uid()) = user_id);

-- 8. LIKES - Optimizar todas las políticas
DROP POLICY IF EXISTS "Users can create their own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can update their own likes" ON public.likes;

CREATE POLICY "Users can create likes" 
ON public.likes FOR INSERT 
TO authenticated 
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete likes" 
ON public.likes FOR DELETE 
TO authenticated 
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update likes" 
ON public.likes FOR UPDATE 
TO authenticated 
USING ((SELECT auth.uid()) = user_id);

-- 9. Agregar índices para optimizar performance de las políticas
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_sender_id ON public.group_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_reports_user_id ON public.comment_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_group ON public.group_members(user_id, group_id);

-- 10. Si existe premium_incognito_posts, optimizar también
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'premium_incognito_posts' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Premium users can create incognito posts" ON public.premium_incognito_posts';
    EXECUTE 'CREATE POLICY "Premium users can create incognito posts" ON public.premium_incognito_posts FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) IS NOT NULL)';
  END IF;
END $$;