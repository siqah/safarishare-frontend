import React, { useState } from 'react';
import ChatroomList from '../components/messaging/ChatroomList';
import RideChat from '../components/messaging/RideChat';

const MessagesPage: React.FC = () => {
  const [active, setActive] = useState<{ rideId: string; passengerId?: string } | null>(null);
  return (
    <div className="h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] max-w-7xl mx-auto bg-white md:bg-transparent md:px-4">
      <div className="h-full grid md:grid-cols-[360px_1fr]">
        {/* List pane */}
        <div className={`border-r md:block ${active ? 'hidden md:block' : 'block'} h-full bg-white`}> 
          <div className="px-4 py-3 border-b">
            <h1 className="text-lg font-semibold text-gray-800">Messages</h1>
          </div>
          <ChatroomList className="h-[calc(100%-49px)]" onSelect={setActive} />
        </div>
        {/* Chat pane */}
        <div className={`h-full ${active ? 'block' : 'hidden md:block'} bg-white`}>
          {active ? (
            <RideChat
              rideId={active.rideId}
              passengerId={active.passengerId}
              onClose={() => setActive(null)}
            />
          ) : (
            <div className="h-full hidden md:flex items-center justify-center text-gray-400">Select a conversation</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
