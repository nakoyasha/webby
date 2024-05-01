import esbuild from "esbuild";

/**
 * @type {esbuild.Plugin}
 */
const makeAllPackagesExternalPlugin = {
  name: "make-all-packages-external",
  setup(build) {
    const filter = /^[^./]|^\.[^./]|^\.\.[^/]/; // Must not start with "/" or "./" or "../"
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
