import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],

  server: {
    port: 5173, // Ensure a valid port is set
    host: true, // Allows external access if needed
    allowedHosts: ['localhost', 'dh-dev-eus-appsrvc-admindash-001-angbcsdpe7eghcae.eastus-01.azurewebsites.net', 'dh-prod-eus-appsrvc-admindash-001-d7cyh3e2afg7bsf0.eastus-01.azurewebsites.net'],
    logLevel:'debug'
  }
});