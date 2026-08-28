# Demo sandbox

Open `/demo` or `/?demo=1` for a ready-to-use inventory: a rescue inhaler,
saline spray, and travel injector. It is seeded from assets in the application
and remains available after the initial visit when offline.

Demo data lives in IndexedDB database `demo:dose-count-compass`. Real use lives
in the separate `real:dose-count-compass` database. The demo banner offers
**Reset demo** and **Start for real**. Starting for real never copies demo
records into the real database. It restores the original samples before
opening the real device list, so later demo visits start at the original
counts.
