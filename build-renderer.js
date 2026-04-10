const esbuild = require('esbuild');
const dotenv = require('dotenv');

const env = dotenv.config().parsed ?? {};

const define = {
  'process.env.NODE_ENV': '"production"',
};
for (const [k, v] of Object.entries(env)) {
  define[`process.env.${k}`] = JSON.stringify(v);
}

esbuild.build({
  entryPoints: ['src/renderer.tsx'],
  bundle: true,
  outfile: 'dist/renderer.js',
  platform: 'browser',
  define,
}).catch(() => process.exit(1));
