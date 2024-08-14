import esbuild from 'esbuild';
import path from 'node:path';

const __dirname = import.meta.dirname;

/**
 * @param {RegExp[]} noExternals
 * @returns {{name: string, setup(*): void}}
 */
function externalizeAllPackagesExcept(noExternals) {
  return {
    name: 'noExternal-plugin',
    setup(build) {
      if (noExternals.length > 0) {
        build.onResolve({ filter: /(.*)/ }, (args) => {
          if (args.kind !== 'import-statement' || args.path.startsWith('.') || args.path.startsWith('@/')) {
            return;
          }

          if (args.kind === 'import-statement' && !noExternals.some((regExp) => regExp.test(args.path))) {
            return { path: args.path, external: true };
          }
        });
      }
    },
  };
}

void esbuild.build({
  entryPoints: [path.join(__dirname, 'src/index.ts')],
  outfile: path.join(__dirname, 'lib/index.js'),
  bundle: true,
  treeShaking: true,
  platform: 'node',
  format: 'esm',
  charset: 'utf8',
  logLevel: 'debug',
  sourcemap: 'linked',
  plugins: [externalizeAllPackagesExcept([/^@home-assistant-matter-hub\/.*/])],
});
