import { useState, useRef, useEffect } from "react";
import { Send, Bot, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const AskAI = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI companion specialized in entrepreneurship and learning. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev: Message[]) => [...prev, userMessage]);
    setInput("");
    setIsWaiting(true);

    try {
      const response = await apiClient.askAI(input);

      if (response.success && response.data) {
        const fullMessage = (response.data as { message: string }).message;
        const aiMessageId = (Date.now() + 1).toString();
        
        // Add empty message first
        const aiMessage: Message = {
          id: aiMessageId,
          content: "",
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev: Message[]) => [...prev, aiMessage]);
        setIsWaiting(false);
        setIsStreaming(true);

        // Stream the response character by character
        let currentIndex = 0;
        const streamInterval = setInterval(() => {
          if (currentIndex < fullMessage.length) {
            currentIndex++;
            setMessages((prev: Message[]) => {
              const updated = [...prev];
              const lastMessage = updated[updated.length - 1];
              if (lastMessage.id === aiMessageId) {
                lastMessage.content = fullMessage.substring(0, currentIndex);
              }
              return updated;
            });
          } else {
            clearInterval(streamInterval);
            setIsStreaming(false);
          }
        }, 5); // 5ms per character for very fast typing effect
      } else {
        toast.error("Failed to get response from AI");
        setIsWaiting(false);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setIsWaiting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Ask AI" />

      {/* Full page background with animated effects */}
      <div className="relative w-full flex-1 overflow-hidden bg-background" style={{ height: "calc(100vh - 80px)" }}>
        {/* Animated Background Elements - Full page area */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-secondary/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

          {/* Decorative Shapes */}
          <div className="absolute top-1/4 right-10 w-4 h-4 bg-accent rounded-full animate-pulse-slow" />
          <div className="absolute top-1/3 left-20 w-3 h-3 bg-primary/60 rounded-full animate-pulse-slow" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-1/3 right-1/4 w-5 h-5 bg-accent/60 rounded-full animate-pulse-slow" style={{ animationDelay: "2s" }} />
        </div>

        {/* Content container - positioned above background */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 h-full flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-center mb-4">
            <div className="flex items-center gap-3 bg-card/80 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-lg border border-border/50">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-glow">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-1.5 border-card" />
              </div>
              <div>
                <h1 className="text-lg font-display font-bold text-foreground tracking-tight">
                  Ask Momentum AI
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  Your entrepreneurship companion
                </p>
              </div>
            </div>
          </header>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
          <div className="space-y-6 pb-4">
            {messages.map((message: Message, index: number) => (
              <div
                key={message.id}
                className={`flex items-end gap-3 animate-fade-up ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Avatar */}
                {message.role === "assistant" ? (
                  <div className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-md bg-gradient-to-br from-primary via-accent to-primary">
                    <Bot className="w-5 h-5 text-primary-foreground" />
                  </div>
                ) : (
                  <Avatar className="flex-shrink-0 w-10 h-10 rounded-2xl shadow-md">
                    <AvatarImage 
                      src={(user?.profile as any)?.avatar_url} 
                      alt={user?.email}
                      className="rounded-2xl"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-secondary to-muted rounded-2xl flex items-center justify-center">
                      {(user?.profile as any)?.full_name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}

                {/* Message Bubble */}
                <div
                  className={`group relative max-w-[75%] ${
                    message.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`relative px-5 py-4 rounded-3xl shadow-soft transition-all duration-300 hover:shadow-md ${
                      message.role === "assistant"
                        ? "bg-card/90 backdrop-blur-sm border border-border/50 rounded-bl-lg"
                        : "bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-br-lg"
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed font-body whitespace-pre-wrap break-words">
                      {message.content}
                    </p>

                    {/* Decorative corner */}
                    <div
                      className={`absolute bottom-0 w-4 h-4 ${
                        message.role === "assistant"
                          ? "-left-1 bg-card/90 rounded-br-2xl"
                          : "-right-1 bg-accent rounded-bl-2xl"
                      }`}
                      style={{
                        clipPath:
                          message.role === "assistant"
                            ? "polygon(100% 0, 100% 100%, 0 100%)"
                            : "polygon(0 0, 100% 100%, 0 100%)",
                      }}
                    />
                  </div>

                  {/* Timestamp */}
                  <p
                    className={`text-xs text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                      message.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isWaiting && (
              <div className="flex items-end gap-3 animate-fade-up">
                <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="bg-card/90 backdrop-blur-sm border border-border/50 px-5 py-4 rounded-3xl rounded-bl-lg shadow-soft">
                  <div className="flex gap-1.5">
                    <span
                      className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2.5 h-2.5 bg-accent/60 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="pt-4 pb-2">
          <div className="relative bg-card/80 backdrop-blur-xl rounded-3xl shadow-lg border border-border/50 p-2 transition-all duration-300">
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about entrepreneurship, business, or learning..."
                rows={1}
                className="flex-1 bg-transparent px-4 py-3 text-foreground placeholder:text-muted-foreground/60 resize-none outline-none ring-0 focus:outline-none focus:ring-0 text-[15px] font-body max-h-32 custom-scrollbar"
                style={{ minHeight: "48px", boxShadow: "none" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isWaiting || isStreaming}
                className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary text-primary-foreground flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-glow disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed active:scale-95"
              >
                {isWaiting || isStreaming ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Character hint */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 focus-within:opacity-100 transition-opacity">
              <span className="text-xs text-muted-foreground bg-card/90 px-3 py-1 rounded-full shadow-sm">
                Press Enter to send
              </span>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground/60 mt-4 font-medium">
            Specialized in entrepreneurship & learning ✨
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AskAI;
