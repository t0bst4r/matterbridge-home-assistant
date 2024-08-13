# Why aren't entities being removed after I mark them as hidden in Home Assistant?

The application checks entity_ids against the include/exclude patterns and domains, and it also considers whether an
entity is marked as hidden in Home Assistant. These settings are evaluated only at startup, so you'll need to restart
the app for changes to take effect.
