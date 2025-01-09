import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { version } from "./package.json";

export default defineConfig({
  define: {
    __BUILD_VERSION__: `'${version}'`,
  },
  plugins: [sveltekit()],
});
