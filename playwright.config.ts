import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  use: { baseURL: "http://127.0.0.1:4173" },
  webServer: {
    command: "npm run build && npm run serve:test",
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
});
