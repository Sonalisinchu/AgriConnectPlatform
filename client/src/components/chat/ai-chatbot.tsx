import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Bot, User, Send, MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AgriConnect assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/chat", { message });
      return await res.json();
    },
    onSuccess: (data) => {
      addMessage("assistant", data.response);
    },
    onError: () => {
      addMessage("assistant", "I'm sorry, I'm having trouble connecting. Please try again later.");
    }
  });
  
  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role,
        content,
        timestamp: new Date()
      }
    ]);
  };
  
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    addMessage("user", inputMessage);
    chatMutation.mutate(inputMessage);
    setInputMessage("");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="fixed bottom-6 right-6 z-20">
      {/* Chatbot Container */}
      <div 
        className={cn(
          "bg-white rounded-lg shadow-lg w-80 overflow-hidden transition-all duration-300",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none hidden"
        )}
      >
        <div className="bg-primary p-4 text-white flex justify-between items-center">
          <h4 className="font-medium flex items-center">
            <Bot className="mr-2 h-4 w-4" /> AgriConnect Assistant
          </h4>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:text-neutral-200 h-6 w-6 p-0" 
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="h-80 overflow-y-auto p-4 space-y-4 bg-neutral-50" id="chatbot-messages">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                "flex items-start",
                message.role === "assistant" ? "" : "justify-end"
              )}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mr-2 flex-shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              
              <div 
                className={cn(
                  "p-3 rounded-lg max-w-[80%]",
                  message.role === "assistant" 
                    ? "bg-neutral-200 rounded-tl-none" 
                    : "bg-primary text-white rounded-tr-none"
                )}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white ml-2 flex-shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-3 border-t border-neutral-200">
          <form className="flex" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question..."
              className="flex-1 border-r-0 rounded-r-none"
              disabled={chatMutation.isPending}
            />
            <Button 
              type="submit" 
              className="rounded-l-none" 
              disabled={chatMutation.isPending || !inputMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
      
      {/* Chat Button */}
      <Button 
        onClick={() => setIsOpen(true)} 
        className={cn(
          "bg-primary hover:bg-primary-dark text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center",
          !isOpen && "animate-pulse"
        )}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </div>
  );
}

export default AIChatbot;
