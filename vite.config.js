import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  server: {
    // Handle metadata and SVG routes
    onBeforeMiddleware({ middlewares }) {
      middlewares.use((req, res, next) => {
        // Check if the request is for metadata or SVG
        if (req.url === '/0' || req.url === '/1' || req.url === '/0.svg' || req.url === '/1.svg') {
          const filePath = path.join(process.cwd(), 'public', req.url);
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const contentType = req.url.endsWith('.svg') ? 'image/svg+xml' : 'application/json';
            res.setHeader('Content-Type', contentType);
            res.end(content);
          } catch (error) {
            next(error);
          }
        } else {
          next();
        }
      });
    }
  },
  build: {
    // Ensure metadata and SVG files are copied to dist
    copyPublicDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  }
}); 