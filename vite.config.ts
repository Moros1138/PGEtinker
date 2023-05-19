import path from "node:path";
import { defineConfig } from "vitest/dist/config";

export default defineConfig({
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
                main: path.resolve(__dirname, "src", "frontend", "index.ts"),
                jquery: path.resolve(__dirname, "src", "frontend", "jquery.js"),
            }
        }
    }
});
