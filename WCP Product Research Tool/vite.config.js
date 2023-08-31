import { defineConfig } from "vite";
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        app: "./html/login.html",
      },
    },
  },
  server: {
    open: "html/login.html",
  },
});
