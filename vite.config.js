import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: [
        "**/playwright-report/**",
        "**/test-results/**",
        "**/assets/source/**",
        "**/supabase/.temp/**",
      ],
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        design: "design.html",
        presentation: "presentation.html",
      },
    },
  },
});
