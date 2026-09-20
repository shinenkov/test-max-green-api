import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { defineConfig, loadEnv } from 'vite';
import { aliases } from './vite.shared.ts';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const greenAPI = env.VITE_GREEN_API;

  if (!greenAPI) {
    throw new Error(
      'VITE_GREEN_API is not defined. Create a .env file with VITE_GREEN_API=<your url>.'
    );
  }

  return {
    plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
    resolve: {
      alias: aliases,
    },
    define: {
      'process.env.VITE_GREEN_API': JSON.stringify(greenAPI),
    },
    server: {
      port: 3001,
    },
    preview: {
      watch: {
        usePolling: true,
      },
      host: true,
      strictPort: true,
      port: 8080,
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'antd',
                test: /[\\/]node_modules[\\/](antd|@ant-design|rc-)/,
                priority: 20,
              },
              {
                name: 'react',
                test: /[\\/]node_modules[\\/](react|react-dom|scheduler)/,
                priority: 10,
              },
            ],
          },
        },
      },
    },
  };
});
