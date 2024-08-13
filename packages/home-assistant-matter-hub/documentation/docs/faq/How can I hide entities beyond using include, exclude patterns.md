# How can I hide entities beyond using include/exclude patterns?

The application matches entity_ids against the specified include/exclude patterns and domains, and it also considers the
hidden state of each entity (as defined in the entity details in Home Assistant). These checks occur only at startup, so
any changes will take effect after you restart the app.
