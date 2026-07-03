# Changelog

All notable changes to the Ludo Champion board game platform will be documented in this file.

---

## [1.0.0] - 2026-07-03

### Added
- **Multi-language Localization**: Live dictionary swaps supporting English, Urdu, Arabic, Spanish, and French.
- **Dynamic Theme Engine**: Body data overrides recoloring styles (Classic, Cyber Neon, Cosmic Dark, Royal Gold, Minimal Ink).
- **Season Pass**: 4 reward tiers giving coins and cosmetics.
- **Express Backend & Socket.IO integration**: Node REST server and real-time multiplayer sockets for lobby rooms.
- **Progression Systems**: Level, XP, and RP (Rank Points) promoting and demoting players.
- **Dice Shop customizer**: Equip dice skins (Classic, Golden, Neon).
- **Accessibility Adjustments**: High Contrast layouts, Reduced Motion transitions, and keyboard tabindex bindings.
- **PWA support**: Service worker (`sw.js`) and PWA `manifest.json` enabling offline access.

### Fixed
- Turn switches skipping inactive player indices.
- Token overlays and cluster offsets preventing overlaps on identical cells.
- Blockade checks preventing opponent tokens from jumping stack blockades.
- Audio context autoplays complying with browser interact policies.
