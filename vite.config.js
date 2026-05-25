import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: 4321,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-antd": ["antd", "@ant-design/icons"],
          "vendor-mtw": ["@material-tailwind/react"],
          "vendor-fa": [
            "@fortawesome/fontawesome-svg-core",
            "@fortawesome/free-solid-svg-icons",
            "@fortawesome/free-regular-svg-icons",
            "@fortawesome/free-brands-svg-icons",
            "@fortawesome/react-fontawesome",
          ],
          "vendor-state": ["react-redux", "@reduxjs/toolkit", "redux"],
          "vendor-query": ["react-query"],
          "vendor-swiper": ["swiper/react", "swiper/modules", "swiper/css"],

          "vendor-utils": ["axios", "dayjs", "moment", "js-cookie", "crypto-js"],
        },
      },
    },
    sourcemap: false,
    minify: "esbuild",
    cssMinify: true,
    cssCodeSplit: true,
  },
});
