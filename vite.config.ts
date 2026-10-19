import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { basename } from "path";
import { fileURLToPath } from "url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  css: {
    modules: {
      // readable and stable, so rules typed into custom.css can target them
      generateScopedName: (local: string, file: string) =>
        `${basename(file).replace(/\.module\.css$/, "")}_${local}`,
    },
  },
  resolve: {
    alias: {
        // for TypeScript path alias import like : @/x/y/z
        "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
