/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { checkoutMock } from './mock/checkoutMock.ts'

export default defineConfig({
  plugins: [react(), checkoutMock()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
