import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [],
    include: ['tests/**/*.test.ts', 'src/**/*.spec.ts'],
    environment: "jsdom",
    reporters: ["default", "junit"],
    outputFile: "test-results.xml",
  },
})