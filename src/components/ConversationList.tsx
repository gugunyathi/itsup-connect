import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  online?: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
}

export const ConversationList = ({ conversations, activeId, onSelect }: ConversationListProps) => {
  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="p-4 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">ItsUp</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={cn(
              "w-full p-4 flex items-center gap-3 hover:bg-sidebar-hover transition-colors border-b border-border",
              activeId === conversation.id && "bg-sidebar-active"
            )}
          >
            <div className="relative">
              <Avatar>
                <AvatarImage src={conversation.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {conversation.name[0]}
                </AvatarFallback>
              </Avatar>
              {conversation.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-sidebar" />
              )}
            </div>
            
            <div className="flex-1 text-left min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-semibold text-foreground truncate">{conversation.name}</h3>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {conversation.timestamp}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {conversation.lastMessage}
              </p>
            </div>
            
            {conversation.unread && conversation.unread > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full min-w-[1.5rem] text-center">
                {conversation.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
