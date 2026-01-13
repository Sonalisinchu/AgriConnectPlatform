import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import FarmerSidebar from "@/components/layout/farmer-sidebar";
import BuyerSidebar from "@/components/layout/buyer-sidebar";
import FPOSidebar from "@/components/layout/fpo-sidebar";
import AdminSidebar from "@/components/layout/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Send, User } from "lucide-react";
import { Message } from "@shared/schema";

const MessagesPage = () => {
    const { user } = useAuth();
    const [location, setLocation] = useLocation();
    const [messageInput, setMessageInput] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Get otherUserId from query params
    const searchParams = new URLSearchParams(window.location.search);
    const otherUserIdParam = searchParams.get("userId");
    const otherUserId = otherUserIdParam ? parseInt(otherUserIdParam) : null;
    const otherUserName = searchParams.get("userName") || `User ${otherUserId}`;

    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch messages
    const { data: messages, isLoading } = useQuery<Message[]>({
        queryKey: ["/api/messages", otherUserId],
        enabled: !!otherUserId,
        refetchInterval: 5000, // Poll every 5 seconds for new messages
    });

    // Scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessageMutation = useMutation({
        mutationFn: async (content: string) => {
            if (!otherUserId) throw new Error("No recipient selected");
            const res = await apiRequest("POST", "/api/messages", {
                receiverId: otherUserId,
                content,
            });
            return await res.json();
        },
        onSuccess: () => {
            setMessageInput("");
            queryClient.invalidateQueries({ queryKey: ["/api/messages", otherUserId] });
        },
    });

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !otherUserId) return;
        sendMessageMutation.mutate(messageInput);
    };

    if (!user) return null;

    // Determine which sidebar to show based on role
    const Sidebar = () => {
        switch (user.role) {
            case "farmer": return <FarmerSidebar />;
            case "buyer": return <BuyerSidebar />;
            case "fpo": return <FPOSidebar />;
            case "admin": return <AdminSidebar />;
            default: return <FarmerSidebar />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-neutral-100">
            <Sidebar />

            <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
                <Navbar
                    title="Messages"
                    onToggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />

                <div className="flex-1 p-4 md:p-6 flex flex-col h-[calc(100vh-64px)]">
                    {!otherUserId ? (
                        <div className="flex-1 flex items-center justify-center bg-white rounded-lg shadow-sm">
                            <div className="text-center p-8">
                                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Send className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Select a Conversation</h3>
                                <p className="text-neutral-500">
                                    Select a user from your orders or network to start messaging.
                                </p>
                                <Button
                                    className="mt-6"
                                    onClick={() => setLocation(user.role === 'farmer' ? '/farmer-dashboard' : '/buyer-dashboard')}
                                >
                                    Go to Dashboard
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Card className="flex-1 flex flex-col overflow-hidden shadow-sm border-0">
                            {/* Chat Header */}
                            <div className="p-4 border-b flex items-center bg-white">
                                <Avatar className="h-10 w-10 mr-3">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        <User className="h-5 w-5" />
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-bold">{otherUserName}</h3>
                                    <p className="text-xs text-green-600 flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-green-600 mr-2"></span>
                                        Online
                                    </p>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50">
                                {isLoading ? (
                                    <p className="text-center text-neutral-500 my-4">Loading messages...</p>
                                ) : !messages || messages.length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-neutral-500">No messages yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isMe = msg.senderId === user.id;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[75%] px-4 py-2 rounded-lg text-sm ${isMe
                                                            ? 'bg-primary text-white rounded-br-none'
                                                            : 'bg-white border border-neutral-200 rounded-bl-none'
                                                        }`}
                                                >
                                                    <p>{msg.content}</p>
                                                    <span className={`text-[10px] mt-1 block ${isMe ? 'text-green-100' : 'text-neutral-400'}`}>
                                                        {new Date(msg.createdAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white border-t">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <Input
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1"
                                    />
                                    <Button type="submit" size="icon" disabled={!messageInput.trim() || sendMessageMutation.isPending}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;
