-- Direct Messaging table for Vibe Hyr Community
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id text NOT NULL,
  recipient_name text,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON public.direct_messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient ON public.direct_messages(recipient_id, created_at DESC);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own direct messages"
  ON public.direct_messages
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid()::text = recipient_id);

CREATE POLICY "Users can send direct messages"
  ON public.direct_messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
