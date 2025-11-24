import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Video, MoreVertical } from "lucide-react";

interface ChatHeaderProps {
  name: string;
  avatar?: string;
  status?: string;
  onVoiceCall: () => void;
  onVideoCall: () => void;
}

export const ChatHeader = ({ name, avatar, status, onVoiceCall, onVideoCall }: ChatHeaderProps) => {
  return (
    <div className="h-16 px-4 flex items-center justify-between border-b border-border bg-background">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={avatar} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {name[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-foreground">{name}</h2>
          {status && (
            <p className="text-xs text-muted-foreground">{status}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onVoiceCall}
          className="hover:bg-sidebar-hover"
        >
          <Phone className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onVideoCall}
          className="hover:bg-sidebar-hover"
        >
          <Video className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-sidebar-hover"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
