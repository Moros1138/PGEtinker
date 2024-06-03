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
                'resources/css/goldenlayout-base.scss',
                'resources/css/goldenlayout-dark-theme.scss',
                'resources/css/goldenlayout-light-theme.scss',
                'resources/css/disagreed.scss',
                'resources/js/disagreed.js',
                'resources/css/app.scss',
                'resources/js/app.js'
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
