import { useState } from "react";
import { ConversationList } from "@/components/ConversationList";
import { ChatArea } from "@/components/ChatArea";

// Mock data
const mockConversations = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    lastMessage: "Hey! Are we still on for lunch tomorrow?",
    timestamp: "10:30 AM",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "Mike Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    lastMessage: "Thanks for the help with the project!",
    timestamp: "Yesterday",
    online: true,
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    lastMessage: "Did you see the game last night?",
    timestamp: "Tuesday",
    unread: 1,
    online: false,
  },
  {
    id: "4",
    name: "Team Alpha",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Team",
    lastMessage: "Meeting rescheduled to 3 PM",
    timestamp: "Monday",
    online: false,
  },
];

const mockMessages: Array<{
  id: string;
  message: string;
  timestamp: string;
  sent: boolean;
  status?: "sent" | "delivered" | "read";
}> = [
  {
    id: "1",
    message: "Hey! How are you?",
    timestamp: "10:25 AM",
    sent: false,
  },
  {
    id: "2",
    message: "I'm doing great! Just finished working on the new design.",
    timestamp: "10:26 AM",
    sent: true,
    status: "read",
  },
  {
    id: "3",
    message: "That's awesome! Can't wait to see it.",
    timestamp: "10:28 AM",
    sent: false,
  },
  {
    id: "4",
    message: "Are we still on for lunch tomorrow?",
    timestamp: "10:30 AM",
    sent: false,
  },
];

const Index = () => {
  const [activeConversation, setActiveConversation] = useState("1");
  const [messages, setMessages] = useState(mockMessages);

  const activeConv = mockConversations.find((c) => c.id === activeConversation);

  const handleSendMessage = (message: string) => {
    const newMessage: {
      id: string;
      message: string;
      timestamp: string;
      sent: boolean;
      status?: "sent" | "delivered" | "read";
    } = {
      id: Date.now().toString(),
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sent: true,
      status: "sent",
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-full md:w-96 border-r border-border">
        <ConversationList
          conversations={mockConversations}
          activeId={activeConversation}
          onSelect={setActiveConversation}
        />
      </div>
      
      <div className="flex-1 hidden md:flex">
        {activeConv ? (
          <ChatArea
            conversation={{
              id: activeConv.id,
              name: activeConv.name,
              avatar: activeConv.avatar,
              status: activeConv.online ? "online" : "last seen recently",
            }}
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div className="flex items-center justify-center w-full bg-muted">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary mb-2">ItsUp</h2>
              <p className="text-muted-foreground">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
