import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  status: "sent" | "delivered" | "read";
}

export const useRealtimeMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!conversationId || !user) return;

    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data.map(msg => ({
          ...msg,
          status: msg.status as "sent" | "delivered" | "read"
        })));
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages((current) => [...current, {
            ...newMsg,
            status: newMsg.status as "sent" | "delivered" | "read"
          }]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMsg = payload.new as any;
          setMessages((current) =>
            current.map((msg) =>
              msg.id === updatedMsg.id ? {
                ...updatedMsg,
                status: updatedMsg.status as "sent" | "delivered" | "read"
              } : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  const sendMessage = async (content: string) => {
    if (!conversationId || !user) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      status: "sent",
    });

    if (error) {
      console.error("Error sending message:", error);
    }
  };

  return { messages, sendMessage };
};
