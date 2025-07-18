// src/utils/socket.js
import { io } from "socket.io-client";

// Ambil base URL dari .env (harus tanpa /api di ujung)
const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/api$/, "") ||
  "http://localhost:3001";

// Optional: log buat debugging di dev/prod
if (import.meta.env.DEV || import.meta.env.MODE === "development") {
  console.log("[socket.io] Connecting to:", API_BASE);
}

// Connect socket.io (autoConnect = true)
const socket = io(API_BASE, {
  autoConnect: true, // langsung connect saat import
  transports: ["websocket"], // prefer websocket, lebih stabil
  // withCredentials: true, // aktifkan jika BE pakai cookie auth (opsional)
});

export default socket;
