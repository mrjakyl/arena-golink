import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  use: { baseURL: "http://127.0.0.1:4318", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 4318",
    url: "http://127.0.0.1:4318/login",
    reuseExistingServer: false,
    env: {
      NEXTAUTH_URL: "http://127.0.0.1:4318",
      NEXTAUTH_SECRET: "local-browser-test-secret-not-for-deployment",
      GOOGLE_CLIENT_ID: "local-test-client",
      GOOGLE_CLIENT_SECRET: "local-test-client-secret",
      AUTH_ALLOWED_EMAILS: "teammate@team.example",
      AUTH_ALLOWED_DOMAINS: "",
      DATABASE_URL: "",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
