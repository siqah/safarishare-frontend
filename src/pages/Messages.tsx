import React from 'react';
import ChatroomList from '../components/messaging/ChatroomList';

const MessagesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Messages</h1>
          <p className="text-sm text-gray-500">Your recent conversations</p>
        </div>
      </div>
      <ChatroomList />
    </div>
  );
};

export default MessagesPage;
