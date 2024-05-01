import esbuild from "esbuild";
import { build } from "vite";
import { join } from "path";

/**
 * @type {esbuild.Plugin}
 */
const makeAllPackagesExternalPlugin = {
  name: "make-all-packages-external",
  setup(build) {
    const filter = /^[^./@]|^\.[^./]|^\.\.[^/]/; // Must not start with "/" or "./" or "../"
    build.onResolve({ filter }, (args) => ({
      path: args.path,
      external: true,
    }));
  },
};

esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  plugins: [makeAllPackagesExternalPlugin],
  //   external: ["express"],
  //   minify: true,
  outfile: "dist/server/index.js",
  treeShaking: true,
  platform: "node",
  logLevel: "info",
});

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
