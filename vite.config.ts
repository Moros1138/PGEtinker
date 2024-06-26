import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import path from "node:path";
import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin';

export default defineConfig({
    base: "./",
    server: {
        watch: {
            ignored: [
                path.join(process.cwd(), "storage", "app", "workspaces", "**")
            ]
        }
    },
    optimizeDeps: {
        esbuildOptions: {
            plugins: [
                importMetaUrlPlugin
            ]
        }
    },
    plugins: [
        laravel({
            input: [
                'resources/css/app/goldenlayout-base.scss',
                'resources/css/app/goldenlayout-dark-theme.scss',
                'resources/css/app/goldenlayout-light-theme.scss',
                'resources/css/normalize.scss',
                'resources/css/disagreed.scss',
                'resources/js/disagreed.js',
                'resources/css/app.scss',
                'resources/js/app-preload.ts'
            ],
            refresh: true,
        }),
    ],
    define: {
        rootDirectory: JSON.stringify(__dirname)
    },
    worker: {
        format: "es"
    }
});
