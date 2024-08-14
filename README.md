# Publish your Home Assistant Instance as a Matter-Hub

---

This project provides an application to connect [Home Assistant](https://www.home-assistant.io/) to any
[matter](https://csa-iot.org/all-solutions/matter/) enabled controller like Alexa, Google Home or Apple Home.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/t0bst4r)

---

## Project Structure

The GitHub Repository consists of two applications:

1. `matterbridge-home-assistant` (**deprecated**) is a [matterbridge](https://github.com/Luligu/matterbridge) plugin,
   which connects Home Assistant with any matter enabled controller

2. `home-assistant-matter-hub` is a standalone application which is currently in development. It integrates Home
   Assistant with Matter and will replace `matterbridge-home-assistant` in the near future.

## Installation

- As `home-assistant-matter-hub` is currently in development and not yet released, you cannot install it yet.
  In the meantime you can install `matterbridge-home-assistant`, but be aware that it will be replaced later this year.
  Then you'll need to reconfigure your matter controllers (like Alexa).

- For `matterbridge-home-assistant` (**deprecated**) please follow
  the [installation instructions](./packages/home-assistant-matter-hub/documentation/docs/installation/matterbridge/Installation_Instructions.md).

## Pairing

- For `matterbridge-home-assistant` (**deprecated**) please follow
  the [Pairing instructions](./packages/home-assistant-matter-hub/documentation/docs/installation/matterbridge/Pairing.md).

## Supported Entities

Since we need to implement support for each domain (or even device class) one by one, not all domains and device classes
are supported yet.

- Automations (`automation.`) are mapped to Switches and currently only support on-off control
- Binary Sensor entities (`binary_sensor.`) provide their state (e.g. on / off)
- Cover Devices (`cover.`) are currently all mapped to "Window Covering"
- Fan Devices (`fan.`) are currently mapped to Dimmable Plugin Units, because most of the Matter controllers do not
  support fans.
- Input-Boolean entities (`input_boolean.`) including on-off control
- Light entities (`light.`) including on-off, brightness and hue & saturation control
- Lock Devices (`lock.`) including Locking and Unlocking. Some Matter controllers (like Alexa) do not allow unlocking
  locks by default. It needs to be enabled in the Alexa App for each Lock.
- Media Players (`media_player.`) are mapped to Switches and currently only support on-off control
- Scenes (`scene.`) are mapped to Switches and currently only support on-off control
- Scripts (`script.`) are mapped to Switches and currently only support on-off control
- Switch entities (`switch.`) including on-off control

## Frequently Asked Questions

Please head over to the [FAQs](./packages/home-assistant-matter-hub/documentation/docs/faq).

## Contribution, Bug Reports and Enhancements

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [contribution guideline](./CONTRIBUTING.md) for different
ways to help and details about how this project handles them. Please make sure to read the relevant section before
making your contribution. It will make it a lot easier for us maintainers and smooth out the experience for all
involved.

Please also review the [code of conduct](./CODE_OF_CONDUCT.md).

The community looks forward to your contributions. 🎉

## Contributors

[![t0bst4r](https://avatars.githubusercontent.com/u/82281152?s=50 't0bst4r')](https://github.com/t0bst4r)
[![genehand](https://avatars.githubusercontent.com/u/1693883?s=50 'genehand')](https://github.com/genehand)
[![t0bst4r](https://avatars.githubusercontent.com/u/1010384?s=50 'bassrock')](https://github.com/bassrock)
