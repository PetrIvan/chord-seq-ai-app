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
  output: "export",
  webpack: (config, {  }) => {

    config.resolve.extensions.push(".ts", ".tsx");
    config.resolve.fallback = { fs: false };

    // Both build and dev paths are used to support more platforms (some users may have issues from one or the other)
    config.plugins.push(
      new NodePolyfillPlugin(),
      new CopyPlugin({
        patterns: [
          // Build / deploy
          {
            from: "./node_modules/onnxruntime-web/dist/ort-wasm.wasm",
            to: "static/chunks",
          },
          {
            from: "./node_modules/onnxruntime-web/dist/ort-wasm-simd.wasm",
            to: "static/chunks",
          },
          // Dev
          {
            from: "./node_modules/onnxruntime-web/dist/ort-wasm.wasm",
            to: "static/chunks/app/app",
          },
          {
            from: "./node_modules/onnxruntime-web/dist/ort-wasm-simd.wasm",
            to: "static/chunks/app/app",
          },
          // Models
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
