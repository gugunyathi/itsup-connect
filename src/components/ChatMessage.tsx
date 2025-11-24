import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  timestamp: string;
  sent?: boolean;
  status?: "sent" | "delivered" | "read";
}

export const ChatMessage = ({ message, timestamp, sent = false, status }: ChatMessageProps) => {
  return (
    <div className={cn("flex mb-3", sent ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] px-4 py-2 rounded-2xl transition-all",
          sent
            ? "bg-chat-sent text-chat-sent-foreground rounded-br-sm"
            : "bg-chat-received text-chat-received-foreground rounded-bl-sm"
        )}
      >
        <p className="text-sm leading-relaxed break-words">{message}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className={cn(
            "text-[10px]",
            sent ? "text-chat-sent-foreground/70" : "text-chat-received-foreground/50"
          )}>
            {timestamp}
          </span>
          {sent && status && (
            <span className={cn(
              "text-[10px]",
              status === "read" ? "text-blue-400" : "text-chat-sent-foreground/70"
            )}>
              ✓✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
