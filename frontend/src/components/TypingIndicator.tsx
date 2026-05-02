"use client";

export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mr-3 mt-1">
        M
      </div>
      <div className="bg-surface border border-foreground/10 px-5 py-4 rounded-2xl rounded-bl-md flex items-center gap-1.5">
        <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}
