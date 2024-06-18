module.exports = {
  git: {
    tagName: 'v${version}',
    commitMessage: 'chore: release v${version}',
  },
  github: {
    release: true,
  },
  npm: {
    publish: true,
  },
  plugins: {
    '@release-it/conventional-changelog': {
      infile: 'CHANGELOG.md',
      preset: {
        name: 'angular',
      },
    },
  },
  hooks: {
    'after:release': ['yarn pack --filename matterbridge-home-assistant.tgz'],
  },
};
