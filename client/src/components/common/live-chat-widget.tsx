import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi there! How can we help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate response after delay
    setTimeout(() => {
      const botMessage: Message = {
        id: messages.length + 2,
        text: "Thanks for your message! Our team will respond shortly.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-lg w-80 sm:w-96 overflow-hidden">
          <div className="bg-blue-700 text-white p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Live Support</h3>
              <Button variant="ghost" size="icon" onClick={toggleChat} className="text-white hover:bg-blue-600 h-8 w-8 p-0">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="h-64 p-4 overflow-y-auto bg-gray-50" id="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-${message.isUser ? "end justify-end" : "start"} mb-4`}
              >
                <div
                  className={`${
                    message.isUser ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-800"
                  } rounded-lg p-2 max-w-[80%]`}
                >
                  <p className="text-sm">{message.text}</p>
                  <span className={`text-xs ${message.isUser ? "text-blue-200" : "text-gray-500"} mt-1 block`}>
                    {message.isUser ? "You" : "Support Team"} • {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t">
            <div className="flex">
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                className="w-full rounded-r-none"
              />
              <Button
                onClick={handleSendMessage}
                className="rounded-l-none bg-blue-700 hover:bg-blue-800"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          onClick={toggleChat}
          className="bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-800 p-0"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
