import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // Backend CORS only allows http://localhost:5173, so never silently drift
    // to 5174 — fail loudly instead if the port is taken.
    strictPort: true,
  },
});
