# Changelog

## [1.0.0](https://github.com/t0bst4r/matterbridge-home-assistant/compare/v0.5.2...v1.0.0) (2024-06-16)


### ⚠ BREAKING CHANGES

* Entity marked as hidden in Home Assistant are automatically hidden in Matter.

### Features

* refactor device types to aspects, add ([#52](https://github.com/t0bst4r/matterbridge-home-assistant/issues/52)) added hidden attribute ([9bc4126](https://github.com/t0bst4r/matterbridge-home-assistant/commit/9bc4126b4216c0fdf7830c5ec58cdd3b7ba1d7f9))


### Bug Fixes

* **deps:** update dependency @dotenvx/dotenvx to v0.44.4 ([#75](https://github.com/t0bst4r/matterbridge-home-assistant/issues/75)) ([63fd48b](https://github.com/t0bst4r/matterbridge-home-assistant/commit/63fd48bd41839f219fcbf6a30fad14dccc85c1a3))
* **deps:** update npm ([#73](https://github.com/t0bst4r/matterbridge-home-assistant/issues/73)) ([af80419](https://github.com/t0bst4r/matterbridge-home-assistant/commit/af8041907703d506ca265c5fc802672813ee2e89))

## [0.5.2](https://github.com/t0bst4r/matterbridge-home-assistant/compare/matterbridge-home-assistant-v0.5.1...matterbridge-home-assistant-v0.5.2) (2024-06-14)


### Bug Fixes

* [#69](https://github.com/t0bst4r/matterbridge-home-assistant/issues/69) added null checks to prevent sending null to matter ([#71](https://github.com/t0bst4r/matterbridge-home-assistant/issues/71)) ([7162542](https://github.com/t0bst4r/matterbridge-home-assistant/commit/7162542a78e673b98fd11e049c47334fe582fe69))

## [0.5.1](https://github.com/t0bst4r/matterbridge-home-assistant/compare/matterbridge-home-assistant-v0.5.0...matterbridge-home-assistant-v0.5.1) (2024-06-13)


### Bug Fixes

* **docker:** fixed config file condition ([3c25b86](https://github.com/t0bst4r/matterbridge-home-assistant/commit/3c25b86ce03962edaeb18c599b4f1c4f127ea63d))

## [0.5.0](https://github.com/t0bst4r/matterbridge-home-assistant/compare/matterbridge-home-assistant-v0.4.0...matterbridge-home-assistant-v0.5.0) (2024-06-13)


### Features

* **docker:** [#44](https://github.com/t0bst4r/matterbridge-home-assistant/issues/44) add config-file support for docker deployments ([#63](https://github.com/t0bst4r/matterbridge-home-assistant/issues/63)) ([f3c38ee](https://github.com/t0bst4r/matterbridge-home-assistant/commit/f3c38ee300f3210422662f264c45f7239ec0bfe7))


### Bug Fixes

* update dependencies and add missing docker build-args ([#65](https://github.com/t0bst4r/matterbridge-home-assistant/issues/65)) ([cfb69f5](https://github.com/t0bst4r/matterbridge-home-assistant/commit/cfb69f5855079e9f36fd790728a32b86c63d98f2))

## [0.4.0](https://github.com/t0bst4r/matterbridge-home-assistant/compare/matterbridge-home-assistant-v0.3.0...matterbridge-home-assistant-v0.4.0) (2024-06-13)


### Features

* [#49](https://github.com/t0bst4r/matterbridge-home-assistant/issues/49) added support for HS, RGB color modes and color temperature ([#51](https://github.com/t0bst4r/matterbridge-home-assistant/issues/51)) ([ad74c4d](https://github.com/t0bst4r/matterbridge-home-assistant/commit/ad74c4d85a0ca608e3c749d487ec49fd0d3c13eb))
* [#52](https://github.com/t0bst4r/matterbridge-home-assistant/issues/52) Hide entities based on their hidden attribute ([#58](https://github.com/t0bst4r/matterbridge-home-assistant/issues/58)) ([b4c6346](https://github.com/t0bst4r/matterbridge-home-assistant/commit/b4c634641b38e6b3748489fef342ef5a764a6006))
* **config:** [#45](https://github.com/t0bst4r/matterbridge-home-assistant/issues/45) changed include to match one of domain or pattern ([#48](https://github.com/t0bst4r/matterbridge-home-assistant/issues/48)) ([ea20387](https://github.com/t0bst4r/matterbridge-home-assistant/commit/ea20387108fe7ceb34b3744f7b1f0859ba6ab8fa))


### Bug Fixes

* **deps:** update actions/stale action to v9 ([#57](https://github.com/t0bst4r/matterbridge-home-assistant/issues/57)) ([41143a3](https://github.com/t0bst4r/matterbridge-home-assistant/commit/41143a3efcb5d763e126e89d382d28202c133d08))
* **deps:** update dependency prettier to v3.3.2 ([#50](https://github.com/t0bst4r/matterbridge-home-assistant/issues/50)) ([dfe1af2](https://github.com/t0bst4r/matterbridge-home-assistant/commit/dfe1af2a1f0210e25e9fb40843cf96f471b09a02))
* **deps:** update dependency typescript-eslint to v7.13.0 ([#41](https://github.com/t0bst4r/matterbridge-home-assistant/issues/41)) ([4be75b7](https://github.com/t0bst4r/matterbridge-home-assistant/commit/4be75b7c413c4f32a9e2a783d6688631a3dadb66))

## [0.3.0](https://github.com/t0bst4r/matterbridge-home-assistant/compare/matterbridge-home-assistant-v0.2.5...matterbridge-home-assistant-v0.3.0) (2024-06-10)


### Features

* added scripts and automations as generic switches ([#38](https://github.com/t0bst4r/matterbridge-home-assistant/issues/38)) ([db18fef](https://github.com/t0bst4r/matterbridge-home-assistant/commit/db18fef3a52e98c36c686504020510e95c297945))


### Bug Fixes

* **deps:** update docker/build-push-action action to v5.4.0 ([#30](https://github.com/t0bst4r/matterbridge-home-assistant/issues/30)) ([4dba47f](https://github.com/t0bst4r/matterbridge-home-assistant/commit/4dba47f12789f83a03b96f9935c24c60efe66626))

## [0.2.5](https://github.com/t0bst4r/matterbridge-home-assistant/compare/matterbridge-home-assistant-v0.2.4...matterbridge-home-assistant-v0.2.5) (2024-06-10)


### Bug Fixes

* **docker:** made entrypoint executable ([#35](https://github.com/t0bst4r/matterbridge-home-assistant/issues/35)) ([0249b87](https://github.com/t0bst4r/matterbridge-home-assistant/commit/0249b87208119b9fed4eaf6e76678a58640c83c6))

## [0.2.4](https://github.com/t0bst4r/matterbridge-home-assistant/compare/matterbridge-home-assistant-v0.2.3...matterbridge-home-assistant-v0.2.4) (2024-06-10)


### Bug Fixes

* **docker:** added docker entrypoint ([#33](https://github.com/t0bst4r/matterbridge-home-assistant/issues/33)) ([90d10da](https://github.com/t0bst4r/matterbridge-home-assistant/commit/90d10da4681585652fcf80635edf7e4f71db9061))

## [0.2.3](https://github.com/t0bst4r/matterbridge-home-assistant/compare/matterbridge-home-assistant-v0.2.2...matterbridge-home-assistant-v0.2.3) (2024-06-10)


### Bug Fixes

* register devices synchronously and fix docker ([#31](https://github.com/t0bst4r/matterbridge-home-assistant/issues/31)) ([1431621](https://github.com/t0bst4r/matterbridge-home-assistant/commit/1431621af517cea2a766ec2d958bd6eaf814c39a))

## [0.2.2](https://github.com/t0bst4r/matterbridge-home-assistant/compare/matterbridge-home-assistant-v0.2.1...matterbridge-home-assistant-v0.2.2) (2024-06-09)


### Bug Fixes

* **docker:** use GitHub token ([9236767](https://github.com/t0bst4r/matterbridge-home-assistant/commit/9236767fe465ba64ffa8edd13b9dc5cf606848ab))

## [0.2.1](https://github.com/t0bst4r/matterbridge-home-assistant/compare/matterbridge-home-assistant-v0.2.0...matterbridge-home-assistant-v0.2.1) (2024-06-09)


### Bug Fixes

* remove conditional docker login ([#26](https://github.com/t0bst4r/matterbridge-home-assistant/issues/26)) ([fa3547f](https://github.com/t0bst4r/matterbridge-home-assistant/commit/fa3547f450a5658356f6706c0409c6748c0f395f))

## [0.2.0](https://github.com/t0bst4r/matterbridge-home-assistant/compare/matterbridge-home-assistant-v0.1.1...matterbridge-home-assistant-v0.2.0) (2024-06-09)


### Features

* added docker build and publish ([#23](https://github.com/t0bst4r/matterbridge-home-assistant/issues/23)) ([77daa30](https://github.com/t0bst4r/matterbridge-home-assistant/commit/77daa3084b67238317004251c692c7d2c71916f8))

## [0.1.1](https://github.com/t0bst4r/matterbridge-home-assistant/compare/matterbridge-home-assistant-v0.1.0...matterbridge-home-assistant-v0.1.1) (2024-06-09)


### Bug Fixes

* **deps:** update amannn/action-semantic-pull-request action to v5.5.2 ([#19](https://github.com/t0bst4r/matterbridge-home-assistant/issues/19)) ([f0cd9a6](https://github.com/t0bst4r/matterbridge-home-assistant/commit/f0cd9a6dab2a536f9d2e803f75fb2d6b955f3ca6))
* **deps:** update dependency jest-junit to v16 ([#20](https://github.com/t0bst4r/matterbridge-home-assistant/issues/20)) ([a088ffa](https://github.com/t0bst4r/matterbridge-home-assistant/commit/a088ffa9a3c5d9ef8550eeec2005f4362808afce))
* **deps:** update dependency matterbridge to v1.2.22 ([#18](https://github.com/t0bst4r/matterbridge-home-assistant/issues/18)) ([57fac30](https://github.com/t0bst4r/matterbridge-home-assistant/commit/57fac30af4a0219654900edc45d286e3f228f3f0))
* pin node version to 18.x ([#22](https://github.com/t0bst4r/matterbridge-home-assistant/issues/22)) ([4d010e6](https://github.com/t0bst4r/matterbridge-home-assistant/commit/4d010e6b807bf1d81134ae925420d77f3dd9db85))

## [0.1.0](https://github.com/t0bst4r/matterbridge-home-assistant/compare/matterbridge-home-assistant-v0.0.10...matterbridge-home-assistant-v0.1.0) (2024-06-09)


### Features

* added light, switch and media_player entity types ([f66af84](https://github.com/t0bst4r/matterbridge-home-assistant/commit/f66af843bc461cdce994a1b4fc35100e2ddbc5a9))
* added support for scenes by mapping them to switch ([cc6ac9a](https://github.com/t0bst4r/matterbridge-home-assistant/commit/cc6ac9a556f0b7306c7f4134a9d48e1c631f7b5b))


### Bug Fixes

* adjusted readme ([fc21511](https://github.com/t0bst4r/matterbridge-home-assistant/commit/fc21511b1285e64dcfe0f0286694ea84d18df478))
* fixed typo in environment variable name ([4d9b5ec](https://github.com/t0bst4r/matterbridge-home-assistant/commit/4d9b5ec5be737857c5e1ddcc61162fab34293097))
* remove projen configuration ([#10](https://github.com/t0bst4r/matterbridge-home-assistant/issues/10)) ([e0f98b0](https://github.com/t0bst4r/matterbridge-home-assistant/commit/e0f98b0fa9710d3a7093fce680befbe06069866e))
* removed npm provenance and added readme ([30d4f3c](https://github.com/t0bst4r/matterbridge-home-assistant/commit/30d4f3c4919ee9cbec1763eca44cfbfe06778253))
