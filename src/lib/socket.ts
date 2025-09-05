// src/utils/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "https://safarshare-backend.onrender.com";

export const socket = io(SOCKET_URL, {
  withCredentials: true,
});

// Helper to join a room (driver or passenger)
export function joinAsDriver(driverId: string | number) {
  socket.emit("join", `driver:${driverId}`);
}

export function joinAsPassenger(passengerId: string | number) {
  socket.emit("join", `passenger:${passengerId}`);
}
