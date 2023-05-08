import path from "node:path";
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
    build: {
        manifest: true,
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, "src", "main.ts"),
                jquery: path.resolve(__dirname, "src", "jquery.js"),
            }
        }
    }
});
