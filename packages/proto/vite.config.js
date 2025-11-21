import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // main app (your existing index.html)
        main: resolve(__dirname, "index.html"),

        // 👇 add login.html as a second entry page (Lab 12 login page)
        login: resolve(__dirname, "login.html")
      }
    }
  }
});
