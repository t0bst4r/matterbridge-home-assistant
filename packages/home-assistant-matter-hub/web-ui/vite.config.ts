import react from '@vitejs/plugin-react-swc';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { defineConfig, Plugin } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), fixSourceMaps()],
});

function fixSourceMaps(): Plugin {
  let currentInterval: NodeJS.Timeout | null = null;
  return {
    name: 'fix-source-map',
    enforce: 'post',
    transform: function (source) {
      if (currentInterval) {
        return;
      }
      currentInterval = setInterval(function () {
        const nodeModulesPath = path.join(__dirname, 'node_modules', '.vite', 'deps');
        if (fs.existsSync(nodeModulesPath)) {
          if (currentInterval) {
            clearInterval(currentInterval);
          }
          currentInterval = null;
          const files = fs.readdirSync(nodeModulesPath);
          files.forEach(function (file) {
            const mapFile = file + '.map';
            const mapPath = path.join(nodeModulesPath, mapFile);
            if (fs.existsSync(mapPath)) {
              const mapData: { sources: string[] } = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
              if (!mapData.sources || mapData.sources.length == 0) {
                mapData.sources = [path.relative(mapPath, path.join(nodeModulesPath, file))];
                fs.writeFileSync(mapPath, JSON.stringify(mapData), 'utf8');
              }
            }
          });
        }
      }, 100);
      return source;
    },
  };
}
