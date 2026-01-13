import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { MessageCircle, X, Send, Bot, User, Minimize2, Loader2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function AIAssistant() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I'm your AgriConnect assistant. How can I help you with your farming or business needs today?" }
    ]);
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen, isMinimized]);

    const chatMutation = useMutation({
        mutationFn: async (message: string) => {
            const res = await apiRequest("POST", "/api/ai/chat", { message });
            return res.json();
        },
        onSuccess: (data) => {
            setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
        },
        onError: () => {
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
        }
    });

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMsg = inputValue;
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setInputValue("");
        chatMutation.mutate(userMsg);
    };

    if (!user) return null;

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg p-0 z-50 animate-in fade-in zoom-in duration-300"
            >
                <MessageCircle className="h-8 w-8" />
            </Button>
        );
    }

    if (isMinimized) {
        return (
            <Card className="fixed bottom-6 right-6 w-72 z-50 shadow-xl border-primary animate-in slide-in-from-bottom-10">
                <div
                    className="flex items-center justify-between p-4 cursor-pointer bg-primary text-primary-foreground rounded-lg"
                    onClick={() => setIsMinimized(false)}
                >
                    <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        <span className="font-medium">AgriConnect AI</span>
                    </div>
                    <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-primary-foreground hover:bg-primary-dark" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="fixed bottom-6 right-6 w-[350px] md:w-[400px] h-[500px] z-50 shadow-2xl flex flex-col animate-in slide-in-from-bottom-5 border-2 border-primary/20">
            <CardHeader className="bg-primary text-primary-foreground p-4 shrink-0 rounded-t-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bot className="h-6 w-6" />
                        <div>
                            <CardTitle className="text-lg">AgriConnect AI</CardTitle>
                            <p className="text-xs text-primary-foreground/80">Expert Agricultural Assistant</p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setIsMinimized(true)}>
                            <Minimize2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden relative bg-neutral-50">
                <div className="absolute inset-0 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "flex items-start gap-2 max-w-[85%]",
                                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}
                        >
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border",
                                msg.role === "user" ? "bg-white border-neutral-200" : "bg-primary/10 border-primary/20"
                            )}>
                                {msg.role === "user" ? <User className="h-5 w-5 text-neutral-600" /> : <Bot className="h-5 w-5 text-primary" />}
                            </div>
                            <div
                                className={cn(
                                    "rounded-2xl px-4 py-2 text-sm shadow-sm",
                                    msg.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                        : "bg-white border border-neutral-200 text-neutral-800 rounded-tl-none"
                                )}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {chatMutation.isPending && (
                        <div className="flex items-center gap-2 mr-auto">
                            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                <Bot className="h-5 w-5 text-primary" />
                            </div>
                            <div className="bg-white border border-neutral-200 rounded-2xl rounded-tl-none px-4 py-2 shadow-sm flex items-center">
                                <span className="text-xs text-neutral-400 mr-2">Thinking</span>
                                <Loader2 className="h-3 w-3 animate-spin text-neutral-400" />
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="p-3 bg-white border-t shrink-0">
                <form
                    className="flex w-full gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                >
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask about crops, prices, or farming..."
                        disabled={chatMutation.isPending}
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={chatMutation.isPending || !inputValue.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
