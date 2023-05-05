import { resolve } from "path";
import monacoEditorPlugin from "vite-plugin-monaco-editor";
import { defineConfig } from "vitest/dist/config";

export default defineConfig({
    base: './',
    test: {
        reporters: "verbose",
        globals: true,
        globalSetup: [
            "./tests/globalSetup.ts",
        ],
    },
    plugins: [
        // dirty hack
        (monacoEditorPlugin as any).default({
            languageWorkers: ['editorWorkerService'],
            customWorkers: [],
        }),
    ],
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                player: resolve(__dirname, 'player/index.html'),
            }
        }
    }
});
