import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      exclude: [
        '**/dist',
        '**/*.config.ts',
        '**/*.ignore.ts',
        '**/*.js',
      ],
      provider: 'v8',
      reporter: ['cobertura', 'html', 'text'],
      reportsDirectory: 'reports/',
    },
    outputFile: 'reports/junit.xml',
    reporters: ['default', 'junit'],
  },
});
