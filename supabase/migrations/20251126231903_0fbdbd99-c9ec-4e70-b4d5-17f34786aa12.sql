-- Create invitations table
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email TEXT,
  recipient_phone TEXT,
  invite_token TEXT NOT NULL UNIQUE,
  invite_type TEXT NOT NULL CHECK (invite_type IN ('chat', 'group', 'call')),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT email_or_phone_required CHECK (
    (recipient_email IS NOT NULL AND recipient_phone IS NULL) OR
    (recipient_email IS NULL AND recipient_phone IS NOT NULL)
  )
);

-- Create invite_links table for shareable links
CREATE TABLE public.invite_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  link_token TEXT NOT NULL UNIQUE,
  link_type TEXT NOT NULL CHECK (link_type IN ('chat', 'group', 'call')),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_uses INTEGER,
  use_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invitations
CREATE POLICY "Users can view their sent invitations"
  ON public.invitations FOR SELECT
  USING (auth.uid() = inviter_id);

CREATE POLICY "Users can create invitations"
  ON public.invitations FOR INSERT
  WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can update their invitations"
  ON public.invitations FOR UPDATE
  USING (auth.uid() = inviter_id);

-- RLS Policies for invite_links
CREATE POLICY "Users can view their own invite links"
  ON public.invite_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create invite links"
  ON public.invite_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invite links"
  ON public.invite_links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invite links"
  ON public.invite_links FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at on invite_links
CREATE TRIGGER update_invite_links_updated_at
  BEFORE UPDATE ON public.invite_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for invitations
ALTER PUBLICATION supabase_realtime ADD TABLE public.invitations;