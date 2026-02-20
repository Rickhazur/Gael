import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'node',
        include: ['**/*.test.ts', '**/*.test.tsx'],
        globals: true,
    },
    resolve: {
        alias: { '@': path.resolve(__dirname, '.') },
    },
});
