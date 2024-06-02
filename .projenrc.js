import { typescript } from 'projen';
import { TypeScriptModuleResolution } from 'projen/lib/javascript/index.js';

const project = new typescript.TypeScriptProject({
  defaultReleaseBranch: 'main',
  name: 'matterbridge-home-assistant',
  projenrcJs: true,

  deps: [
    'node-ansi-logger',
  ],
  peerDeps: [
    '@project-chip/matter.js',
    '@project-chip/matter-node.js',
    'matterbridge',
  ],

  tsconfig: {
    compilerOptions: {
      target: 'esnext',
      lib: ['ESNext'],
      module: 'nodenext',
      moduleResolution: TypeScriptModuleResolution.NODE_NEXT,
      skipLibCheck: true,
    },
  },

  gitignore: ['.idea'],
});
project.package.addField('type', 'module');

project.addTask('serve', {
  steps: [
    { spawn: 'compile' },
    { exec: 'matterbridge -factoryreset' },
    { exec: 'matterbridge -add ./' },
    { exec: 'matterbridge -bridge' },
  ],
});

project.synth();
