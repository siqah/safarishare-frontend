import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string) {
    if (this.socket?.connected) return;

    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: {
        token: localStorage.getItem('auth-token')
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.socket?.emit('join-room', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Message events
  onNewMessage(callback: (data: any) => void) {
    this.socket?.on('new-message', callback);
  }

  offNewMessage() {
    this.socket?.off('new-message');
  }

  // Notification events
  onNewNotification(callback: (data: any) => void) {
    this.socket?.on('new-notification', callback);
  }

  offNewNotification() {
    this.socket?.off('new-notification');
  }
}

export const socketService = new SocketService();