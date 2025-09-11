// src/utils/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "http://localhost:3000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 500,
  reconnectionDelayMax: 4000,
});

socket.on('connect_error', (err) => {
  // eslint-disable-next-line no-console
  console.warn('Socket connect error:', err.message);
});

socket.on('reconnect_attempt', (n) => {
  // eslint-disable-next-line no-console
  console.log('Socket reconnect attempt', n);
});

// Helper to join a room (driver or passenger)
export function joinAsDriver(driverId: string | number) {
  socket.emit("join", `driver:${driverId}`);
}

export function joinAsPassenger(passengerId: string | number) {
  socket.emit("join", `passenger:${passengerId}`);
}

export function connectSocket(user?: { id?: string; _id?: string; role?: string }) {
  const uid = user?.id || user?._id;
  if (!uid) return;
  if (!socket.connected) socket.connect();
  socket.emit('auth', { userId: uid, role: user?.role });
}

export function disconnectSocket(){
  if (socket.connected) socket.disconnect();
}
