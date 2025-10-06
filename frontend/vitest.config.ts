import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import react from '@vitejs/plugin-react'

export default defineConfig({
   plugins: [react(), tsconfigPaths()],
   test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: '__tests__/setup.ts',
   },
})
