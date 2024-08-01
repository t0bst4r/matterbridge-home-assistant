# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 2.3.3 (2024-08-01)


### 🐛 Bug Fixes

* only include included entities into warnings ([#238](https://github.com/t0bst4r/matterbridge-home-assistant/issues/238)) ([4a0e8f2](https://github.com/t0bst4r/matterbridge-home-assistant/commit/4a0e8f29bc5872c9115a305f815abcb23eaaca70))



## 2.3.2 (2024-08-01)


### 🐛 Bug Fixes

* invert covers and make them nullsafe ([#234](https://github.com/t0bst4r/matterbridge-home-assistant/issues/234), [#235](https://github.com/t0bst4r/matterbridge-home-assistant/issues/235)) ([511574e](https://github.com/t0bst4r/matterbridge-home-assistant/commit/511574e63864166a7cc12fd3ab49ee0bcb5245af))



## 2.3.1 (2024-07-29)


### 🐛 Bug Fixes

* **cover:** add identify aspect ([#233](https://github.com/t0bst4r/matterbridge-home-assistant/issues/233)) ([e82595e](https://github.com/t0bst4r/matterbridge-home-assistant/commit/e82595ef78899b963a0db0ee1f76bab0c33b90ea))



## 2.3.0 (2024-07-28)


### ✨ Features

* **cover:** add basic support for covers ([#86](https://github.com/t0bst4r/matterbridge-home-assistant/issues/86)) ([c6d3fac](https://github.com/t0bst4r/matterbridge-home-assistant/commit/c6d3fac0a37042367ebbdb7a17e724d7c2897e0f))



## 2.2.0 (2024-07-28)


### ✨ Features

* **docker:** allow specifiying matter and frontend ports ([#229](https://github.com/t0bst4r/matterbridge-home-assistant/issues/229)) ([2fd1b5a](https://github.com/t0bst4r/matterbridge-home-assistant/commit/2fd1b5a3920703459575e31d040c55bc3b8e3a46))



## 2.1.3 (2024-07-28)


### 🐛 Bug Fixes

* improved documentation and logging ([3751d10](https://github.com/t0bst4r/matterbridge-home-assistant/commit/3751d109c75d3a971abaed73ce52181e5a7a3af8))



## 2.1.2 (2024-07-27)


### 🐛 Bug Fixes

* revert conventional changelog to 7.x ([#222](https://github.com/t0bst4r/matterbridge-home-assistant/issues/222)) ([b1fd8a3](https://github.com/t0bst4r/matterbridge-home-assistant/commit/b1fd8a3b05e6fab891f0fa49fe76341d3a2a8459))



## 2.1.1 (2024-07-26)


### 🚀 Chore

* add more detailed manual installation instructions ([#214](https://github.com/t0bst4r/matterbridge-home-assistant/issues/214)) ([b6d25fe](https://github.com/t0bst4r/matterbridge-home-assistant/commit/b6d25fe569ae6243860a25784271c423c0cf2aab))



## 2.1.0 (2024-07-24)


### ✨ Features

* support include or exclude by label or integration [#210](https://github.com/t0bst4r/matterbridge-home-assistant/issues/210) [#109](https://github.com/t0bst4r/matterbridge-home-assistant/issues/109) ([fed5c7c](https://github.com/t0bst4r/matterbridge-home-assistant/commit/fed5c7c300b40a546a3c5e067b6c4b7652ae4e7d))



## 2.0.3 (2024-07-24)


### 🐛 Bug Fixes

* remove legacy peer deps ([07ca7a4](https://github.com/t0bst4r/matterbridge-home-assistant/commit/07ca7a4c4cead20b06d092dc5e3a3dafcca1bf6f))



## 2.0.2 (2024-07-24)


### 🐛 Bug Fixes

* remove failure state from docker-entrypoint ([3175127](https://github.com/t0bst4r/matterbridge-home-assistant/commit/3175127da204ec4fd04830becbf6ac0c7c9cd28a))



## 2.0.1 (2024-07-24)


### 🚀 Chore

* update node-types to 20 ([45bdaa6](https://github.com/t0bst4r/matterbridge-home-assistant/commit/45bdaa6e7443a9f116cc0390010bb7222c7338bf))



## 2.0.0 (2024-07-24)


### ⚠ BREAKING CHANGES

* Version 2 requires several configuration changes. See the documentation for more details.

- ~~In version 1.x `matterbridge` was not listed as a `dependencies` or `peerDependency`. This has been changed in version
  2.0.0. It is now listed as a peer dependency.
  When installed in a local `package.json` file, this is not a problem. But since `matterbridge` installs all its
  plugins globally, this will lead to an error running `matterbridge` with `matterbridge-home-assistant`, because of
  npm's "new" (>= 7) strategy for peer-dependencies.
  To solve this, you need to enable [legacy-peer-deps](https://docs.npmjs.com/cli/v10/using-npm/config#legacy-peer-deps)
  in your npm config (`npm config set legacy-peer-deps true`) or in an environment
  variable (`npm_config_legacy_peer_deps=true`). In the pre-built docker image and the native Home Assistant Addon, this
  is already configured.~~
- In version 1.x this plugin was meant to be configured using multiple environment variables. Due to the growing number
  of configuration options, this has been changed. This plugin requires to be configured using a configuration JSON file
  or one single environment variable containing the whole JSON configuration.
  **Please see the configuration section in the projects readme.**

### ✨ Features

* split matterbridge-home-assistant into multiple libraries ([3b87b78](https://github.com/t0bst4r/matterbridge-home-assistant/commit/3b87b7844e0475b03f35a56f1bdeaa7bf6a5b599))
