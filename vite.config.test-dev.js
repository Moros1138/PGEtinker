import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import path from "node:path";

export default defineConfig({
    base: "/frontend",
    server: {
        origin: "https://test.pgetinker.com/frontend",
        watch: {
            ignored: [
                path.join(process.cwd(), "storage", "app", "workspaces", "**")
            ]
        }
    },
    plugins: [
        laravel({
            input: [
                'resources/css/goldenlayout-base.scss',
                'resources/css/goldenlayout-dark-theme.scss',
                'resources/css/goldenlayout-light-theme.scss',
                'resources/css/app.scss',
                'resources/js/app.js'
            ],
            refresh: true,
        }),
    ],
});
