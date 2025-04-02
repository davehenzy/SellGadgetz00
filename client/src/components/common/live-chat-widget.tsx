import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage, ChatRoom } from "@shared/schema";

interface DisplayMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  read: boolean;
}

export function LiveChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [supportRoomId, setSupportRoomId] = useState<number | null>(null);
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Get the user's chat rooms
  const { data: chatRooms, isLoading: roomsLoading } = useQuery<ChatRoom[]>({
    queryKey: ["/api/chat/rooms"],
    enabled: !!user && isOpen,
  });

  // Get unread message count
  const { data: unreadData, isLoading: unreadLoading } = useQuery<{count: number}>({
    queryKey: ["/api/chat/unread"],
    enabled: !!user,
    refetchInterval: isOpen ? false : 10000, // Poll when chat is closed
  });

  // Get messages for the active room
  const { data: roomMessages, isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/rooms", supportRoomId, "messages"],
    enabled: !!supportRoomId && isOpen,
  });

  // Create a new chat room
  const createRoomMutation = useMutation({
    mutationFn: async (roomData: { name: string, type: string }) => {
      const res = await apiRequest("POST", "/api/chat/rooms", roomData);
      return await res.json();
    },
    onSuccess: (data) => {
      setSupportRoomId(data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms"] });
    }
  });

  // Send a message
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string }) => {
      if (!supportRoomId) throw new Error("No active chat room");
      const res = await apiRequest("POST", `/api/chat/rooms/${supportRoomId}/messages`, messageData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms", supportRoomId, "messages"] });
    }
  });

  // Initialize support chat room
  useEffect(() => {
    if (!user || !chatRooms || roomsLoading) return;
    
    // Look for existing support room
    const supportRoom = chatRooms.find(room => room.type === 'support');
    
    if (supportRoom) {
      setSupportRoomId(supportRoom.id);
    } else if (isOpen && !supportRoomId && !createRoomMutation.isPending) {
      // Create a new support room if none exists
      createRoomMutation.mutate({
        name: `Support for ${user.username}`,
        type: 'support'
      });
    }
  }, [user, chatRooms, isOpen, roomsLoading, supportRoomId, createRoomMutation]);

  // Convert API messages to display messages
  useEffect(() => {
    if (!roomMessages || !user) return;
    
    const formattedMessages = roomMessages.map(msg => ({
      id: msg.id,
      text: msg.message,
      isUser: msg.userId === user.id,
      timestamp: new Date(msg.createdAt),
      read: msg.read
    }));
    
    setDisplayMessages(formattedMessages);
  }, [roomMessages, user]);

  // Set up WebSocket connection
  useEffect(() => {
    if (!user || !isOpen || !supportRoomId) return;
    
    // Create WebSocket connection
    // Use a distinct path for our app WebSocket to avoid conflicts with Vite HMR
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws?userId=${user.id}`);
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
      setWebSocket(ws);
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.roomId === supportRoomId) {
          // New message received, refresh messages
          queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms", supportRoomId, "messages"] });
          queryClient.invalidateQueries({ queryKey: ["/api/chat/unread"] });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setWebSocket(null);
    };
    
    // Clean up on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [user, isOpen, supportRoomId, queryClient]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    
    // If opening the chat and we have unread messages, mark them as read
    if (!isOpen && supportRoomId) {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms", supportRoomId, "messages"] });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === "" || !supportRoomId) return;

    // Send the message
    sendMessageMutation.mutate({ message: inputValue });
    setInputValue("");
    
    // If using WebSockets, send there too (for real-time)
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
      webSocket.send(JSON.stringify({
        roomId: supportRoomId,
        message: inputValue
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (displayMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [displayMessages]);

  // If the user isn't logged in, don't show the chat widget
  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-80 sm:w-96 overflow-hidden">
          <div className="bg-primary text-primary-foreground p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Live Support</h3>
              <Button variant="ghost" size="icon" onClick={toggleChat} className="text-primary-foreground hover:bg-primary/80 h-8 w-8 p-0">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="h-64 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900" id="chat-messages">
            {roomsLoading || messagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : displayMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-2">
                <MessageSquare className="h-12 w-12 mb-2" />
                <p>Welcome to live support!</p>
                <p className="text-sm">Send a message to get started.</p>
              </div>
            ) : (
              displayMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"} mb-4`}
                >
                  <div
                    className={`rounded-lg p-2 max-w-[80%] ${
                      message.isUser 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm break-words">{message.text}</p>
                    <span className={`text-xs mt-1 block ${
                      message.isUser ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}>
                      {message.isUser ? "You" : "Support Team"} • {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex">
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                disabled={createRoomMutation.isPending || sendMessageMutation.isPending || !supportRoomId}
                className="w-full rounded-r-none"
              />
              <Button
                onClick={handleSendMessage}
                disabled={createRoomMutation.isPending || sendMessageMutation.isPending || !supportRoomId}
                className="rounded-l-none bg-primary hover:bg-primary/90"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            {createRoomMutation.isError && (
              <p className="text-xs text-destructive mt-2 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Failed to create chat room. Please try again.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="relative">
          <Button
            onClick={toggleChat}
            className="bg-primary text-primary-foreground rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-primary/90 p-0"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
          
          {!unreadLoading && unreadData && unreadData.count > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-destructive hover:bg-destructive">
              {unreadData.count}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
