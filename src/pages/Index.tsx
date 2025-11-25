import { useState } from "react";
import { ConversationList } from "@/components/ConversationList";
import { ChatArea } from "@/components/ChatArea";
import { CallDialog } from "@/components/CallDialog";
import { useConversations } from "@/hooks/useConversations";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const { conversations } = useConversations();
  const { messages, sendMessage } = useRealtimeMessages(activeConversation);
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    startCall,
    endCall,
    isInCall,
    isCalling,
    callType,
    localStream,
    remoteStream,
  } = useWebRTC();

  const activeConv = conversations.find((c) => c.id === activeConversation);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleVoiceCall = () => {
    if (activeConv?.other_user?.id) {
      startCall("voice", activeConv.other_user.id);
    }
  };

  const handleVideoCall = () => {
    if (activeConv?.other_user?.id) {
      startCall("video", activeConv.other_user.id);
    }
  };

  const formattedConversations = conversations.map((conv) => ({
    id: conv.id,
    name: conv.other_user?.display_name || conv.name || "Unknown",
    avatar: conv.other_user?.avatar_url,
    lastMessage: conv.last_message?.content || "",
    timestamp: conv.last_message
      ? new Date(conv.last_message.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    online: conv.other_user?.online || false,
  }));

  const formattedMessages = messages.map((msg) => ({
    id: msg.id,
    message: msg.content,
    timestamp: new Date(msg.created_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    sent: msg.sender_id === user?.id,
    status: msg.status,
  }));

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <div className="w-full md:w-96 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">ItsUp</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
          <ConversationList
            conversations={formattedConversations}
            activeId={activeConversation || ""}
            onSelect={setActiveConversation}
          />
        </div>

        <div className="flex-1 hidden md:flex">
          {activeConv ? (
            <ChatArea
              conversation={{
                id: activeConv.id,
                name: activeConv.other_user?.display_name || activeConv.name || "Unknown",
                avatar: activeConv.other_user?.avatar_url,
                status: activeConv.other_user?.online ? "online" : "last seen recently",
              }}
              messages={formattedMessages}
              onSendMessage={sendMessage}
              onVoiceCall={handleVoiceCall}
              onVideoCall={handleVideoCall}
            />
          ) : (
            <div className="flex items-center justify-center w-full bg-muted">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-primary mb-2">ItsUp</h2>
                <p className="text-muted-foreground">
                  Select a conversation to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <CallDialog
        open={isInCall || isCalling}
        onClose={endCall}
        localStream={localStream}
        remoteStream={remoteStream}
        isVideo={callType === "video"}
        isCalling={isCalling}
        contactName={activeConv?.other_user?.display_name || "Unknown"}
        contactAvatar={activeConv?.other_user?.avatar_url}
      />
    </>
  );
};

export default Index;
