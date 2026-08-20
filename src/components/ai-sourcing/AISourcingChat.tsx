import { useState, useRef, useEffect } from "react";
import { Send, Brain, User, Clock, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { RFQCard } from "./RFQCard";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  rfqData?: RFQData;
}

export type EngagementModel = "time" | "outcome";

export interface RFQData {
  engagementModel: EngagementModel;
  role: string;
  seniority: string;
  duration: string;
  location: string;
  rateRange: string;
  deliverables?: string[];
  milestones?: { name: string; due: string; value: string }[];
  vendors: { name: string; matchScore: number; rate: string; deliveryNote?: string }[];
}

const demoRFQ: RFQData = {
  engagementModel: "time",
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

const demoOutcomeRFQ: RFQData = {
  engagementModel: "outcome",
  role: "Cloud migration of legacy billing platform",
  seniority: "High complexity",
  duration: "14 weeks",
  location: "Remote + Stockholm workshops",
  rateRange: "$180k–$240k fixed",
  deliverables: [
    "Migration assessment & target AWS architecture, signed off by your architects",
    "Zero-downtime cutover of billing services with rollback plan",
    "IaC repository with automated CI/CD pipelines handed over",
    "Runbooks, monitoring dashboards and 4 weeks of hypercare",
  ],
  milestones: [
    { name: "Discovery & architecture", due: "Week 3", value: "20%" },
    { name: "Pilot workload migrated", due: "Week 7", value: "30%" },
    { name: "Full cutover complete", due: "Week 12", value: "35%" },
    { name: "Hypercare & handover accepted", due: "Week 14", value: "15%" },
  ],
  vendors: [
    {
      name: "CloudWorks GmbH",
      matchScore: 93,
      rate: "$205k fixed",
      deliveryNote: "8 similar migrations · outcome-priced",
    },
    {
      name: "NordOps AB",
      matchScore: 88,
      rate: "$189k fixed",
      deliveryNote: "Milestone-based, 4 wk hypercare included",
    },
    {
      name: "TechCorp Nordic",
      matchScore: 80,
      rate: "$236k fixed",
      deliveryNote: "Capped T&M fallback offered",
    },
  ],
};

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hello! I'm your AI sourcing assistant. Describe what you need — a role to staff, or a business outcome to deliver. I'll draft the right request, suggest pricing, and recommend vendors.\n\nTry: *\"I need a DevOps engineer in Stockholm for 6 months\"* or *\"Migrate our legacy billing platform to AWS, fixed price\"*",
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


const OUTCOME_HINTS = [
  "outcome",
  "fixed price",
  "fixed-price",
  "deliverable",
  "milestone",
  "project",
  "migrate",
  "migration",
  "implement",
  "build ",
  "sow",
  "statement of work",
  "turnkey",
  "managed service",
];

function detectModel(text: string): EngagementModel | null {
  const t = text.toLowerCase();
  if (OUTCOME_HINTS.some((h) => t.includes(h))) return "outcome";
  if (/(engineer|developer|consultant|contractor|per hour|\/hr|hourly|resource)/.test(t))
    return "time";
  return null;
}

export function AISourcingChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [model, setModel] = useState<EngagementModel>("time");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const detected = detectModel(text) ?? model;
    if (detected !== model) setModel(detected);

    setTimeout(() => {
      const assistantMsg: Message =
        detected === "outcome"
          ? {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content:
                "This looks like **outcome-based work**, so I've drafted a *Statement of Work* instead of a role-based RFQ — with deliverables, acceptance criteria and a milestone payment plan. Vendors will bid a **fixed price** against the outcome rather than an hourly rate:",
              rfqData: demoOutcomeRFQ,
            }
          : {
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
        <div className="mx-auto mb-2.5 flex max-w-2xl items-center gap-2">
          <span className="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
            Engagement
          </span>
          <div className="flex rounded-lg bg-surface-sunken p-0.5">
            {([
              { key: "time" as EngagementModel, label: "Time & materials", icon: Clock },
              { key: "outcome" as EngagementModel, label: "Outcome-based", icon: Target },
            ]).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setModel(opt.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                  model === opt.key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <opt.icon className="h-3 w-3" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                model === "outcome"
                  ? "Describe the outcome… e.g. 'Migrate our billing platform to AWS, fixed price, 14 weeks'"
                  : "Describe your need… e.g. 'Senior React developer in Berlin, 3 months'"
              }
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
