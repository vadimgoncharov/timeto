const {
  FuseBox,
  CSSPlugin,
  SassPlugin,
  PostCSSPlugin,
  QuantumPlugin,
  WebIndexPlugin,
  Sparky,
} = require("fuse-box");
const autoprefixer = require('autoprefixer');

let fuse, app, vendor, isProduction;

Sparky.task("config", () => {
  fuse = new FuseBox({
    homeDir: "src/",
    sourceMaps: !isProduction,
    hash: isProduction,
    output: "dist/$name.js",
    plugins: [
      [
        SassPlugin(),
        PostCSSPlugin({
          plugins: [autoprefixer],
        }),
        CSSPlugin(),
      ],
      WebIndexPlugin({
        template: "src/index.html"
      }),
      isProduction && QuantumPlugin({
        removeExportsInterop: false,
        uglify: true
      })
    ],
  });
// vendor
  vendor = fuse
    .bundle("vendor")
    .instructions("~ index.tsx")

// bundle app
  app = fuse.bundle("app").instructions("> [index.tsx]")
});

Sparky.task("default", ["clean", "config"], () => {
  fuse.dev();
// add dev instructions
  app.watch().hmr()
  return fuse.run();
});

Sparky.task("clean", () => Sparky.src("dist/").clean("dist/"));
Sparky.task("prod-env", ["clean"], () => { isProduction = true })
Sparky.task("dist", ["prod-env", "config"], () => {
  // comment out to prevent dev server from running (left for the demo)
  fuse.dev();
  return fuse.run();
});
