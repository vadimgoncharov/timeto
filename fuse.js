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

const DEV_DIST_DIR = 'dist';
const PROD_DIST_DIR = 'docs';

const distDir = () => {
  return isProduction ? PROD_DIST_DIR : DEV_DIST_DIR;
};

let fuse, app, vendor, isProduction;

Sparky.task("config", () => {
  fuse = new FuseBox({
    homeDir: "src/",
    sourceMaps: !isProduction,
    hash: isProduction,
    output: `${distDir()}/$name.js`,
    plugins: [
      [
        SassPlugin(),
        PostCSSPlugin({
          plugins: [autoprefixer],
        }),
        CSSResourcePlugin({
          dist: `${distDir()}/assets`,
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
        removeExportsInterop: true,
        uglify: true,
        treeshake: true,
      }),

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

Sparky.task("clean", () => {
  return Sparky.src("dist/").clean("dist/");
});
Sparky.task("prod-env", ["clean"], () => { isProduction = true })
Sparky.task("production", ["prod-env", "config"], () => {
  // comment out to prevent dev server from running (left for the demo)
  // fuse.dev();
  return fuse.run();
});
