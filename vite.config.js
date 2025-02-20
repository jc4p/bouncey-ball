import { defineConfig } from 'vite';
import fs from 'fs/promises';
import path from 'path';

// Custom plugin to handle metadata routes
function metadataPlugin() {
  return {
    name: 'metadata-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Handle both /0 and /metadata/0 paths
        const isMetadata = req.url === '/0' || req.url === '/1' || 
                          req.url === '/metadata/0' || req.url === '/metadata/1';
        
        if (isMetadata) {
          try {
            // Extract the ID (0 or 1) from either URL pattern
            const id = req.url.split('/').pop();
            // Always read from the metadata directory
            const filePath = path.resolve(__dirname, 'public/metadata', id);
            const content = await fs.readFile(filePath, 'utf-8');
            
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(content),
              'Access-Control-Allow-Origin': '*'
            });
            res.end(content);
            return;
          } catch (e) {
            next(e);
          }
        }
        next();
      });
    },
    configurePreviewServer(server) {
      // Same configuration for preview server
      this.configureServer(server);
    }
  };
}

export default defineConfig({
  plugins: [metadataPlugin()],
  build: {
    copyPublicDir: true
  }
}); 