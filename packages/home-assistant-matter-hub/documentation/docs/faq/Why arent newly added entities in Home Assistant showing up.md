# Why aren't newly added entities in Home Assistant showing up?

The application scans for entities during startup and records their visibility state at that time. After the initial
scan, it only monitors state changes (like on/off status or color). To detect newly added entities, restart
the application.
