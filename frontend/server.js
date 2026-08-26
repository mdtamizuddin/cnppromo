import express from "express";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 4321;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, "dist");

app.use(compression());

const CACHE_LONG = "public, max-age=31536000, immutable";
const CACHE_SHORT = "public, max-age=3600, must-revalidate";

app.use(express.static(distPath, {
  setHeaders(res, filePath) {
    if (filePath.endsWith(".js") || filePath.endsWith(".css")) {
      res.setHeader("Cache-Control", CACHE_LONG);
    } else if (/\.(png|jpg|jpeg|gif|svg|webp|avif|ico|woff2?)$/i.test(filePath)) {
      res.setHeader("Cache-Control", CACHE_LONG);
    }
  },
}));

app.get("*", (req, res) => {
  res.setHeader("Cache-Control", CACHE_SHORT);
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
