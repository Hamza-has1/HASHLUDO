# Ludo Champion - Premium 2D Web Board Game Platform (v1.0.0-Release)

A commercial-grade Ludo board game platform built purely using HTML5, CSS3, and Vanilla JavaScript (ES6+). Zero frameworks, zero libraries, zero build tools. Designed with modern gaming aesthetics like glassmorphic UI, ambient animations, and built-in Web Audio API frequency sound synthesizers.

---

## 📖 Architecture Overview

The codebase is structured under an offline-first modular pattern:
1. **PWA Layer**: Implements offline caches via `sw.js` and install configurations in `manifest.json`.
2. **Localization Engine**: Translates all tags holding `data-i18n` attributes dynamically using a dictionary look-up mapping (supporting English, Urdu, Arabic, Hindi, Spanish, French, Turkish, and Indonesian).
3. **Theme Engine**: Modifies HSL values and styling tokens dynamically by setting `body[data-theme]` selectors.
4. **Progression Engine**: Coordinates XP acquisition, Coin balances, and Rank Point promotions.
5. **Synth sound Engine**: Synthesizes sound frequencies using Web Audio API nodes.

---

## 📂 Folder Structure

```text
/
│── index.html          # Main application document containing screens & overlays
│── manifest.json       # PWA configurations with inline SVG icons
│── sw.js               # Service Worker caching assets for offline play
│
├── css/
│   ├── style.css       # Core layout styles, variables, themes, & accessibility
│   └── responsive.css  # Mobile and portrait media query viewport modifiers
│
├── js/
│   ├── config.js       # Global constants, versioning metadata, and storage keys
│   ├── utils.js        # Helper classes for cookies, devices, and transitions
│   └── app.js          # Core application lifecycle controller & matchmaking simulator
```

---

## 🛠️ Installation & Running the Game

1. **Option A (Local)**:
   Simply open `index.html` directly in any web browser.
2. **Option B (Server / Deployment)**:
   Deploy the directory directly to GitHub Pages, Netlify, Vercel, or any other static asset server. The Service Worker will automatically cache the game for 100% offline access.

---

## ⚙️ Advanced Settings

Configure game options inside the Settings modal:
- **Language**: English, Urdu (اردو), Arabic (العربية), Hindi (हिन्दी), Spanish, French, Turkish, or Indonesian.
- **Active Theme**: Classic Blue, Cyber Neon, Cosmic Dark, Royal Gold, or Minimal Ink.
- **Accessibility**: High Contrast text overlays, Reduced Motion toggle (disabling animations).
- **Haptics**: Vibration chimes toggle on touch events.

---

## 📈 Version 1.0 Release Changelog

- **v1.0.0 (Release)**:
  - Added dynamic Multi-language Localization engine.
  - Configured Theme Engine supporting Royal Gold, Cosmic Dark, Cyber Neon, and Minimal.
  - Implemented Level/XP progression trackers and ranked RP promote/demotes.
  - Added Customization Ludo Shop (spending coins to purchase/equip Golden or Neon dice skins).
  - Built a PWA service worker caching gameplay offline.
  - Implemented screen-reader ARIA accessibility labels and High Contrast accessibility flags.
  - Created a 10-tier Season Pass rewarding coins and cosmetic skins.

---

## ⚖️ License

MIT License. Free to use, adapt, and build upon.
