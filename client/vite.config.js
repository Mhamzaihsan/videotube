// filepath: c:\Users\ADMIN\OneDrive\Desktop\Videotube\client\vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const baseUrl = String(process.env.VITE_API_BASE_URL); // Use the same variable

export default defineConfig({
  server: {
    proxy: {
      "/api": baseUrl || "http://localhost:8000", // Use your backend port
    },
    changeOrigin: true,
    secure: false,
  },
  plugins: [react()],
});