import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { version, config } from "./package.json";

export default defineConfig({
  define: {
    BUILD_VERSION: `'${version}'`,
    FIRMWARE_VERSION: `'${config.firmwareVersion}'`,
  },
  plugins: [sveltekit()],
});
