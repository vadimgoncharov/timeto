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
const fse = require('fs-extra');
const autoprefixer = require('autoprefixer');

const DEV_DIST_DIR = 'dev/docs';
const PROD_DIST_DIR = 'docs';

const distDir = () => {
  return isProduction ? PROD_DIST_DIR : DEV_DIST_DIR;
};

let fuse, app, vendor, isProduction;

Sparky.task("config", () => {
  fuse = new FuseBox({
    target: "browser",
    homeDir: "src/",
    sourceMaps: !isProduction,
    hash: false,
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
        bakeApiIntoBundle: 'app',
        containedAPI : true,
      }),

    ],
  });
  // vendor = fuse
  //   .bundle("vendor")
  //   .instructions("~ index.tsx");

  app = fuse.bundle("app").instructions("> index.tsx")
});

Sparky.task("default", ["clean", "config", "copy-assets"], () => {
  fuse.dev();
// add dev instructions
  app.watch().hmr();
  return fuse.run();
});

Sparky.task("clean", () => {
  return Sparky.src("dev/").clean("dev/");
});
Sparky.task('copy-assets', () => {
  return fse.copy('docs/assets', 'dev/docs/assets');
});
Sparky.task("prod-env", ["clean"], () => { isProduction = true })
Sparky.task("production", ["prod-env", "config"], () => {
  // comment out to prevent dev server from running (left for the demo)
  // fuse.dev();
  return fuse.run();
});
