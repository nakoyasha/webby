import { build } from "vite";
import { join } from "path";

await build({
  root: "src/client",
  configFile: "src/client/vite.config.ts",
  mode: "debug",
  build: {
    outDir: join(process.cwd(), "/dist/client"),
    emptyOutDir: true,
  },
  publicDir: join(process.cwd(), "public"),
});
