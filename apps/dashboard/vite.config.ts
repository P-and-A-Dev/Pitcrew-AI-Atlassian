
import { defineConfig } from "vitest/config";

import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    base: './',
    server: {
        port: 5173
    },
    build: {
        outDir: '../../apps/forge-app/static/dashboard',
        emptyOutDir: true
    },
    test:  {
        globals: true,
        environment: "jsdom",
        setupFiles: "./src/test/setup.ts",
    },
})
