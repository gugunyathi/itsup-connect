import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  message: string;
  timestamp: string;
  sent: boolean;
  status?: "sent" | "delivered" | "read";
}

interface ChatAreaProps {
  conversation: {
    id: string;
    name: string;
    avatar?: string;
    status?: string;
  };
  messages: Message[];
  onSendMessage: (message: string) => void;
}

export const ChatArea = ({ conversation, messages, onSendMessage }: ChatAreaProps) => {
  const { toast } = useToast();

  const handleVoiceCall = () => {
    toast({
      title: "Voice Call",
      description: `Starting voice call with ${conversation.name}...`,
    });
  };

  const handleVideoCall = () => {
    toast({
      title: "Video Call",
      description: `Starting video call with ${conversation.name}...`,
    });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <ChatHeader
        name={conversation.name}
        avatar={conversation.avatar}
        status={conversation.status}
        onVoiceCall={handleVoiceCall}
        onVideoCall={handleVideoCall}
      />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg.message}
            timestamp={msg.timestamp}
            sent={msg.sent}
            status={msg.status}
          />
        ))}
      </div>
      
      <ChatInput onSend={onSendMessage} />
    </div>
  );
};
