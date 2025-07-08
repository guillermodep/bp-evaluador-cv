import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    cors: true, // Habilitar CORS para todas las solicitudes
    hmr: {
      overlay: true, // Mostrar errores en una superposición
    },
  },
  optimizeDeps: {
    include: ['pdf-parse', 'mammoth'], // Incluir explícitamente las dependencias que podrían causar problemas
    esbuildOptions: {
      target: 'es2020', // Establecer un objetivo de compilación moderno
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true, // Generar sourcemaps para facilitar la depuración
    commonjsOptions: {
      transformMixedEsModules: true, // Ayuda con módulos mixtos CommonJS/ES
    },
  },
}));
