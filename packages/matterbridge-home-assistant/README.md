# Matterbridge Home Assistant

---

This **Matterbridge Home Assistant** package provides bindings to
connect [HomeAssistant](https://www.home-assistant.io/) to [Matterbridge](https://github.com/Luligu/matterbridge/).

---

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/t0bst4r)

---

## Frequently Asked Questions

### Why doesn't Matterbridge find new entities which were just added to home assistant?

`matterbridge-home-assistant` scans all entities once during startup and checks their visibility state.
After that it only subscribes to state changes (on-off, color, etc.). Restart Matterbridge to find the new entities
to be added.

### How can I hide entities beside the include/exclude patterns?

`matterbridge-home-assistant` compares entity_ids to the include/exclude patterns and domains, but also considers the
hidden state of an entity (can be found in the entity details in Home Assistant).
Both are only checked once during startup, so changes will apply after restarting Matterbridge.

### Why doesn't Matterbridge remove entities, which I just marked as hidden?

`matterbridge-home-assistant` compares entity_ids to the include/exclude patterns and domains, but also considers the
hidden state of an entity (can be found in the entity details in Home Assistant).
Both are only checked once during startup, so changes will apply after restarting Matterbridge.

## Contribution, Bug Reports and Enhancements

Please head over to the [GitHub Repository](https://github.com/t0bst4r/matterbridge-home-assistant) and review the
README, and its contribution section.
