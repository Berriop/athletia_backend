import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      all: true,
      include: ['src/**/*.ts'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/__tests__/',
        'src/**/*.d.ts',
        'src/server.ts',
        'src/infrastructure/container.ts',
        'src/infrastructure/database/prisma.ts',
        'src/domain/**',
      ],
    },
    include: ['src/__tests__/**/*.test.ts'],
  },
});
