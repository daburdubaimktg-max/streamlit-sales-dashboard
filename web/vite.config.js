import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the build works on any static host (Netlify, GitHub Pages,
// Vercel, a subfolder, etc.).
export default defineConfig({
  plugins: [react()],
  base: "./",
});
