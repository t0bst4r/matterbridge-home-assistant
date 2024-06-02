import { typescript } from 'projen';
import { TypeScriptModuleResolution } from 'projen/lib/javascript/index.js';

const project = new typescript.TypeScriptProject({
  defaultReleaseBranch: 'main',
  name: 'matterbridge-home-assistant',
  projenrcJs: true,

  deps: [
    'home-assistant-js-websocket',
    'glob-to-regexp',
    'node-ansi-logger',
    'ws',
  ],
  peerDeps: [
    '@project-chip/matter.js',
    '@project-chip/matter-node.js',
    'matterbridge',
  ],
  devDeps: [
    '@types/glob-to-regexp',
    '@types/ws',
    '@dotenvx/dotenvx',
  ],

  releaseToNpm: true,
  npmProvenance: false,

  tsconfig: {
    compilerOptions: {
      target: 'esnext',
      lib: ['ESNext'],
      module: 'nodenext',
      moduleResolution: TypeScriptModuleResolution.NODE_NEXT,
      skipLibCheck: true,
    },
  },

  gitignore: [
    '.idea',
    '/.env',
    '/.env.*',
  ],
});
project.package.addField('type', 'module');

project.addTask('serve', {
  steps: [
    { spawn: 'compile' },
    { exec: 'matterbridge -factoryreset' },
    { exec: 'matterbridge -add ./' },
    { exec: 'dotenvx run -f .env.local -- matterbridge -bridge' },
  ],
});

project.synth();
