"use client";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mr-3 mt-1">
          M
        </div>
      )}
      <div
        className={`max-w-[75%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-primary text-white rounded-br-md"
            : "bg-surface border border-foreground/10 text-foreground rounded-bl-md"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
