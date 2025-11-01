import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: ".", // ensures proto is the root
  publicDir: "public", // serve your static files
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html")
      }
    },
    outDir: "dist"
  }
});
