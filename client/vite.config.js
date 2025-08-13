import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use React's automatic JSX runtime
      jsxRuntime: "automatic",
    }),
  ],
  build: {
    // Ensure compatibility with modern browsers
    target: "es2020",
    // Generate source maps for debugging
    sourcemap: true,
  },
  esbuild: {
    // Configure JSX for React 17+ automatic runtime
    jsx: "automatic",
  },
});
