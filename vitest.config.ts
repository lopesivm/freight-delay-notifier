import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts', '**/__tests__/**/*.test.ts'],
    setupFiles: [], // add a setup file if needed
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});
