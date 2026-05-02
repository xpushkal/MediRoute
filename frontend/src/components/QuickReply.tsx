"use client";

interface QuickReplyProps {
  options: string[];
  onSelect: (option: string) => void;
}

export default function QuickReply({ options, onSelect }: QuickReplyProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4 ml-11">
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => onSelect(opt)}
          className="px-4 py-2 bg-primary/5 border border-primary/20 rounded-full text-sm font-medium text-primary hover:bg-primary hover:text-white transition-all duration-200 cursor-pointer"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
