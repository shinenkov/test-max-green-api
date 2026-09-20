import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { aliases } from './vite.shared.ts';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: aliases },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test/**',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/App.tsx',
        'src/types/**',
        'src/constants/**',
        'src/context/authContext.ts',
        'src/context/AuthProvider.tsx',
        'src/components/ChatPage/ChatPage.tsx',
        'src/components/ChatPage/ChatWindow.tsx',
        'src/hooks/useAuth.ts',
      ],
      thresholds: {
        statements: 60,
        branches: 55,
        functions: 60,
        lines: 60,
      },
    },
  },
});
