import { useState, useRef, useEffect } from "react";
import { Send, Brain, User, Pencil, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { RFQCard } from "./RFQCard";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  rfqData?: RFQData;
}

export interface RFQData {
  role: string;
  seniority: string;
  duration: string;
  location: string;
  rateRange: string;
  vendors: { name: string; matchScore: number; rate: string }[];
}

const demoRFQ: RFQData = {
  role: "DevOps Engineer",
  seniority: "Mid-Senior",
  duration: "6 months",
  location: "Stockholm, SE",
  rateRange: "$95–$120/hr",
  vendors: [
    { name: "CloudWorks GmbH", matchScore: 94, rate: "$105/hr" },
    { name: "NordOps AB", matchScore: 89, rate: "$98/hr" },
    { name: "TechCorp Nordic", matchScore: 82, rate: "$115/hr" },
  ],
};

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hello! I'm your AI sourcing assistant. Describe the role you're looking for — I'll draft an RFQ, suggest rates, and recommend the best vendors from your network.\n\nTry something like: *\"I need a DevOps engineer in Stockholm for 6 months\"*",
  },
  {
    id: "2",
    role: "user",
    content: "I need a DevOps engineer in Stockholm for 6 months",
  },
  {
    id: "3",
    role: "assistant",
    content:
      "Great choice. Based on your vendor network and current market rates for **DevOps Engineers** in **Stockholm**, here's what I've put together:",
    rfqData: demoRFQ,
  },
];

export function AISourcingChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I've noted that requirement. Let me refine the sourcing criteria and check availability across your preferred vendors. I'll update the RFQ draft shortly.",
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-card shadow-card">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
        <div className="mx-auto max-w-2xl space-y-5">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={cn("flex gap-3", msg.role === "user" && "justify-end")}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Brain className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] space-y-3",
                    msg.role === "user" && "max-w-[75%]"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-xl px-4 py-2.5 text-[13px] leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-sunken text-foreground"
                    )}
                  >
                    {msg.content.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, i) => {
                      if (part.startsWith("**") && part.endsWith("**"))
                        return <strong key={i}>{part.slice(2, -2)}</strong>;
                      if (part.startsWith("*") && part.endsWith("*"))
                        return <em key={i}>{part.slice(1, -1)}</em>;
                      return <span key={i}>{part}</span>;
                    })}
                  </div>
                  {msg.rfqData && <RFQCard data={msg.rfqData} />}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Brain className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex gap-1 rounded-xl bg-surface-sunken px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your need… e.g. 'Senior React developer in Berlin, 3 months'"
              className="h-10 w-full rounded-lg border border-input bg-surface-sunken pl-4 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
              input.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-muted-foreground"
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-2xl text-center text-[10.5px] text-muted-foreground/60">
          AI-powered sourcing · Responses are draft recommendations — always review before sending.
        </p>
      </div>
    </div>
  );
}
