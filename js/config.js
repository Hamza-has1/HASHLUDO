/**
 * Ludo Game Configuration
 * Centrally manages all game-wide settings, themes, difficulties, rules, and layout parameters.
 */
const LudoConfig = {
    version: '1.0.0-beta',
    canvasSize: 600, // Standard logical resolution for the board
    colors: {
        red: { base: '#ff3b30', light: '#ff453a', dark: '#d01e1e' },
        green: { base: '#34c759', light: '#32d74b', dark: '#248a3d' },
        yellow: { base: '#ffcc00', light: '#ffd60a', dark: '#cca300' },
        blue: { base: '#007aff', light: '#0a84ff', dark: '#0059b3' },
        neutral: {
            bg: '#121214',
            surface: 'rgba(25, 25, 29, 0.6)',
            surfaceBorder: 'rgba(255, 255, 255, 0.08)',
            text: '#f5f5f7',
            textMuted: '#86868b'
        }
    },
    // Game Rules placeholders for Phase 5+
    rules: {
        sixGrantsExtraTurn: true,
        threeSixesSkipsTurn: true,
        mustRollSixToEnter: true,
        exactHomeEntryRequired: true
    },
    // AI Difficulty settings for Phase 7
    difficulty: {
        easy: { delay: 1000, smartness: 0.1 },
        medium: { delay: 800, smartness: 0.5 },
        hard: { delay: 600, smartness: 0.9 }
    },
    // Storage Key for saves and stats (Phase 12)
    storageKey: {
        save: 'ludo_autosave_state',
        stats: 'ludo_stats_data',
        settings: 'ludo_settings_data'
    },
    // Sound configuration (Phase 10)
    audio: {
        enabled: true,
        volume: 0.5
    }
};

// Export to window object for global availability in index.html scripts
window.LudoConfig = LudoConfig;
