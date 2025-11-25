import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Conversation {
  id: string;
  name: string | null;
  is_group: boolean;
  other_user?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    online: boolean;
  };
  last_message?: {
    content: string;
    created_at: string;
  };
}

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      // Get user's conversations
      const { data: participations, error } = await supabase
        .from("conversation_participants")
        .select("conversation_id, conversations(id, name, is_group)")
        .eq("user_id", user.id);

      if (error || !participations) return;

      // For each conversation, get the other user's info and last message
      const conversationsWithDetails = await Promise.all(
        participations.map(async (p: any) => {
          const conv = p.conversations;
          if (!conv) return null;
          
          // Get other participants
          const { data: otherParticipantData } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", conv.id)
            .neq("user_id", user.id)
            .limit(1)
            .maybeSingle();

          let otherUser = undefined;
          if (otherParticipantData) {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("id, display_name, avatar_url, online")
              .eq("id", otherParticipantData.user_id)
              .single();
            
            if (profileData) {
              otherUser = profileData;
            }
          }

          // Get last message
          const { data: lastMessage } = await supabase
            .from("messages")
            .select("content, created_at")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            id: conv.id,
            name: conv.name,
            is_group: conv.is_group,
            other_user: otherUser,
            last_message: lastMessage || undefined,
          };
        })
      );

      const validConversations = conversationsWithDetails.filter(c => c !== null) as Conversation[];
      setConversations(validConversations);
    };

    fetchConversations();

    // Subscribe to conversation changes
    const channel = supabase
      .channel("conversations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { conversations };
};
