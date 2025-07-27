import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private userId: string | null = null;

  connect(userId?: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.userId = userId || null;
    const token = localStorage.getItem('token');
    
    // Use VITE_API_URL without /api for socket connection
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    
    console.log('Connecting to socket with:', {
      url: socketUrl,
      userId: this.userId,
      hasToken: !!token
    });

    this.socket = io(socketUrl, {
      auth: {
        token,
        userId: this.userId
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: false,
      autoConnect: true
    });

    this.setupEventHandlers();
    return this.socket;
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connected to server with ID:', this.socket?.id);
      this.reconnectAttempts = 0;
      
      // Join user room
      if (this.userId) {
        this.socket?.emit('join-room', `user_${this.userId}`);
        console.log(`Joined user room: user_${this.userId}`);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, reconnect manually
        setTimeout(() => {
          this.socket?.connect();
        }, 1000);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      this.handleReconnect();
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('✅ Reconnected after', attemptNumber, 'attempts');
    });

    // Handle user status
    this.socket.on('user-online', (userId) => {
      console.log('🟢 User came online:', userId);
    });

    this.socket.on('user-offline', (userId) => {
      console.log('🔴 User went offline:', userId);
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.socket?.connect();
      }, 1000 * this.reconnectAttempts);
    } else {
      console.error('💀 Max reconnection attempts reached');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.userId = null;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      console.log('📤 Emitting event:', event, 'with data:', data);
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ Socket not connected, cannot emit event:', event);
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (data: any) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Specific methods for common events
  joinRoom(roomId: string): void {
    this.emit('join-room', roomId);
  }

  leaveRoom(roomId: string): void {
    this.emit('leave-room', roomId);
  }

  sendMessage(receiverId: string, message: any, sender: any): void {
    this.emit('send-message', {
      receiverId,
      message,
      sender
    });
  }

  sendNotification(userId: string, notification: any): void {
    this.emit('send-notification', {
      userId,
      notification
    });
  }

  // Typing indicators
  startTyping(receiverId: string): void {
    this.emit('typing-start', { receiverId });
  }

  stopTyping(receiverId: string): void {
    this.emit('typing-stop', { receiverId });
  }
}

export const socketService = new SocketService();