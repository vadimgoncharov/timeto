const {
  FuseBox,
  CSSResourcePlugin,
  CSSPlugin,
  SassPlugin,
  PostCSSPlugin,
  ImageBase64Plugin,
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
    output: "docs/$name.js",
    plugins: [
      [
        SassPlugin(),
        PostCSSPlugin({
          plugins: [autoprefixer],
        }),
        CSSResourcePlugin({
          dist: `docs/assets`,
          resolve: (f) => `/assets/${f}`,
        }),
        CSSPlugin(),
      ],
      ImageBase64Plugin({
        useDefault: true,
      }),
      WebIndexPlugin({
        template: "src/index.html"
      }),
      isProduction && QuantumPlugin({
        removeExportsInterop: false,
        uglify: false
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

Sparky.task("clean", () => Sparky.src("docs/").clean("docs/"));
Sparky.task("prod-env", ["clean"], () => { isProduction = true })
Sparky.task("dist", ["prod-env", "config"], () => {
  // comment out to prevent dev server from running (left for the demo)
  // fuse.dev();
  return fuse.run();
});
