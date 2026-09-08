import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/](?:react|react-dom)[\\/]/,
              priority: 30,
            },
            {
              name: "rocksoul-ui",
              test: /node_modules[\\/]@rocksoul[\\/]ui[\\/]/,
              priority: 20,
            },
            {
              name: "vendor",
              test: /node_modules/,
              minSize: 20_000,
              priority: 10,
            },
          ],
        },
      },
    },
  },
})
