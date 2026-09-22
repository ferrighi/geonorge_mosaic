import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
//const __dirname = import.meta.dirname;
const __dirname = path.dirname(__filename);

const port = 5173;
const origin = process.env.DDEV_PRIMARY_URL;


export default defineConfig({
  base: "./",
  build: {
    sourcemap: true,
    manifest: true,
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        GeoNorgeMosaic: path.resolve(__dirname, "./src/main.js"),
      },
      output: {
        codeSplitting: {
          groups: [
            {
              name: "proj4",
              test: /node_modules[\\/]proj4[\\/]/,
              priority: 20,
            },
          ],
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: port,
    origin: origin,
    cors: { origin },
    // ----------------
    host: '0.0.0.0',
    port: port,
    origin: `${origin}:${port}`,
    strictPort: true,
    allowedHosts: ["geonorge-mosaic.ddev.site", "localhost"],
  },

});
