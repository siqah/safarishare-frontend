import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, User, MessageCircle, Phone, Video } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import { format } from 'date-fns';

const Messages: React.FC = () => {
  const { user } = useAuthStore();
  const {
    messages,
    chatRooms,
    activeChat,
    sendMessage,
    getMessagesForChat,
    getChatRooms,
    setActiveChat,
    markAsRead,
    subscribeToMessages,
    isLoading
  } = useChatStore();

  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      getChatRooms(user._id);
      const unsubscribe = subscribeToMessages(user._id);
      return unsubscribe;
    }
  }, [user]);

  useEffect(() => {
    if (activeChat) {
      loadChatMessages();
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const loadChatMessages = async () => {
    if (activeChat) {
      const msgs = await getMessagesForChat(activeChat);
      setChatMessages(msgs);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !user) return;

    const receiverId = activeChat;

    try {
      await sendMessage(receiverId, newMessage.trim());
      setNewMessage('');
      loadChatMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId);
  };

  const getOtherUserName = (chatId: string) => {
    // In a real app, you'd fetch user details
    const chatRoom = chatRooms.find(room => room._id === chatId);
    return chatRoom ? `${chatRoom.otherUser.firstName} ${chatRoom.otherUser.lastName}` : 'Unknown User';
  };

  const filteredChats = chatRooms.filter(chat =>
    getOtherUserName(chat._id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to access messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[calc(100vh-8rem)]">
          <div className="flex h-full">
            {/* Chat List Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {filteredChats.length > 0 ? (
                  <div className="space-y-1 p-2">
                    {filteredChats.map((chat) => (
                      <button
                        key={chat._id}
                        onClick={() => handleChatSelect(chat.otherUser._id)}
                        className={`w-full p-4 text-left hover:bg-gray-50 rounded-lg transition-colors ${
                          activeChat === chat.otherUser._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900 truncate">
                                {getOtherUserName(chat._id)}
                              </h3>
                              {chat.lastMessage && (
                                <span className="text-xs text-gray-500">
                                  {format(new Date(chat.lastMessage.createdAt), 'HH:mm')}
                                </span>
                              )}
                            </div>
                            {chat.lastMessage && (
                              <p className="text-sm text-gray-600 truncate">
                                {chat.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageCircle className="w-16 h-16 mb-4" />
                    <p className="text-lg font-medium">No conversations yet</p>
                    <p className="text-sm">Start a conversation by booking a ride!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {activeChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-6 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h2 className="font-semibold text-gray-900">
                            {getOtherUserName(activeChat)}
                          </h2>
                          <p className="text-sm text-gray-500">Online</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Phone className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Video className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === user._id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === user._id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.senderId === user._id ? 'text-blue-100' : 'text-gray-500'
                            }`}
                          >
                            {format(new Date(message.createdAt), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-6 border-t border-gray-200 bg-white">
                    <form onSubmit={handleSendMessage} className="flex space-x-4">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || isLoading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send</span>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                    <p>Choose a conversation from the sidebar to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;