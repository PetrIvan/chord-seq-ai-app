/** @type {import("next").NextConfig} */
const withPWA = require("next-pwa");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const nextConfig = {
  ...withPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
  })
}

module.exports = {
  ...nextConfig,
  reactStrictMode: true,
  distDir: "build",
  webpack: (config, {  }) => {

    config.resolve.extensions.push(".ts", ".tsx");
    config.resolve.fallback = { fs: false };

    config.plugins.push(
      new NodePolyfillPlugin(),
      new CopyPlugin({
        patterns: [
          {
            from: "./node_modules/onnxruntime-web/dist/ort-wasm.wasm",
            //to: "static/chunks", // build / deploy
            to: "static/chunks/app/app", // dev
          },
          {
            from: "./node_modules/onnxruntime-web/dist/ort-wasm-simd.wasm",
            //to: "static/chunks", // build / deploy
            to: "static/chunks/app/app", // dev
          },
          {
            from: "./public/models",
            to: "static/chunks/app",
          },
        ],
      }),
    );

    return config;
  }
}
