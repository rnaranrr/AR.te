// Configuração: Vite (plugins, hosts permitidos e alias @ para a pasta src)
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { fileURLToPath } from "node:url";

// Documentação: https://vite.dev/config/
export default defineConfig({
  // Tailwind, React e importação de SVG como componente
  plugins: [tailwindcss(), react(), svgr()],
  // Aceita qualquer host (necessário para acessar por túnel, como o ngrok)
  server: {
    allowedHosts: true,
  },
  // O alias @ aponta para a pasta src (import "@/...")
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
