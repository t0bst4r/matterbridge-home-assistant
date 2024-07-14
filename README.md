# Publish your Home Assistant Instance as a Matter-Hub

---

This project provides an application to connect [Home Assistant](https://www.home-assistant.io/) to any
[matter](https://csa-iot.org/all-solutions/matter/) enabled controller like Alexa, Google Home or Apple Home.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/t0bst4r)

---

## Project Structure

This project consists of two packages with different purposes. Both utilize [matterbridge](https://github.com/Luligu/matterbridge).

1. `home-assistant-matter-hub` integrate Home Assistant with Matter. At the moment this package is not an application on its own. It is used by `matterbridge-home-assistant` to connect with home assistant.
2. `matterbridge-home-assistant` provides a `matterbridge` plugin, which finally connects Home Assistant with any matter enabled controller

## Installation

### Manual or Docker installation

Please follow the [installation instructions](./packages/matterbridge-home-assistant/README.md) to install
`matterbridge-home-assistant`.

### Home Assistant Addon Installation (Home Assistant OS only)

This project is also built into a native Home Assistant Addon. Please follow
[these instructions](https://github.com/t0bst4r/matterbridge-home-assistant-addon) to install the Addon.

## Contribution, Bug Reports and Enhancements

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [contribution guideline](CONTRIBUTING.md) for different
ways to help and details about how this project handles them. Please make sure to read the relevant section before
making your contribution. It will make it a lot easier for us maintainers and smooth out the experience for all
involved.

Please also review the [code of conduct](CODE_OF_CONDUCT.md).

The community looks forward to your contributions. 🎉

## Contributors

[<img src="https://github.com/t0bst4r.png" width="50px" alt="t0bst4r" title="t0bst4r" />](https://github.com/t0bst4r)
[<img src="https://github.com/bassrock.png" width="50px" alt="bassrock" title="bassrock" />](https://github.com/bassrock)
