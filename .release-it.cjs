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
    '@j-ulrich/release-it-regex-bumper': {
      out: {
        file: 'README.md',
        search: 'matterbridge-home-assistant&v=([0-9.]+)',
        replace: 'matterbridge-home-assistant&v={{version}}',
      },
    },
  },
  hooks: {
    'after:release': ['yarn pack --filename matterbridge-home-assistant.tgz'],
  },
};
