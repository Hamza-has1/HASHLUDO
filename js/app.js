/**
 * Ludo Game - Main App Controller
 * Orchestrates loading states, menu actions, board rendering, dice roll logic, turn indices, token path tracking, captures, blockades, victory celebrations, AI bots, Local Multiplayer, synthesized audio, save systems, stats tracking, achievements, Online Multiplayer, and progression shop systems.
 */

class LudoAudioEngine {
    constructor() {
        this.ctx = null;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.isMuted = false;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    play(type) {
        if (this.isMuted) return;
        this.init();
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime;

        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
            gain.gain.setValueAtTime(this.sfxVolume * 0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.16);
        }
        else if (type === 'dice-roll') {
            for (let i = 0; i < 6; i++) {
                const clickTime = now + (i * 0.08);
                const clickOsc = this.ctx.createOscillator();
                const clickGain = this.ctx.createGain();
                clickOsc.connect(clickGain);
                clickGain.connect(this.ctx.destination);
                
                clickOsc.type = 'triangle';
                clickOsc.frequency.setValueAtTime(180 + (Math.random() * 90), clickTime);
                clickGain.gain.setValueAtTime(this.sfxVolume * 0.22, clickTime);
                clickGain.gain.exponentialRampToValueAtTime(0.01, clickTime + 0.06);
                
                clickOsc.start(clickTime);
                clickOsc.stop(clickTime + 0.07);
            }
        }
        else if (type === 'token-move' || type === 'move') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(750, now + 0.18);
            gain.gain.setValueAtTime(this.sfxVolume * 0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
            osc.start(now);
            osc.stop(now + 0.19);
        }
        else if (type === 'capture') {
            // Funny boing/squeak sound on capture
            const boingOsc = this.ctx.createOscillator();
            const boingGain = this.ctx.createGain();
            boingOsc.connect(boingGain);
            boingGain.connect(this.ctx.destination);
            boingOsc.type = 'sine';
            boingOsc.frequency.setValueAtTime(120, now);
            boingOsc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
            boingOsc.frequency.exponentialRampToValueAtTime(200, now + 0.25);
            boingGain.gain.setValueAtTime(this.sfxVolume * 0.4, now);
            boingGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            boingOsc.start(now);
            boingOsc.stop(now + 0.36);

            // Extra comic squeak
            const squeakOsc = this.ctx.createOscillator();
            const squeakGain = this.ctx.createGain();
            squeakOsc.connect(squeakGain);
            squeakGain.connect(this.ctx.destination);
            squeakOsc.type = 'sawtooth';
            squeakOsc.frequency.setValueAtTime(1200, now + 0.15);
            squeakOsc.frequency.exponentialRampToValueAtTime(300, now + 0.4);
            squeakGain.gain.setValueAtTime(this.sfxVolume * 0.15, now + 0.15);
            squeakGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            squeakOsc.start(now + 0.15);
            squeakOsc.stop(now + 0.41);
        }
        else if (type === 'notification') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
            gain.gain.setValueAtTime(this.sfxVolume * 0.16, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);
            osc.start(now);
            osc.stop(now + 0.25);
        }
        else if (type === 'finished') {
            // Fanfare for token reaching home
            const fanfareNotes = [523.25, 659.25, 783.99, 1046.5];
            fanfareNotes.forEach((freq, idx) => {
                const noteTime = now + (idx * 0.09);
                const noteOsc = this.ctx.createOscillator();
                const noteGain = this.ctx.createGain();
                noteOsc.connect(noteGain);
                noteGain.connect(this.ctx.destination);
                noteOsc.type = 'sine';
                noteOsc.frequency.setValueAtTime(freq, noteTime);
                noteGain.gain.setValueAtTime(this.sfxVolume * 0.22, noteTime);
                noteGain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.28);
                noteOsc.start(noteTime);
                noteOsc.stop(noteTime + 0.3);
            });
        }
        else if (type === 'victory') {
            const notes = [261.63, 329.63, 392.00, 523.25];
            notes.forEach((freq, idx) => {
                const noteTime = now + (idx * 0.12);
                const noteOsc = this.ctx.createOscillator();
                const noteGain = this.ctx.createGain();
                noteOsc.connect(noteGain);
                noteGain.connect(this.ctx.destination);
                
                noteOsc.type = 'triangle';
                noteOsc.frequency.setValueAtTime(freq, noteTime);
                noteGain.gain.setValueAtTime(this.sfxVolume * 0.25, noteTime);
                noteGain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.35);
                
                noteOsc.start(noteTime);
                noteOsc.stop(noteTime + 0.4);
            });
        }
    }
}

class LudoGameApp {
    constructor() {
        this.gameState = 'loading'; // 'loading', 'menu', 'settings', 'about', 'playing', 'gameover'
        this.settings = {
            sfx: true,
            music: true,
            difficulty: 'medium', // 'easy', 'medium', 'hard'
            playerCount: 4,
            musicVol: 50,
            sfxVol: 70,
            vibration: true,
            particles: true
        };

        // Phase 13 Multi-language dictionary mapping keys
        this.locales = {
            en: { loading_msg: "Preparing Board...", menu_subtitle: "CHAMPION", menu_start: "Start Game", menu_social: "Social Hub", menu_missions: "Missions & Events", menu_season: "Season Pass", menu_shop: "Ludo Shop", menu_stats: "Stats & Trophies", menu_settings: "Settings", turn_active: "Your Turn", turn_waiting: "Waiting...", turn_active_desc: "Current Turn:", roll_dice: "Roll Dice", set_language: "Language", set_theme: "Active Theme", set_high_contrast: "High Contrast", set_reduced_motion: "Reduced Motion" },
            ur: { loading_msg: "بورڈ تیار کیا جا رہا ہے...", menu_subtitle: "چیمپئن", menu_start: "کھیل شروع کریں", menu_social: "سوشل ہب", menu_missions: "مشنز اور ایونٹس", menu_season: "سیزن پاس", menu_shop: "لڈو شاپ", menu_stats: "اعداد و شمار", menu_settings: "ترتیبات", turn_active: "آپ کی باری", turn_waiting: "انتظار کریں...", turn_active_desc: "موجودہ باری:", roll_dice: "پانسہ پھینکیں", set_language: "زبان", set_theme: "فعال تھیم", set_high_contrast: "ہائی کنٹراسٹ", set_reduced_motion: "کم حرکت" },
            ar: { loading_msg: "جاري تحضير اللوحة...", menu_subtitle: "البطل", menu_start: "ابدأ اللعبة", menu_social: "مركز الأصدقاء", menu_missions: "المهمات والفعاليات", menu_season: "ممر الموسم", menu_shop: "متجر لودو", menu_stats: "الإحصائيات والجوائز", menu_settings: "الإعدادات", turn_active: "دورك الآن", turn_waiting: "انتظار...", turn_active_desc: "الدور الحالي:", roll_dice: "رمي النرد", set_language: "اللغة", set_theme: "المظهر النشط", set_high_contrast: "تباين عالي", set_reduced_motion: "حركة مخفضة" },
            es: { loading_msg: "Preparando Tablero...", menu_subtitle: "CAMPEÓN", menu_start: "Jugar", menu_social: "Amigos", menu_missions: "Misiones", menu_season: "Pase de Batalla", menu_shop: "Tienda Ludo", menu_stats: "Estadísticas", menu_settings: "Ajustes", turn_active: "Tu Turno", turn_waiting: "Esperando...", turn_active_desc: "Turno Actual:", roll_dice: "Lanzar Dado", set_language: "Idioma", set_theme: "Tema Activo", set_high_contrast: "Alto Contraste", set_reduced_motion: "Movimiento Reducido" },
            fr: { loading_msg: "Préparation du plateau...", menu_subtitle: "CHAMPION", menu_start: "Démarrer", menu_social: "Amis", menu_missions: "Missions", menu_season: "Pass Saison", menu_shop: "Boutique Ludo", menu_stats: "Stats", menu_settings: "Réglages", turn_active: "À toi de jouer", turn_waiting: "En attente...", turn_active_desc: "Tour Actuel:", roll_dice: "Lancer le Dé", set_language: "Langue", set_theme: "Thème Actif", set_high_contrast: "Contraste Élevé", set_reduced_motion: "Mouvement Réduit" }
        };

        // Phase 13 Season pass tracks
        this.seasonPass = { xp: 0, tier: 1, claimedTiers: [] };
        this.seasonPassRewards = [
            { tier: 1, text: "100 Gold Coins", type: "coins", value: 100 },
            { tier: 2, text: "Golden Dice Skin", type: "skin", value: "golden" },
            { tier: 3, text: "200 Gold Coins", type: "coins", value: 200 },
            { tier: 4, text: "Neon Laser Dice Skin", type: "skin", value: "neon" }
        ];

        this.activeLanguage = 'en';
        this.activeTheme = 'classic';
        this.highContrast = false;
        this.reducedMotion = false;

        // Phase 12 economy & progression trackers
        this.economy = { coins: 150 };
        this.progression = { xp: 0, level: 1, rp: 1000 };
        this.equippedDiceSkin = 'classic'; // 'classic', 'golden', 'neon'
        this.purchasedSkins = ['classic'];

        this.friends = [
            { name: 'Sophia', status: 'online' },
            { name: 'Liam', status: 'in-match' },
            { name: 'Mateo', status: 'offline' }
        ];

        this.dailyMissions = [
            { id: 'win-match', desc: 'Win 1 Match', target: 1, current: 0, rewardCoins: 50, rewardXp: 100, claimed: false },
            { id: 'capture-token', desc: 'Capture 3 Tokens', target: 3, current: 0, rewardCoins: 30, rewardXp: 60, claimed: false },
            { id: 'roll-sixes', desc: 'Roll 5 Sixes', target: 5, current: 0, rewardCoins: 20, rewardXp: 40, claimed: false }
        ];

        this.shopItems = [
            { id: 'classic', title: 'Classic Dice', price: 0, icon: '🎲' },
            { id: 'golden', title: 'Golden Dice', price: 100, icon: '👑' },
            { id: 'neon', title: 'Neon Laser Dice', price: 200, icon: '⚡' }
        ];

        // Global Storage stats format structures
        this.globalStats = {
            gamesPlayed: 0,
            gamesWon: 0,
            totalCaptures: 0,
            distanceTravelled: 0
        };

        this.unlockedAchievements = [];

        this.achievementsList = [
            { id: 'first-win', title: 'First Win', desc: 'Guided your color to final victory.' },
            { id: 'capture-master', title: 'Capture Master', desc: 'Captured an opponent token.' },
            { id: 'lucky-roller', title: 'Lucky Roller', desc: 'Rolled three 6s in a single game.' },
            { id: 'perfect-match', title: 'Perfect Match', desc: 'Finished a token without getting captured.' },
            { id: 'first-blood', title: 'First Blood', desc: 'Captured your first token ever.' },
            { id: 'veteran', title: 'Veteran Player', desc: 'Play a total of 5 games.' },
            { id: 'ludo-master', title: 'Ludo Master', desc: 'Win a total of 3 games.' }
        ];

        // Synthesizer Instantiation
        this.audioEngine = new LudoAudioEngine();

        // Multiplayer Configurations
        this.gameMode = 'single'; // 'single', 'local', 'online'
        this.activePlayersCount = 4; // 2, 3, 4
        this.inactivePlayers = { red: false, green: false, yellow: false, blue: false };
        this.socket = null;

        // Matchmaking queue settings
        this.matchmakingTimer = null;
        this.isMatchmaking = false;

        // Turn Management state variables
        this.playersOrder = ['red', 'green', 'yellow', 'blue'];
        this.playerNames = {
            red: 'Player 1 (Red)',
            green: 'Player 2 (Green)',
            yellow: 'Player 3 (Yellow)',
            blue: 'Player 4 (Blue)'
        };
        
        this.isBotColor = {
            red: false,
            green: true,
            yellow: true,
            blue: true
        };

        this.currentPlayerIdx = 0; // Starts with Red (0)
        this.consecutiveSixes = 0;
        this.isRolling = false;
        this.lastRollResult = null;
        this.hasPendingMove = false;
        this.extraTurnAwarded = false;

        // Path Map Array coordinates mapping
        this.commonPath = [];
        this.playerPaths = { red: [], green: [], yellow: [], blue: [] };

        // 16 Token States Management
        this.tokens = { red: [], green: [], yellow: [], blue: [] };

        // Player statistics tracking
        this.stats = {
            red: { turnsPlayed: 0, capturesMade: 0, timesCaptured: 0, distanceTravelled: 0 },
            green: { turnsPlayed: 0, capturesMade: 0, timesCaptured: 0, distanceTravelled: 0 },
            yellow: { turnsPlayed: 0, capturesMade: 0, timesCaptured: 0, distanceTravelled: 0 },
            blue: { turnsPlayed: 0, capturesMade: 0, timesCaptured: 0, distanceTravelled: 0 }
        };

        // Match duration timer parameters
        this.matchStartTime = null;
        this.matchEndTime = null;

        // Dynamic background particle variables
        this.particles = [];
        this.isConfettiMode = false;
    }

    init() {
        console.log(`%c Ludo Game Initializing v${window.LudoConfig.version} `, 'background: #007aff; color: #fff; font-weight: bold; padding: 4px;');
        
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());

        this.setupNavigation();
        this.loadSettings();
        this.loadGlobalStatistics();
        this.initBackgroundParticles();
        this.buildPathMaps();
        this.renderLudoBoardCells();
        this.setupDiceSystem();
        this.initTokenObjects();
        this.checkSavedMatch();

        this.applyTheme();
        this.applyTranslations();

        this.simulateLoading(2000);
    }

    handleResize() {
        const screenInfo = window.LudoUtils.device.getScreenInfo();
        document.body.dataset.deviceType = screenInfo.type;
        document.body.dataset.touch = screenInfo.isTouch ? 'true' : 'false';
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }

    setupNavigation() {
        // Main Menu Buttons
        const btnStart = document.getElementById('btn-start-game');
        const btnSocial = document.getElementById('btn-social');
        const btnMissions = document.getElementById('btn-missions');
        const btnSeason = document.getElementById('btn-season-pass');
        const btnShop = document.getElementById('btn-shop');
        const btnStats = document.getElementById('btn-stats');
        const btnSettings = document.getElementById('btn-settings');
        const btnAbout = document.getElementById('btn-about');
        const btnExit = document.getElementById('btn-exit');

        if (btnStart) btnStart.addEventListener('click', () => {
            this.playAudio('click');
            this.openOverlay('mode-selection-overlay');
        });
        if (btnSocial) btnSocial.addEventListener('click', () => {
            this.playAudio('click');
            this.openSocialHub();
        });
        if (btnMissions) btnMissions.addEventListener('click', () => {
            this.playAudio('click');
            this.openMissionsDashboard();
        });
        if (btnSeason) btnSeason.addEventListener('click', () => {
            this.playAudio('click');
            this.openSeasonPassDashboard();
        });
        if (btnShop) btnShop.addEventListener('click', () => {
            this.playAudio('click');
            this.openShopDashboard();
        });
        if (btnStats) btnStats.addEventListener('click', () => {
            this.playAudio('click');
            this.openStatsOverlay();
        });
        if (btnSettings) btnSettings.addEventListener('click', () => {
            this.playAudio('click');
            this.openOverlay('settings-overlay');
        });
        if (btnAbout) btnAbout.addEventListener('click', () => {
            this.playAudio('click');
            this.openOverlay('about-overlay');
        });
        
        if (btnExit) {
            if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches || window.chrome) {
                btnExit.addEventListener('click', () => this.exitGame());
            } else {
                btnExit.style.display = 'none';
            }
        }

        // Gameplay Top Bar Buttons
        const btnSound = document.getElementById('btn-sound-toggle');
        const btnFullscreen = document.getElementById('btn-fullscreen-toggle');
        const btnGameSettings = document.getElementById('btn-game-settings');
        const btnChat = document.getElementById('btn-chat-trigger');

        if (btnSound) {
            btnSound.addEventListener('click', () => {
                this.audioEngine.isMuted = !this.audioEngine.isMuted;
                btnSound.textContent = this.audioEngine.isMuted ? '🔇' : '🔊';
                this.playAudio('click');
            });
        }

        if (btnFullscreen) {
            btnFullscreen.addEventListener('click', () => {
                this.playAudio('click');
                this.toggleFullscreen();
            });
        }

        if (btnGameSettings) {
            btnGameSettings.addEventListener('click', () => {
                this.playAudio('click');
                this.openOverlay('settings-overlay');
            });
        }

        if (btnChat) {
            btnChat.addEventListener('click', () => {
                this.playAudio('click');
                this.openOverlay('chat-panel-overlay');
            });
        }

        // Victory Screen Buttons
        const btnVicRestart = document.getElementById('btn-victory-restart');
        const btnVicMenu = document.getElementById('btn-victory-menu');

        if (btnVicRestart) {
            btnVicRestart.addEventListener('click', () => {
                this.playAudio('click');
                this.closeOverlay('victory-overlay');
                this.resetGame();
                if (this.gameMode === 'online' && this.hostColor) {
                    this.startGame(this.hostColor);
                } else {
                    const firstActive = this.playersOrder.find(c => !this.inactivePlayers[c]) || 'red';
                    this.startGame(firstActive);
                }
            });
        }

        if (btnVicMenu) {
            btnVicMenu.addEventListener('click', () => {
                this.playAudio('click');
                this.closeOverlay('victory-overlay');
                this.resetGame();
                window.LudoUtils.dom.fadeTransition('game-play-screen', 'menu-screen', 500);
                this.gameState = 'menu';
            });
        }

        // Game Mode Selection navigation
        const selectGameMode = document.getElementById('select-game-mode');
        const pickerGroup = document.getElementById('player-count-picker-group');
        const btnProceed = document.getElementById('btn-proceed-to-names');

        if (selectGameMode && pickerGroup) {
            selectGameMode.addEventListener('change', (e) => {
                this.playAudio('click');
                if (e.target.value === 'single') {
                    pickerGroup.style.display = 'none';
                } else {
                    pickerGroup.style.display = 'block';
                }
            });
            pickerGroup.style.display = selectGameMode.value === 'single' ? 'none' : 'block';
        }

        if (btnProceed) {
            btnProceed.addEventListener('click', () => {
                this.playAudio('click');
                this.closeOverlay('mode-selection-overlay');
                
                const mode = document.getElementById('select-game-mode').value;
                if (mode === 'online') {
                    this.openOverlay('online-lobby-overlay');
                } else {
                    this.setupNamesPicker();
                    this.openOverlay('player-setup-overlay');
                }
            });
        }

        // Online Arena redesigned P2P room events
        const btnShowCreate = document.getElementById('btn-show-create-screen');
        const btnShowJoin = document.getElementById('btn-show-join-screen');
        const btnConfirmCreate = document.getElementById('btn-confirm-create-room');
        const btnConfirmJoin = document.getElementById('btn-confirm-join-room');
        const btnCopyActiveCode = document.getElementById('btn-copy-active-room-code');
        const btnStartLobby = document.getElementById('btn-start-lobby-game');
        const btnLeaveLobby = document.getElementById('btn-leave-lobby');

        if (btnShowCreate) {
            btnShowCreate.addEventListener('click', () => {
                this.playAudio('click');
                document.getElementById('lobby-choices').style.display = 'none';
                document.getElementById('lobby-create-screen').style.display = 'flex';
            });
        }

        if (btnShowJoin) {
            btnShowJoin.addEventListener('click', () => {
                this.playAudio('click');
                document.getElementById('lobby-choices').style.display = 'none';
                document.getElementById('lobby-join-screen').style.display = 'flex';
            });
        }

        document.querySelectorAll('.btn-lobby-back').forEach(btn => {
            btn.addEventListener('click', () => {
                this.playAudio('click');
                document.getElementById('lobby-create-screen').style.display = 'none';
                document.getElementById('lobby-join-screen').style.display = 'none';
                document.getElementById('lobby-choices').style.display = 'flex';
            });
        });

        if (btnConfirmCreate) {
            btnConfirmCreate.addEventListener('click', () => {
                const usernameInput = document.getElementById('input-lobby-username');
                const username = usernameInput ? usernameInput.value.trim() : '';
                if (!username) {
                    alert('Please enter a username first!');
                    return;
                }
                this.playAudio('click');
                this.initSocketConnection();
                const playersCount = document.getElementById('select-lobby-players').value;
                this.socket.emit('create_room', { maxPlayers: playersCount, username: username });
            });
        }

        if (btnConfirmJoin) {
            btnConfirmJoin.addEventListener('click', () => {
                const usernameInput = document.getElementById('input-lobby-username');
                const username = usernameInput ? usernameInput.value.trim() : '';
                if (!username) {
                    alert('Please enter a username first!');
                    return;
                }
                const codeInput = document.getElementById('input-lobby-code');
                const code = codeInput ? codeInput.value.trim().toUpperCase() : '';
                if (code.startsWith('LUDO-')) {
                    this.playAudio('click');
                    this.initSocketConnection();
                    this.socket.emit('join_room', { roomId: code, username: username });
                } else {
                    alert('Invalid Room Code format! (e.g. LUDO-6384)');
                }
            });
        }

        if (btnCopyActiveCode) {
            btnCopyActiveCode.addEventListener('click', () => {
                this.playAudio('click');
                const codeText = document.getElementById('label-active-room-code').textContent;
                navigator.clipboard.writeText(codeText).then(() => {
                    alert('Room Code copied to clipboard!');
                });
            });
        }

        if (btnStartLobby) {
            btnStartLobby.addEventListener('click', () => {
                this.playAudio('click');
                if (this.socket) {
                    this.socket.emit('start_game');
                }
            });
        }

        if (btnLeaveLobby) {
            btnLeaveLobby.addEventListener('click', () => {
                this.playAudio('click');
                if (this.socket) {
                    this.socket.disconnect();
                    this.socket = null;
                }
                document.getElementById('lobby-active-room').style.display = 'none';
                document.getElementById('lobby-choices').style.display = 'flex';
                document.getElementById('lobby-username-container').style.display = 'flex';
            });
        }

        // Setup Leave Game Button inside play view
        const btnLeaveGame = document.getElementById('btn-leave-game');
        if (btnLeaveGame) {
            btnLeaveGame.addEventListener('click', () => {
                if (confirm('Are you sure you want to leave the match?')) {
                    this.playAudio('click');
                    if (this.socket) {
                        this.socket.emit('leave_game');
                        this.socket.disconnect();
                        this.socket = null;
                    }
                    window.location.reload();
                }
            });
        }

        // Setup Social Hub Add Friend
        const btnAddF = document.getElementById('btn-add-friend');
        if (btnAddF) {
            btnAddF.addEventListener('click', () => {
                this.playAudio('click');
                const input = document.getElementById('input-add-friend');
                if (input && input.value.trim() !== '') {
                    this.friends.push({ name: input.value.trim(), status: 'offline' });
                    input.value = '';
                    this.openSocialHub();
                    this.showToastNotification('Friend Added!', 'blue');
                }
            });
        }

        // Setup Quick Chat click delegations
        document.querySelectorAll('.chat-emoji-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.playAudio('click');
                this.closeOverlay('chat-panel-overlay');
                const emoji = e.target.dataset.emoji;
                this.displayChatBubble('red', emoji);
            });
        });
        document.querySelectorAll('.chat-msg-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.playAudio('click');
                this.closeOverlay('chat-panel-overlay');
                const msg = e.target.dataset.msg;
                this.displayChatBubble('red', msg);
            });
        });

        const btnReady = document.getElementById('btn-ready-to-play');
        if (btnReady) {
            btnReady.addEventListener('click', () => {
                this.playAudio('click');
                this.closeOverlay('player-setup-overlay');
                this.saveCustomPlayerProfiles();
                this.startGame();
            });
        }

        // Pass Device overlay triggers
        const btnPassCont = document.getElementById('btn-pass-continue');
        if (btnPassCont) {
            btnPassCont.addEventListener('click', () => {
                this.playAudio('click');
                this.closeOverlay('pass-device-overlay');
                
                const viewport = document.getElementById('main-play-viewport');
                if (viewport) viewport.style.filter = '';
                
                const gameDice = document.getElementById('game-dice');
                if (gameDice) gameDice.style.opacity = '1';

                this.isRolling = false;
                const activeColor = this.getCurrentPlayerColor();
                this.updateActivePlayerUI();
            });
        }

        // Resume overlay buttons
        const btnResumeCont = document.getElementById('btn-resume-continue');
        const btnResumeNew = document.getElementById('btn-resume-new');
        const btnResumeDelete = document.getElementById('btn-resume-delete');

        if (btnResumeCont) {
            btnResumeCont.addEventListener('click', () => {
                this.playAudio('click');
                this.closeOverlay('resume-match-overlay');
                this.loadSavedMatch();
            });
        }
        if (btnResumeNew) {
            btnResumeNew.addEventListener('click', () => {
                this.playAudio('click');
                this.closeOverlay('resume-match-overlay');
                this.deleteActiveMatch();
            });
        }
        if (btnResumeDelete) {
            btnResumeDelete.addEventListener('click', () => {
                this.playAudio('click');
                this.closeOverlay('resume-match-overlay');
                this.deleteActiveMatch();
            });
        }

        // Stats utilities buttons
        const btnExport = document.getElementById('btn-export-backup');
        const btnImport = document.getElementById('btn-import-backup');
        const btnResetAll = document.getElementById('btn-factory-reset');

        if (btnExport) {
            btnExport.addEventListener('click', () => {
                this.playAudio('click');
                this.exportBackup();
            });
        }
        if (btnImport) {
            btnImport.addEventListener('click', () => {
                this.playAudio('click');
                this.importBackup();
            });
        }
        if (btnResetAll) {
            btnResetAll.addEventListener('click', () => {
                this.playAudio('click');
                if (confirm('Are you sure you want to perform a factory reset? This will wipe all stats and settings!')) {
                    this.factoryReset();
                }
            });
        }

        // Overlay Close Buttons
        document.querySelectorAll('.btn-close-overlay').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.playAudio('click');
                const overlay = e.target.closest('.overlay-screen');
                if (overlay) {
                    this.closeOverlay(overlay.id);
                }
            });
        });

        // Settings toggles and controls (Phase 13 Expanded Selector Events)
        const musicVolSlider = document.getElementById('settings-music-vol');
        const sfxVolSlider = document.getElementById('settings-sfx-vol');
        const vibrationToggle = document.getElementById('settings-vibration');
        const particlesToggle = document.getElementById('settings-particles');
        const difficultySelect = document.getElementById('settings-difficulty');
        const langSelect = document.getElementById('settings-language');
        const themeSelect = document.getElementById('settings-theme');
        const highContrastToggle = document.getElementById('settings-high-contrast');
        const reducedMotionToggle = document.getElementById('settings-reduced-motion');

        if (musicVolSlider) {
            musicVolSlider.addEventListener('input', (e) => {
                this.settings.musicVol = parseInt(e.target.value);
                this.audioEngine.musicVolume = this.settings.musicVol / 100;
                this.saveSettings();
            });
        }
        if (sfxVolSlider) {
            sfxVolSlider.addEventListener('input', (e) => {
                this.settings.sfxVol = parseInt(e.target.value);
                this.audioEngine.sfxVolume = this.settings.sfxVol / 100;
                this.saveSettings();
            });
            sfxVolSlider.addEventListener('change', () => {
                this.playAudio('click');
            });
        }
        if (vibrationToggle) {
            vibrationToggle.addEventListener('change', (e) => {
                this.settings.vibration = e.target.checked;
                this.playAudio('click');
                this.saveSettings();
            });
        }
        if (particlesToggle) {
            particlesToggle.addEventListener('change', (e) => {
                this.settings.particles = e.target.checked;
                this.playAudio('click');
                this.saveSettings();
            });
        }
        if (difficultySelect) {
            difficultySelect.addEventListener('change', (e) => {
                this.settings.difficulty = e.target.value;
                this.playAudio('click');
                this.saveSettings();
            });
        }

        if (langSelect) {
            langSelect.addEventListener('change', (e) => {
                this.playAudio('click');
                this.activeLanguage = e.target.value;
                this.applyTranslations();
                this.saveGlobalStatistics();
            });
        }
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.playAudio('click');
                this.activeTheme = e.target.value;
                this.applyTheme();
                this.saveGlobalStatistics();
            });
        }
        if (highContrastToggle) {
            highContrastToggle.addEventListener('change', (e) => {
                this.playAudio('click');
                this.highContrast = e.target.checked;
                if (this.highContrast) document.body.classList.add('high-contrast');
                else document.body.classList.remove('high-contrast');
                this.saveGlobalStatistics();
            });
        }
        if (reducedMotionToggle) {
            reducedMotionToggle.addEventListener('change', (e) => {
                this.playAudio('click');
                this.reducedMotion = e.target.checked;
                if (this.reducedMotion) document.body.classList.add('reduced-motion');
                else document.body.classList.remove('reduced-motion');
                this.saveGlobalStatistics();
            });
        }

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.overlay-screen.active').forEach(overlay => {
                    this.closeOverlay(overlay.id);
                });
            }
        });
    }

    /* 🎟️ Phase 13: Season Pass and Theme engines */
    openSeasonPassDashboard() {
        const tierLabel = document.getElementById('label-pass-tier');
        const xpLabel = document.getElementById('label-pass-xp');
        const progressFill = document.getElementById('progress-pass-fill');

        if (tierLabel) tierLabel.textContent = `Season Pass - Tier ${this.seasonPass.tier}`;
        if (xpLabel) xpLabel.textContent = `${this.seasonPass.xp} / 200 SP XP`;
        if (progressFill) {
            progressFill.style.width = `${Math.min((this.seasonPass.xp / 200) * 100, 100)}%`;
        }

        const listContainer = document.getElementById('pass-rewards-list');
        if (listContainer) {
            listContainer.innerHTML = '';
            this.seasonPassRewards.forEach(reward => {
                const isClaimed = this.seasonPass.claimedTiers.includes(reward.tier);
                const isUnlocked = this.seasonPass.tier >= reward.tier;

                const item = document.createElement('div');
                item.style.display = 'flex';
                item.style.justifyContent = 'space-between';
                item.style.alignItems = 'center';
                item.style.background = isUnlocked ? 'rgba(0, 122, 255, 0.04)' : 'rgba(255,255,255,0.01)';
                item.style.border = isUnlocked ? '1px solid rgba(0, 122, 255, 0.2)' : '1px solid rgba(255,255,255,0.02)';
                item.style.padding = '12px 16px';
                item.style.borderRadius = '10px';
                item.style.opacity = isUnlocked ? '1' : '0.5';

                item.innerHTML = `
                    <div>
                        <div style="font-weight:700; font-size:1.05rem;">Tier ${reward.tier} Reward</div>
                        <div style="font-size:0.85rem; color:var(--text-muted);">${reward.text}</div>
                    </div>
                    ${isClaimed 
                        ? '<span style="color:var(--color-green); font-size:0.9rem;">Claimed</span>'
                        : isUnlocked 
                            ? `<button class="btn-premium accent" style="font-size:0.8rem; padding:6px 12px;" onclick="window.LudoApp.claimSeasonReward(${reward.tier})" type="button">Claim</button>`
                            : '<span style="color:var(--text-muted); font-size:0.9rem;">Locked</span>'}
                `;
                listContainer.appendChild(item);
            });
        }

        this.openOverlay('season-pass-overlay');
    }

    claimSeasonReward(tier) {
        this.playAudio('click');
        const reward = this.seasonPassRewards.find(r => r.tier === tier);
        if (reward && this.seasonPass.tier >= tier && !this.seasonPass.claimedTiers.includes(tier)) {
            this.seasonPass.claimedTiers.push(tier);
            
            if (reward.type === 'coins') {
                this.addCoins(reward.value);
            } else if (reward.type === 'skin') {
                this.purchasedSkins.push(reward.value);
                this.showToastNotification(`Unlocked Skin: ${reward.text}!`, 'yellow');
            }

            this.saveGlobalStatistics();
            this.openSeasonPassDashboard(); // Refresh
        }
    }

    applyTranslations() {
        const lang = this.activeLanguage;
        const dict = this.locales[lang] || this.locales['en'];

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (dict[key]) {
                if (el.tagName === 'INPUT' && el.placeholder) {
                    el.placeholder = dict[key];
                } else {
                    el.textContent = dict[key];
                }
            }
        });
    }

    applyTheme() {
        document.body.dataset.theme = this.activeTheme;
    }

    addXP(amount) {
        this.progression.xp += amount;
        
        // Season pass XP tracking
        this.seasonPass.xp += amount;
        if (this.seasonPass.xp >= 200) {
            this.seasonPass.xp -= 200;
            this.seasonPass.tier++;
            this.showToastNotification(`Season Pass Tier ${this.seasonPass.tier} Reached!`, 'yellow');
        }

        const targetXp = this.progression.level * 100;
        if (this.progression.xp >= targetXp) {
            this.progression.xp -= targetXp;
            this.progression.level++;
            
            this.playAudio('victory');
            this.showToastNotification(`Level Up! Reached Level ${this.progression.level}!`, 'yellow');
        }
        this.saveGlobalStatistics();
    }

    addCoins(amount) {
        this.economy.coins += amount;
        this.saveGlobalStatistics();
        this.showToastNotification(`+${amount} Coins 🪙`, 'yellow');
    }

    addRankPoints(amount) {
        this.progression.rp = Math.max(0, this.progression.rp + amount);
        this.saveGlobalStatistics();

        let rank = 'Bronze';
        if (this.progression.rp >= 2500) rank = 'Legend';
        else if (this.progression.rp >= 2200) rank = 'Grandmaster';
        else if (this.progression.rp >= 2000) rank = 'Master';
        else if (this.progression.rp >= 1800) rank = 'Diamond';
        else if (this.progression.rp >= 1600) rank = 'Platinum';
        else if (this.progression.rp >= 1400) rank = 'Gold';
        else if (this.progression.rp >= 1200) rank = 'Silver';

        this.showToastNotification(`RP Updated! Current Rank: ${rank}`, 'blue');
    }

    openSocialHub() {
        const container = document.getElementById('friends-list-container');
        if (container) {
            container.innerHTML = '';
            this.friends.forEach(f => {
                const item = document.createElement('div');
                item.style.display = 'flex';
                item.style.justifyContent = 'space-between';
                item.style.alignItems = 'center';
                item.style.background = 'rgba(255,255,255,0.02)';
                item.style.border = '1px solid rgba(255,255,255,0.04)';
                item.style.padding = '10px 14px';
                item.style.borderRadius = '10px';

                let statusColor = 'var(--text-muted)';
                if (f.status === 'online') statusColor = 'var(--color-green)';
                else if (f.status === 'in-match') statusColor = 'var(--color-yellow)';

                item.innerHTML = `
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:1.4rem;">👤</span>
                        <div>
                            <span style="font-weight:700;">${f.name}</span>
                            <div style="font-size:0.75rem; color:${statusColor}; text-transform:capitalize;">● ${f.status}</div>
                        </div>
                    </div>
                    ${f.status === 'online' ? '<button class="btn-premium" style="font-size:0.8rem; padding: 4px 10px;" type="button">Invite</button>' : ''}
                `;
                container.appendChild(item);
            });
        }
        this.openOverlay('friends-overlay');
    }

    openMissionsDashboard() {
        const container = document.getElementById('daily-missions-container');
        if (container) {
            container.innerHTML = '';
            this.dailyMissions.forEach(m => {
                const percentage = Math.min((m.current / m.target) * 100, 100);
                const card = document.createElement('div');
                card.style.background = 'rgba(255,255,255,0.02)';
                card.style.border = '1px solid rgba(255,255,255,0.04)';
                card.style.padding = '14px';
                card.style.borderRadius = '12px';
                
                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 5px;">
                        <span style="font-weight:700;">${m.desc}</span>
                        <span style="font-size:0.85rem; color:var(--text-muted);">${m.current} / ${m.target}</span>
                    </div>
                    <div class="mission-progress-bar">
                        <div class="mission-progress-fill" style="width: ${percentage}%;"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; font-size:0.85rem;">
                        <span style="color:var(--color-yellow);">🪙 ${m.rewardCoins} / 💎 ${m.rewardXp} XP</span>
                        ${m.current >= m.target && !m.claimed ? `<button class="btn-premium accent" style="font-size:0.8rem; padding:4px 10px;" onclick="window.LudoApp.claimMissionReward('${m.id}')" type="button">Claim</button>` : m.claimed ? '<span style="color:var(--color-green);">Claimed</span>' : '<span style="color:var(--text-muted);">In Progress</span>'}
                    </div>
                `;
                container.appendChild(card);
            });
        }
        this.openOverlay('missions-overlay');
    }

    claimMissionReward(id) {
        this.playAudio('click');
        const m = this.dailyMissions.find(x => x.id === id);
        if (m && m.current >= m.target && !m.claimed) {
            m.claimed = true;
            this.addCoins(m.rewardCoins);
            this.addXP(m.rewardXp);
            this.openMissionsDashboard(); // Refresh
        }
    }

    openShopDashboard() {
        const bal = document.getElementById('shop-coin-balance');
        if (bal) bal.textContent = `🪙 ${this.economy.coins} Coins`;

        const grid = document.getElementById('shop-dice-grid');
        if (grid) {
            grid.innerHTML = '';
            this.shopItems.forEach(item => {
                const card = document.createElement('div');
                card.className = `shop-card ${this.equippedDiceSkin === item.id ? 'equipped' : ''}`;
                
                const isPurchased = this.purchasedSkins.includes(item.id);
                
                card.innerHTML = `
                    <span style="font-size: 2.2rem;">${item.icon}</span>
                    <strong style="font-size:0.95rem;">${item.title}</strong>
                    ${this.equippedDiceSkin === item.id 
                        ? '<button class="btn-premium" style="width:100%; font-size:0.85rem; padding:6px 0;" disabled type="button">Equipped</button>'
                        : isPurchased 
                            ? `<button class="btn-premium accent" style="width:100%; font-size:0.85rem; padding:6px 0;" onclick="window.LudoApp.equipDiceSkin('${item.id}')" type="button">Equip</button>`
                            : `<button class="btn-premium" style="width:100%; font-size:0.85rem; padding:6px 0; color:var(--color-yellow);" onclick="window.LudoApp.purchaseDiceSkin('${item.id}', ${item.price})" type="button">🪙 ${item.price}</button>`}
                `;
                grid.appendChild(card);
            });
        }
        this.openOverlay('shop-overlay');
    }

    equipDiceSkin(id) {
        this.playAudio('click');
        this.equippedDiceSkin = id;
        
        const gameDice = document.getElementById('game-dice');
        if (gameDice) {
            gameDice.className = `dice show-1 skin-${id}`;
        }
        this.saveGlobalStatistics();
        this.openShopDashboard();
    }

    purchaseDiceSkin(id, price) {
        this.playAudio('click');
        if (this.economy.coins >= price) {
            this.economy.coins -= price;
            this.purchasedSkins.push(id);
            this.saveGlobalStatistics();
            this.equipDiceSkin(id);
        } else {
            alert('Not enough coins!');
        }
    }

    startMatchmakingQueue() {
        this.isMatchmaking = true;
        
        const mainOps = document.getElementById('lobby-main-options');
        const dashboard = document.getElementById('lobby-matchmaking-dashboard');
        const statusText = document.getElementById('matchmaking-status-text');

        if (mainOps) mainOps.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';

        let seconds = 0;
        const names = ['Sophia', 'Liam', 'Hiroshi', 'Emma', 'Mateo', 'Anna', 'Yousuf'];
        const pings = [35, 78, 120, 92, 54, 180, 62];

        this.matchmakingTimer = setInterval(() => {
            seconds++;
            if (statusText) statusText.textContent = `Searching... Queue size: ${Math.floor(25 - seconds * 1.5)}. Elapsed: ${seconds}s`;

            if (seconds >= 4) { // Found match!
                clearInterval(this.matchmakingTimer);
                
                const matchedNames = [];
                for (let k = 0; k < 3; k++) {
                    const rIdx = Math.floor(Math.random() * names.length);
                    matchedNames.push(names.splice(rIdx, 1)[0]);
                }

                this.gameMode = 'online';
                this.activePlayersCount = 4;
                this.inactivePlayers = { red: false, green: false, yellow: false, blue: false };
                this.isBotColor = { red: false, green: true, yellow: true, blue: true };
                
                this.playerNames = {
                    red: 'Player 1 (You)',
                    green: `${matchedNames[0]} (Ping: ${pings[Math.floor(Math.random() * pings.length)]}ms)`,
                    yellow: `${matchedNames[1]} (Ping: ${pings[Math.floor(Math.random() * pings.length)]}ms)`,
                    blue: `${matchedNames[2]} (Ping: ${pings[Math.floor(Math.random() * pings.length)]}ms)`
                };

                this.closeOverlay('online-lobby-overlay');
                
                this.playersOrder.forEach(color => {
                    const latencyEl = document.getElementById(`latency-${color}`);
                    if (latencyEl) {
                        latencyEl.style.display = 'block';
                        latencyEl.innerHTML = `Ping: ${Math.floor(35 + Math.random() * 80)}ms <span style="color:var(--color-green);">●</span>`;
                    }
                });

                this.syncPlayerNamesToPanels();
                this.startGame();
            }
        }, 1000);
    }

    cancelMatchmakingQueue() {
        this.isMatchmaking = false;
        clearInterval(this.matchmakingTimer);

        const mainOps = document.getElementById('lobby-main-options');
        const dashboard = document.getElementById('lobby-matchmaking-dashboard');

        if (mainOps) mainOps.style.display = 'flex';
        if (dashboard) dashboard.style.display = 'none';
    }

    syncPlayerNamesToPanels() {
        this.playersOrder.forEach(color => {
            const nameEl = document.getElementById(`name-${color}`);
            const panelEl = document.getElementById(`panel-${color}`);
            if (nameEl && panelEl) {
                if (this.inactivePlayers[color]) {
                    nameEl.textContent = 'Disabled';
                    panelEl.style.display = 'none';
                } else {
                    nameEl.textContent = this.playerNames[color] + (this.isBotColor[color] && this.gameMode === 'single' ? ' [Bot]' : '');
                    panelEl.style.display = 'block';
                }
            }
        });
    }

    displayChatBubble(color, text) {
        const bubble = document.getElementById(`chat-pop-${color}`);
        if (bubble) {
            bubble.textContent = text;
            bubble.classList.add('show');
            
            setTimeout(() => {
                bubble.classList.remove('show');
            }, 2500);
        }
    }

    startGame(startColor = null) {
        this.matchStartTime = Date.now();
        
        this.playersOrder.forEach(color => {
            this.tokens[color].forEach(token => {
                token.position = -1;
                token.isFinished = false;
                this.moveTokenToHomeSlot(token);
            });
            this.stats[color] = { turnsPlayed: 0, capturesMade: 0, timesCaptured: 0, distanceTravelled: 0 };
            this.updateStatsUI(color);
        });

        let initialColor = startColor;
        if (!initialColor) {
            if (this.gameMode === 'online' && this.hostColor) {
                initialColor = this.hostColor;
            } else {
                initialColor = this.playersOrder.find(c => !this.inactivePlayers[c]) || 'red';
            }
        }

        this.currentPlayerIdx = this.playersOrder.indexOf(initialColor);
        if (this.currentPlayerIdx === -1) this.currentPlayerIdx = 0;

        // Skip any starting inactive player
        while (this.inactivePlayers[this.getCurrentPlayerColor()]) {
            this.currentPlayerIdx = (this.currentPlayerIdx + 1) % 4;
        }

        const activeColor = this.getCurrentPlayerColor();
        this.consecutiveSixes = 0;
        this.isRolling = false;
        this.lastRollResult = null;
        this.hasPendingMove = false;
        this.extraTurnAwarded = false;

        this.gameState = 'playing';
        window.LudoUtils.dom.fadeTransition('menu-screen', 'game-play-screen', 500);

        this.updateActivePlayerUI();
        this.recalculateBoardClusters();
        
        this.logFeedMessage(`Game started! ${this.playerNames[activeColor]} plays first.`);
        this.showToastNotification('Game Started!', activeColor);

        const gameDice = document.getElementById('game-dice');
        if (gameDice) {
            gameDice.className = `dice show-1 skin-${this.equippedDiceSkin}`;
        }

        // Trigger bot turn if starting player is a bot
        if (this.isBotColor[activeColor]) {
            this.playBotTurn();
        }
    }

    resetGame() {
        this.isConfettiMode = false;
        this.gameState = 'menu';
    }

    saveActiveMatch() {
        if (this.gameMode === 'online') return;

        const tokenStates = {};
        this.playersOrder.forEach(color => {
            tokenStates[color] = this.tokens[color].map(t => ({
                id: t.id,
                pos: t.position,
                finished: t.isFinished
            }));
        });

        const saveData = {
            gameMode: this.gameMode,
            activePlayersCount: this.activePlayersCount,
            inactivePlayers: this.inactivePlayers,
            currentPlayerIdx: this.currentPlayerIdx,
            consecutiveSixes: this.consecutiveSixes,
            extraTurnAwarded: this.extraTurnAwarded,
            playerNames: this.playerNames,
            isBotColor: this.isBotColor,
            tokenStates: tokenStates,
            stats: this.stats,
            matchStartTime: this.matchStartTime
        };

        window.LudoUtils.storage.set('ludo_active_match', saveData);
    }

    loadSavedMatch() {
        const data = window.LudoUtils.storage.get('ludo_active_match');
        if (!data) return;

        this.gameMode = data.gameMode;
        this.activePlayersCount = data.activePlayersCount;
        this.inactivePlayers = data.inactivePlayers;
        this.currentPlayerIdx = data.currentPlayerIdx;
        this.consecutiveSixes = data.consecutiveSixes;
        this.extraTurnAwarded = data.extraTurnAwarded;
        this.playerNames = data.playerNames;
        this.isBotColor = data.isBotColor;
        this.stats = data.stats;
        this.matchStartTime = data.matchStartTime || Date.now();

        this.playersOrder.forEach(color => {
            const nameEl = document.getElementById(`name-${color}`);
            if (nameEl) {
                if (this.inactivePlayers[color]) {
                    nameEl.textContent = 'Disabled';
                    nameEl.parentElement.parentElement.style.display = 'none';
                } else {
                    nameEl.textContent = this.playerNames[color] + (this.isBotColor[color] ? ' [Bot]' : '');
                    nameEl.parentElement.parentElement.style.display = 'block';
                }
            }
            this.updateStatsUI(color);
        });

        this.playersOrder.forEach(color => {
            const savedTokens = data.tokenStates[color];
            this.tokens[color].forEach((token, idx) => {
                const sT = savedTokens[idx];
                token.position = sT.pos;
                token.isFinished = sT.finished;

                if (token.isFinished) {
                    if (token.element) token.element.style.display = 'none';
                } else if (token.position === -1) {
                    this.moveTokenToHomeSlot(token);
                } else {
                    const coords = this.playerPaths[color][token.position];
                    this.positionTokenOnBoard(token, coords);
                }
            });
        });

        this.recalculateBoardClusters();
        this.updateActivePlayerUI();

        window.LudoUtils.dom.fadeTransition('menu-screen', 'game-play-screen', 500);
        this.gameState = 'playing';

        const activeColor = this.getCurrentPlayerColor();
        this.showToastNotification(`Match Resumed! ${this.playerNames[activeColor]}'s Turn`, activeColor);
        this.logFeedMessage(`Match resumed. Play is restored.`);

        if (this.isBotColor[activeColor]) {
            this.playBotTurn();
        }
    }

    deleteActiveMatch() {
        window.localStorage.removeItem('ludo_active_match');
    }

    loadGlobalStatistics() {
        const stats = window.LudoUtils.storage.get('ludo_global_stats');
        if (stats) this.globalStats = { ...this.globalStats, ...stats };

        const achievements = window.LudoUtils.storage.get('ludo_achievements');
        if (achievements) this.unlockedAchievements = achievements;

        const levelData = window.LudoUtils.storage.get('ludo_progression_v1');
        if (levelData) {
            this.economy = levelData.economy || this.economy;
            this.progression = levelData.progression || this.progression;
            this.equippedDiceSkin = levelData.equippedDiceSkin || this.equippedDiceSkin;
            this.purchasedSkins = levelData.purchasedSkins || this.purchasedSkins;
            
            // Phase 13 variables deserializer
            this.seasonPass = levelData.seasonPass || this.seasonPass;
            this.activeLanguage = levelData.activeLanguage || this.activeLanguage;
            this.activeTheme = levelData.activeTheme || this.activeTheme;
            this.highContrast = levelData.highContrast !== undefined ? levelData.highContrast : this.highContrast;
            this.reducedMotion = levelData.reducedMotion !== undefined ? levelData.reducedMotion : this.reducedMotion;
        }

        // Apply toggled selectors on UI inputs
        const contrastInput = document.getElementById('settings-high-contrast');
        const motionInput = document.getElementById('settings-reduced-motion');
        const langInput = document.getElementById('settings-language');
        const themeInput = document.getElementById('settings-theme');

        if (contrastInput) contrastInput.checked = this.highContrast;
        if (motionInput) motionInput.checked = this.reducedMotion;
        if (langInput) langInput.value = this.activeLanguage;
        if (themeInput) themeInput.value = this.activeTheme;

        if (this.highContrast) document.body.classList.add('high-contrast');
        if (this.reducedMotion) document.body.classList.add('reduced-motion');
    }

    saveGlobalStatistics() {
        window.LudoUtils.storage.set('ludo_global_stats', this.globalStats);
        window.LudoUtils.storage.set('ludo_achievements', this.unlockedAchievements);
        
        const levelData = {
            economy: this.economy,
            progression: this.progression,
            equippedDiceSkin: this.equippedDiceSkin,
            purchasedSkins: this.purchasedSkins,
            
            // Phase 13 variables serializer
            seasonPass: this.seasonPass,
            activeLanguage: this.activeLanguage,
            activeTheme: this.activeTheme,
            highContrast: this.highContrast,
            reducedMotion: this.reducedMotion
        };
        window.LudoUtils.storage.set('ludo_progression_v1', levelData);
    }

    unlockAchievement(id) {
        if (this.unlockedAchievements.includes(id)) return;

        this.unlockedAchievements.push(id);
        this.saveGlobalStatistics();

        const ach = this.achievementsList.find(a => a.id === id);
        if (ach) {
            this.playAudio('notification');
            this.showToastNotification(`Achievement Unlocked: ${ach.title}!`, 'yellow');
        }
    }

    openStatsOverlay() {
        const playedEl = document.getElementById('g-stats-played');
        const wonEl = document.getElementById('g-stats-won');
        const capEl = document.getElementById('g-stats-captures');
        const distEl = document.getElementById('g-stats-distance');

        if (playedEl) playedEl.textContent = this.globalStats.gamesPlayed;
        if (wonEl) {
            const ratio = this.globalStats.gamesPlayed > 0 
                ? Math.floor((this.globalStats.gamesWon / this.globalStats.gamesPlayed) * 100) 
                : 0;
            wonEl.textContent = `${this.globalStats.gamesWon} (${ratio}%)`;
        }
        if (capEl) capEl.textContent = this.globalStats.totalCaptures;
        if (distEl) distEl.textContent = `${this.globalStats.distanceTravelled} cells`;

        const scrollList = document.getElementById('achievements-scroll-list');
        if (scrollList) {
            scrollList.innerHTML = '';
            this.achievementsList.forEach(ach => {
                const unlocked = this.unlockedAchievements.includes(ach.id);
                const item = document.createElement('div');
                item.style.display = 'flex';
                item.style.alignItems = 'center';
                item.style.gap = '12px';
                item.style.background = unlocked ? 'rgba(255, 204, 0, 0.08)' : 'rgba(255,255,255,0.02)';
                item.style.border = unlocked ? '1px solid rgba(255, 204, 0, 0.25)' : '1px solid rgba(255,255,255,0.04)';
                item.style.padding = '10px 14px';
                item.style.borderRadius = '10px';
                item.style.opacity = unlocked ? '1' : '0.45';

                item.innerHTML = `
                    <span style="font-size: 1.6rem;">${unlocked ? '🏆' : '🔒'}</span>
                    <div style="flex:1;">
                        <h4 style="font-family: var(--font-heading); font-size: 1.05rem; margin-bottom: 2px; color: ${unlocked ? 'var(--color-yellow)' : 'var(--text-primary)'};">${ach.title}</h4>
                        <p style="font-size:0.8rem; color: var(--text-muted);">${ach.desc}</p>
                    </div>
                `;
                scrollList.appendChild(item);
            });
        }

        let rank = 'Bronze';
        if (this.progression.rp >= 2500) rank = 'Legend';
        else if (this.progression.rp >= 2200) rank = 'Grandmaster';
        else if (this.progression.rp >= 2000) rank = 'Master';
        else if (this.progression.rp >= 1800) rank = 'Diamond';
        else if (this.progression.rp >= 1600) rank = 'Platinum';
        else if (this.progression.rp >= 1400) rank = 'Gold';
        else if (this.progression.rp >= 1200) rank = 'Silver';

        const statsHeader = document.querySelector('#stats-overlay .overlay-header');
        if (statsHeader) {
            let badge = statsHeader.querySelector('.progression-badge-label');
            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'progression-badge-label';
                badge.style.fontSize = '0.9rem';
                badge.style.color = 'var(--color-yellow)';
                badge.style.marginTop = '4px';
                statsHeader.appendChild(badge);
            }
            badge.innerHTML = `Level ${this.progression.level} (${this.progression.xp} / ${this.progression.level * 100} XP) | Rank: ${rank} (${this.progression.rp} RP)`;
        }

        this.openOverlay('stats-overlay');
    }

    exportBackup() {
        const bundle = {
            settings: this.settings,
            globalStats: this.globalStats,
            unlockedAchievements: this.unlockedAchievements,
            economy: this.economy,
            progression: this.progression,
            equippedDiceSkin: this.equippedDiceSkin,
            purchasedSkins: this.purchasedSkins,
            seasonPass: this.seasonPass,
            activeLanguage: this.activeLanguage,
            activeTheme: this.activeTheme,
            highContrast: this.highContrast,
            reducedMotion: this.reducedMotion
        };
        const str = JSON.stringify(bundle);
        navigator.clipboard.writeText(str).then(() => {
            alert('Your save profile JSON backup has been copied to your clipboard!');
        }).catch(err => {
            alert('Failed to copy to clipboard: ' + err);
        });
    }

    importBackup() {
        const str = prompt('Paste your backup JSON profile string below:');
        if (!str) return;

        try {
            const bundle = JSON.parse(str);
            if (bundle.settings && bundle.globalStats && bundle.unlockedAchievements) {
                this.settings = bundle.settings;
                this.globalStats = bundle.globalStats;
                this.unlockedAchievements = bundle.unlockedAchievements;
                this.economy = bundle.economy || this.economy;
                this.progression = bundle.progression || this.progression;
                this.equippedDiceSkin = bundle.equippedDiceSkin || this.equippedDiceSkin;
                this.purchasedSkins = bundle.purchasedSkins || this.purchasedSkins;
                
                this.seasonPass = bundle.seasonPass || this.seasonPass;
                this.activeLanguage = bundle.activeLanguage || this.activeLanguage;
                this.activeTheme = bundle.activeTheme || this.activeTheme;
                this.highContrast = bundle.highContrast !== undefined ? bundle.highContrast : this.highContrast;
                this.reducedMotion = bundle.reducedMotion !== undefined ? bundle.reducedMotion : this.reducedMotion;

                this.saveSettings();
                this.saveGlobalStatistics();
                alert('Save profile imported successfully! Page will now reload.');
                window.location.reload();
            } else {
                alert('Invalid backup structure!');
            }
        } catch (e) {
            alert('Failed to parse JSON string: ' + e);
        }
    }

    factoryReset() {
        window.localStorage.clear();
        alert('All statistics, match records, and settings have been reset. Reloading now.');
        window.location.reload();
    }

    loadSettings() {
        const stored = window.LudoUtils.storage.get(window.LudoConfig.storageKey.settings);
        if (stored) {
            this.settings = { ...this.settings, ...stored };
            
            const musicVolSlider = document.getElementById('settings-music-vol');
            const sfxVolSlider = document.getElementById('settings-sfx-vol');
            const vibrationToggle = document.getElementById('settings-vibration');
            const particlesToggle = document.getElementById('settings-particles');
            const difficultySelect = document.getElementById('settings-difficulty');

            if (musicVolSlider) musicVolSlider.value = this.settings.musicVol;
            if (sfxVolSlider) sfxVolSlider.value = this.settings.sfxVol;
            if (vibrationToggle) vibrationToggle.checked = this.settings.vibration;
            if (particlesToggle) particlesToggle.checked = this.settings.particles;
            if (difficultySelect) difficultySelect.value = this.settings.difficulty;

            this.audioEngine.musicVolume = this.settings.musicVol / 100;
            this.audioEngine.sfxVolume = this.settings.sfxVol / 100;
        }
    }

    saveSettings() {
        window.LudoUtils.storage.set(window.LudoConfig.storageKey.settings, this.settings);
    }

    simulateLoading(duration) {
        const progressBar = document.querySelector('.loading-progress-fill');
        const loadingText = document.querySelector('.loading-text');
        
        let start = null;
        const progressSteps = [
            'Initializing Game Canvas...',
            'Loading Visual Sprites...',
            'Caching Sound Effects...',
            'Spawning AI Brains...',
            'Ready to Play!'
        ];

        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const progress = Math.min((elapsed / duration) * 100, 100);
            
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }

            if (loadingText) {
                const stepIdx = Math.min(Math.floor((progress / 100) * progressSteps.length), progressSteps.length - 1);
                loadingText.textContent = progressSteps[stepIdx];
            }

            if (elapsed < duration) {
                requestAnimationFrame(animate);
            } else {
                window.LudoUtils.dom.fadeTransition('loading-screen', 'menu-screen', 500);
                this.gameState = 'menu';
            }
        };

        requestAnimationFrame(animate);
    }

    openOverlay(id) {
        const overlay = document.getElementById(id);
        if (overlay) {
            overlay.classList.add('active');
            overlay.removeAttribute('aria-hidden');
            overlay.querySelector('.overlay-content')?.focus();
        }
    }

    closeOverlay(id) {
        const overlay = document.getElementById(id);
        if (overlay) {
            overlay.classList.remove('active');
            overlay.setAttribute('aria-hidden', 'true');
        }
    }

    buildPathMaps() {
        this.commonPath = [
            { r: 7, c: 1 }, { r: 7, c: 2 }, { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }, { r: 7, c: 6 },
            { r: 6, c: 7 }, { r: 5, c: 7 }, { r: 4, c: 7 }, { r: 3, c: 7 }, { r: 2, c: 7 }, { r: 1, c: 7 },
            { r: 1, c: 8 },
            { r: 1, c: 9 }, { r: 2, c: 9 }, { r: 3, c: 9 }, { r: 4, c: 9 }, { r: 5, c: 9 }, { r: 6, c: 9 },
            { r: 7, c: 10 }, { r: 7, c: 11 }, { r: 7, c: 12 }, { r: 7, c: 13 }, { r: 7, c: 14 }, { r: 7, c: 15 },
            { r: 8, c: 15 },
            { r: 9, c: 15 }, { r: 9, c: 14 }, { r: 9, c: 13 }, { r: 9, c: 12 }, { r: 9, c: 11 }, { r: 9, c: 10 },
            { r: 10, c: 9 }, { r: 11, c: 9 }, { r: 12, c: 9 }, { r: 13, c: 9 }, { r: 14, c: 9 }, { r: 15, c: 9 },
            { r: 15, c: 8 },
            { r: 15, c: 7 }, { r: 14, c: 7 }, { r: 13, c: 7 }, { r: 12, c: 7 }, { r: 11, c: 7 }, { r: 10, c: 7 },
            { r: 9, c: 6 }, { r: 9, c: 5 }, { r: 9, c: 4 }, { r: 9, c: 3 }, { r: 9, c: 2 }, { r: 9, c: 1 },
            { r: 8, c: 1 }
        ];

        const exitOffsets = { red: 1, green: 14, yellow: 27, blue: 40 };
        const homePaths = {
            red: [ { r: 8, c: 2 }, { r: 8, c: 3 }, { r: 8, c: 4 }, { r: 8, c: 5 }, { r: 8, c: 6 } ],
            green: [ { r: 2, c: 8 }, { r: 3, c: 8 }, { r: 4, c: 8 }, { r: 5, c: 8 }, { r: 6, c: 8 } ],
            yellow: [ { r: 8, c: 14 }, { r: 8, c: 13 }, { r: 8, c: 12 }, { r: 8, c: 11 }, { r: 8, c: 10 } ],
            blue: [ { r: 14, c: 8 }, { r: 13, c: 8 }, { r: 12, c: 8 }, { r: 11, c: 8 }, { r: 10, c: 8 } ]
        };
        const winningCenters = {
            red: { r: 8, c: 7 },
            green: { r: 7, c: 8 },
            yellow: { r: 8, c: 9 },
            blue: { r: 9, c: 8 }
        };

        this.playersOrder.forEach(color => {
            const startIdx = exitOffsets[color];
            const path = [];

            for (let i = 0; i < 51; i++) {
                const mapIdx = (startIdx + i) % 52;
                path.push(this.commonPath[mapIdx]);
            }

            path.push(...homePaths[color]);
            path.push(winningCenters[color]);

            this.playerPaths[color] = path;
        });
    }

    renderLudoBoardCells() {
        const cellsContainer = document.getElementById('board-cells-container');
        if (!cellsContainer) return;

        cellsContainer.innerHTML = '';

        const startCells = { red: { r: 7, c: 2 }, green: { r: 2, c: 9 }, yellow: { r: 9, c: 14 }, blue: { r: 14, c: 7 } };
        const safeCells = [ { r: 9, c: 3 }, { r: 3, c: 7 }, { r: 7, c: 13 }, { r: 13, c: 9 } ];
        const homePaths = {
            red: [ { r: 8, c: 2 }, { r: 8, c: 3 }, { r: 8, c: 4 }, { r: 8, c: 5 }, { r: 8, c: 6 } ],
            green: [ { r: 2, c: 8 }, { r: 3, c: 8 }, { r: 4, c: 8 }, { r: 5, c: 8 }, { r: 6, c: 8 } ],
            yellow: [ { r: 8, c: 14 }, { r: 8, c: 13 }, { r: 8, c: 12 }, { r: 8, c: 11 }, { r: 8, c: 10 } ],
            blue: [ { r: 14, c: 8 }, { r: 13, c: 8 }, { r: 12, c: 8 }, { r: 11, c: 8 }, { r: 10, c: 8 } ]
        };

        for (let r = 1; r <= 15; r++) {
            for (let c = 1; c <= 15; c++) {
                if (r <= 6 && c <= 6) continue;
                if (r <= 6 && c >= 10) continue;
                if (r >= 10 && c <= 6) continue;
                if (r >= 10 && c >= 10) continue;
                if (r >= 7 && r <= 9 && c >= 7 && c <= 9) continue;

                const cell = document.createElement('div');
                cell.className = 'board-cell';
                cell.style.gridRow = r;
                cell.style.gridColumn = c;
                cell.id = `cell-${r}-${c}`;

                let isAssigned = false;

                if (r === startCells.red.r && c === startCells.red.c) { cell.classList.add('cell-red-start'); isAssigned = true; }
                else if (r === startCells.green.r && c === startCells.green.c) { cell.classList.add('cell-green-start'); isAssigned = true; }
                else if (r === startCells.yellow.r && c === startCells.yellow.c) { cell.classList.add('cell-yellow-start'); isAssigned = true; }
                else if (r === startCells.blue.r && c === startCells.blue.c) { cell.classList.add('cell-blue-start'); isAssigned = true; }

                if (!isAssigned) {
                    const isSafe = safeCells.some(sc => sc.r === r && sc.c === c);
                    if (isSafe) {
                        cell.classList.add('cell-safe');
                        isAssigned = true;
                    }
                }

                if (!isAssigned) {
                    if (homePaths.red.some(p => p.r === r && p.c === c)) { cell.classList.add('cell-red-path'); }
                    else if (homePaths.green.some(p => p.r === r && p.c === c)) { cell.classList.add('cell-green-path'); }
                    else if (homePaths.yellow.some(p => p.r === r && p.c === c)) { cell.classList.add('cell-yellow-path'); }
                    else if (homePaths.blue.some(p => p.r === r && p.c === c)) { cell.classList.add('cell-blue-path'); }
                }

                cellsContainer.appendChild(cell);
            }
        }
    }

    initTokenObjects() {
        this.playersOrder.forEach(color => {
            this.tokens[color] = [];
            for (let i = 0; i < 4; i++) {
                const el = document.getElementById(`token-${color}-${i}`);
                const tokenState = {
                    id: i,
                    color: color,
                    position: -1,
                    isFinished: false,
                    element: el
                };
                
                if (el) {
                    el.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.handleTokenClick(tokenState);
                    });
                }

                this.tokens[color].push(tokenState);
            }
        });
    }

    setupDiceSystem() {
        const btnRoll = document.getElementById('btn-roll-dice');
        const gameDice = document.getElementById('game-dice');

        const handleRollClick = () => {
            if (this.gameMode === 'online') {
                const activeColor = this.getCurrentPlayerColor();
                if (activeColor !== this.myOnlineColor || this.isBotColor[activeColor]) {
                    return;
                }
                
                if (this.isRolling || this.gameState !== 'playing' || this.hasPendingMove) return;

                const rollValue = Math.floor(Math.random() * 6) + 1;
                this.socket.emit('game_action_roll', { color: this.myOnlineColor, value: rollValue });
            } else {
                if (!this.isBotColor[this.getCurrentPlayerColor()]) {
                    this.rollActiveDice();
                }
            }
        };

        if (btnRoll) {
            btnRoll.addEventListener('click', () => {
                this.playAudio('click');
                handleRollClick();
            });
        }

        if (gameDice) {
            gameDice.addEventListener('click', () => {
                handleRollClick();
            });
        }
    }

    rollActiveDice(forcedValue = null) {
        if (this.isRolling || this.gameState !== 'playing' || this.hasPendingMove) return;

        this.isRolling = true;
        this.playAudio('dice-roll');
        this.triggerVibration(100);

        const gameDice = document.getElementById('game-dice');
        const btnRoll = document.getElementById('btn-roll-dice');

        if (btnRoll) btnRoll.disabled = true;

        if (gameDice) {
            gameDice.className = `dice rolling skin-${this.equippedDiceSkin}`;
        }

        const activeColor = this.getCurrentPlayerColor();
        this.updatePlayerStatus(activeColor, 'Rolling...');

        const rollValue = forcedValue !== null ? forcedValue : (Math.floor(Math.random() * 6) + 1);
        this.lastRollResult = rollValue;

        this.stats[activeColor].turnsPlayed++;
        this.updateStatsUI(activeColor);

        if (activeColor === 'red' && rollValue === 6) {
            const m = this.dailyMissions.find(x => x.id === 'roll-sixes');
            if (m && m.current < m.target) {
                m.current++;
                this.saveGlobalStatistics();
            }
        }

        if (rollValue === 6 && this.consecutiveSixes === 2) {
            this.unlockAchievement('lucky-roller');
        }

        setTimeout(() => {
            if (gameDice) {
                gameDice.className = `dice show-${rollValue} skin-${this.equippedDiceSkin}`;
            }

            this.playAudio('click');

            const activePlayerName = this.playerNames[activeColor];
            this.logFeedMessage(`${activePlayerName} rolled a ${rollValue}!`);

            const miniDice = document.getElementById(`mini-dice-${activeColor}`);
            if (miniDice) miniDice.textContent = rollValue;

            const movableTokens = this.getMovableTokens(activeColor, rollValue);

            if (movableTokens.length === 0) {
                this.logFeedMessage(`No moves available for ${activePlayerName}!`);
                this.showToastNotification(`No valid moves!`, activeColor);
                this.updatePlayerStatus(activeColor, 'No Moves');
                
                if (rollValue !== 6) {
                    this.consecutiveSixes = 0;
                }
                
                setTimeout(() => {
                    if (this.gameMode === 'online') {
                        if (this.socket && this.isHostClient) {
                            let nextIdx = this.currentPlayerIdx;
                            do {
                                nextIdx = (nextIdx + 1) % 4;
                            } while (this.inactivePlayers[this.playersOrder[nextIdx]]);
                            this.socket.emit('game_action_pass', { nextPlayerIdx: nextIdx });
                        }
                    } else {
                        this.passTurn();
                    }
                }, 1500);
            } else {
                this.hasPendingMove = true;
                this.updatePlayerStatus(activeColor, 'Select Token');

                if (this.gameMode === 'online') {
                    if (activeColor === this.myOnlineColor && !this.isBotColor[activeColor]) {
                        this.highlightSelectableTokens(movableTokens);
                    } else if (this.isBotColor[activeColor] && this.isHostClient) {
                        const thinkingDelay = 1200 + Math.random() * 800;
                        setTimeout(() => {
                            this.playBotDecision(activeColor, rollValue, movableTokens);
                        }, thinkingDelay);
                    }
                } else {
                    if (!this.isBotColor[activeColor]) {
                        this.highlightSelectableTokens(movableTokens);
                    } else {
                        setTimeout(() => {
                            this.playBotDecision(activeColor, rollValue, movableTokens);
                        }, 800);
                    }
                }
            }

        }, 600);
    }

    playBotTurn() {
        if (this.gameState !== 'playing') return;

        if (this.gameMode === 'online' && !this.isHostClient) {
            return;
        }

        const activeColor = this.getCurrentPlayerColor();
        this.updatePlayerStatus(activeColor, 'Thinking...');

        const rollDelay = this.gameMode === 'online' ? (1500 + Math.random() * 1000) : 1000;

        if (this.gameMode === 'online' && Math.random() < 0.15) {
            const peerTexts = ['Nice game!', 'Oops!', '🤣', '🔥', 'Your turn!'];
            const randomText = peerTexts[Math.floor(Math.random() * peerTexts.length)];
            setTimeout(() => {
                this.displayChatBubble(activeColor, randomText);
            }, rollDelay / 2);
        }

        setTimeout(() => {
            if (this.gameMode === 'online') {
                const rollValue = Math.floor(Math.random() * 6) + 1;
                this.socket.emit('game_action_roll', { color: activeColor, value: rollValue });
            } else {
                this.rollActiveDice();
            }
        }, rollDelay);
    }

    playBotDecision(color, rollValue, movableTokens) {
        this.clearSelectableHighlights();
        this.hasPendingMove = false;

        const bestToken = this.calculateBestBotMove(color, rollValue, movableTokens);
        
        if (bestToken && bestToken.element) {
            bestToken.element.classList.add('selectable');
            setTimeout(() => {
                bestToken.element.classList.remove('selectable');
                if (this.gameMode === 'online') {
                    this.socket.emit('game_action_move', { color: bestToken.color, tokenIdx: bestToken.id, steps: rollValue });
                } else {
                    this.animateTokenMove(bestToken, rollValue);
                }
            }, 600);
        } else {
            if (this.gameMode === 'online') {
                if (this.isHostClient) {
                    let nextIdx = this.currentPlayerIdx;
                    do {
                        nextIdx = (nextIdx + 1) % 4;
                    } while (this.inactivePlayers[this.playersOrder[nextIdx]]);
                    this.socket.emit('game_action_pass', { nextPlayerIdx: nextIdx });
                }
            } else {
                this.passTurn();
            }
        }
    }

    calculateBestBotMove(color, rollValue, movableTokens) {
        const difficulty = this.settings.difficulty;

        if (difficulty === 'easy') {
            const rIdx = Math.floor(Math.random() * movableTokens.length);
            return movableTokens[rIdx];
        }

        if (difficulty === 'medium') {
            const captureToken = this.findCapturingToken(color, rollValue, movableTokens);
            if (captureToken) return captureToken;

            const homeExitToken = movableTokens.find(t => t.position === -1 && rollValue === 6);
            if (homeExitToken) return homeExitToken;

            return this.findFurthestProgressToken(movableTokens);
        }

        let bestToken = movableTokens[0];
        let bestScore = -Infinity;

        movableTokens.forEach(token => {
            let score = 0;
            const startPos = token.position;
            const endPos = (startPos === -1) ? 0 : (startPos + rollValue);
            const finalCoords = this.playerPaths[color][endPos];

            const capturedOpponents = this.checkOpponentsToCapture(color, finalCoords);
            if (capturedOpponents.length > 0 && !this.checkIfSafeCell(finalCoords)) {
                score += 1500;
            }

            if (endPos === 56) {
                score += 1200;
            }

            if (startPos < 51 && endPos >= 51) {
                score += 700;
            }

            if (startPos === -1 && rollValue === 6) {
                score += 600;
            }

            if (this.checkIfSafeCell(finalCoords)) {
                score += 400;
            }

            if (startPos >= 0 && this.isTokenInDanger(color, token)) {
                score += 500;
            }

            if (this.checkSelfStackPotential(color, finalCoords)) {
                score += 300;
            }

            score += endPos * 4;

            if (endPos < 51 && !this.checkIfSafeCell(finalCoords)) {
                if (this.isDestinationDangerous(color, finalCoords)) {
                    score -= 400;
                }
            }

            if (score > bestScore) {
                bestScore = score;
                bestToken = token;
            }
        });

        return bestToken;
    }

    findCapturingToken(color, rollValue, movableTokens) {
        return movableTokens.find(token => {
            const targetPos = (token.position === -1) ? 0 : (token.position + rollValue);
            const coords = this.playerPaths[color][targetPos];
            if (this.checkIfSafeCell(coords)) return false;
            return this.checkOpponentsToCapture(color, coords).length > 0;
        });
    }

    findFurthestProgressToken(movableTokens) {
        let maxPos = -2;
        let chosen = movableTokens[0];
        movableTokens.forEach(t => {
            if (t.position > maxPos) {
                maxPos = t.position;
                chosen = t;
            }
        });
        return chosen;
    }

    isTokenInDanger(myColor, token) {
        const coords = this.playerPaths[myColor][token.position];
        return this.isDestinationDangerous(myColor, coords);
    }

    isDestinationDangerous(myColor, coords) {
        let inDanger = false;

        this.playersOrder.forEach(opponentColor => {
            if (opponentColor === myColor || this.inactivePlayers[opponentColor]) return;

            this.tokens[opponentColor].forEach(opponentToken => {
                if (opponentToken.position === -1 || opponentToken.isFinished) return;

                const opponentCoords = this.playerPaths[opponentColor][opponentToken.position];
                const distance = this.getOpponentDistanceToCoords(opponentColor, opponentToken.position, coords);
                if (distance >= 1 && distance <= 6) {
                    inDanger = true;
                }
            });
        });

        return inDanger;
    }

    getOpponentDistanceToCoords(opponentColor, opponentPos, targetCoords) {
        const path = this.playerPaths[opponentColor];
        for (let step = 1; step <= 6; step++) {
            const nextIdx = opponentPos + step;
            if (nextIdx > 56) break;
            const nextCoords = path[nextIdx];
            if (nextCoords.r === targetCoords.r && nextCoords.c === targetCoords.c) {
                return step;
            }
        }
        return -1;
    }

    checkSelfStackPotential(color, coords) {
        return this.tokens[color].some(t => {
            if (t.position === -1 || t.isFinished) return false;
            const tCoords = this.playerPaths[color][t.position];
            return tCoords.r === coords.r && tCoords.c === coords.c;
        });
    }

    getMovableTokens(color, rollValue) {
        return this.tokens[color].filter(token => {
            if (token.isFinished) return false;
            if (token.position === -1) {
                return rollValue === 6;
            }
            if ((token.position + rollValue) > 56) return false;
            return !this.isPathBlockedByBlockade(token, token.position, rollValue);
        });
    }

    isPathBlockedByBlockade(token, startPos, steps) {
        // Disabled blockade blocking completely as requested
        return false;
    }

    hasOpponentBlockadeAt(myColor, coords) {
        let count = 0;
        this.playersOrder.forEach(color => {
            if (color === myColor || this.inactivePlayers[color]) return;
            this.tokens[color].forEach(token => {
                if (token.position === -1 || token.isFinished) return;
                const tokenCoords = this.playerPaths[color][token.position];
                if (tokenCoords.r === coords.r && tokenCoords.c === coords.c) {
                    count++;
                }
            });
        });
        return count >= 2;
    }

    highlightSelectableTokens(movableList) {
        movableList.forEach(token => {
            if (token.element) {
                token.element.classList.add('selectable');
                token.element.style.pointerEvents = 'auto';
                token.element.style.cursor = 'pointer';
                token.element.style.zIndex = '200';
            }
        });
    }

    clearSelectableHighlights() {
        this.playersOrder.forEach(color => {
            this.tokens[color].forEach(token => {
                if (token.element && !token.isFinished) {
                    token.element.classList.remove('selectable');
                    token.element.style.pointerEvents = 'auto';
                    token.element.style.cursor = 'default';
                    token.element.style.zIndex = '';
                }
            });
        });
    }

    handleTokenClick(token) {
        if (!this.hasPendingMove || token.color !== this.getCurrentPlayerColor()) return;
        if (this.isBotColor[token.color]) return;

        if (this.gameMode === 'online') {
            if (token.color !== this.myOnlineColor) return;
        }

        const movableList = this.getMovableTokens(token.color, this.lastRollResult);
        const isMovable = movableList.some(t => t.id === token.id);
        
        if (!isMovable) return;

        this.clearSelectableHighlights();
        this.hasPendingMove = false;

        const rollValue = this.lastRollResult;

        if (this.gameMode === 'online') {
            this.socket.emit('game_action_move', { color: token.color, tokenIdx: token.id, steps: rollValue });
        } else {
            this.animateTokenMove(token, rollValue);
        }
    }

    async animateTokenMove(token, steps) {
        this.isRolling = true;
        const color = token.color;
        const startPos = token.position;
        const endPos = (startPos === -1) ? 0 : (startPos + steps);

        this.stats[color].distanceTravelled += steps;
        this.globalStats.distanceTravelled += steps;

        if (startPos === -1 && endPos === 0) {
            token.position = 0;
            this.playAudio('notification');
            this.triggerVibration(50);
            
            const targetCellCoords = this.playerPaths[color][0];
            this.positionTokenOnBoard(token, targetCellCoords);
            this.updateStatsUI(color);
            this.recalculateBoardClusters();

            this.saveActiveMatch();

            setTimeout(() => {
                this.isRolling = false;
                this.processTurnLogic(steps);
            }, 300);
            return;
        }

        let currentPos = startPos;
        for (let s = 1; s <= steps; s++) {
            currentPos++;
            token.position = currentPos;
            
            const coords = this.playerPaths[color][currentPos];
            this.positionTokenOnBoard(token, coords);
            
            if (token.element) {
                token.element.style.transform = `scale(1.25) translateY(-5px)`;
                this.playAudio('move');
                this.triggerVibration(20);
            }

            await new Promise(resolve => setTimeout(resolve, 200));
            
            if (token.element) {
                token.element.style.transform = `scale(1) translateY(0)`;
            }
            
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        const finalCoords = this.playerPaths[color][endPos];
        const isSafeCell = this.checkIfSafeCell(finalCoords);

        if (!isSafeCell) {
            const capturedList = this.checkOpponentsToCapture(color, finalCoords);
            if (capturedList.length > 0) {
                this.playAudio('capture');
                this.triggerVibration(250);
                this.showToastNotification('💥 Token Captured!', color);
                this.logFeedMessage(`${this.playerNames[color]} captured opponent token!`);
                
                // Only capture ONE token from each color group (if 2 same-color on cell, only 1 removed)
                const capturedByColor = {};
                capturedList.forEach(cToken => {
                    if (!capturedByColor[cToken.color]) {
                        capturedByColor[cToken.color] = cToken;
                    }
                });

                Object.values(capturedByColor).forEach(cToken => {
                    cToken.position = -1;
                    this.stats[cToken.color].timesCaptured++;
                    this.updateStatsUI(cToken.color);
                    this.moveTokenToHomeSlot(cToken);
                });

                this.stats[color].capturesMade++;
                this.updateStatsUI(color);

                this.addXP(10);
                this.unlockAchievement('first-blood');
                    
                const m = this.dailyMissions.find(x => x.id === 'capture-token');
                if (m && m.current < m.target) {
                    m.current++;
                    this.saveGlobalStatistics();
                }

                this.globalStats.totalCaptures++;
                this.unlockAchievement('capture-master');
                
                this.extraTurnAwarded = true;
            }
        } else {
            if (finalCoords) {
                const isStartCell = Object.values({ red: { r: 7, c: 2 }, green: { r: 2, c: 9 }, yellow: { r: 9, c: 14 }, blue: { r: 14, c: 7 } })
                    .some(sc => sc.r === finalCoords.r && sc.c === finalCoords.c);
                if (isStartCell) {
                    this.showToastNotification('🚀 Safe Start!', color);
                } else {
                    this.showToastNotification('⭐ Safe Cell!', color);
                }
            }
            this.triggerVibration(40);
        }

        if (token.position === 56) {
            token.isFinished = true;
            this.playAudio('finished');
            this.triggerVibration(100);
            this.showToastNotification(`🏆 Token Home!`, color);
            this.logFeedMessage(`${this.playerNames[color]}'s token reached center!`);
            
            // Keep token VISIBLE on the center winning area with a finished glow
            if (token.element) {
                token.element.classList.add('token-finished');
                token.element.style.pointerEvents = 'none';
                token.element.style.cursor = 'default';
            }
        }

        this.updateStatsUI(color);
        this.recalculateBoardClusters();

        this.saveActiveMatch();
        this.isRolling = false;
        
        if (this.checkWinCondition(color)) {
            this.handleVictory(color);
        } else {
            this.processTurnLogic(steps);
        }
    }

    checkWinCondition(color) {
        return this.tokens[color].every(token => token.isFinished);
    }
    checkIfSafeCell(coords) {
        const safeCells = [ { r: 9, c: 3 }, { r: 3, c: 7 }, { r: 7, c: 13 }, { r: 13, c: 9 } ];
        const startCells = [ { r: 7, c: 2 }, { r: 2, c: 9 }, { r: 9, c: 14 }, { r: 14, c: 7 } ];
        const inSafe = safeCells.some(sc => sc.r === coords.r && sc.c === coords.c);
        const inStart = startCells.some(sc => sc.r === coords.r && sc.c === coords.c);
        return inSafe || inStart;
    }

    checkOpponentsToCapture(myColor, coords) {
        const toCapture = [];
        // Starting cells are permanently safe – never capture on them
        const startCells = [
            { r: 7, c: 2 },   // red start
            { r: 2, c: 9 },   // green start
            { r: 9, c: 14 },  // yellow start
            { r: 14, c: 7 }   // blue start
        ];
        const isStartCell = startCells.some(sc => sc.r === coords.r && sc.c === coords.c);
        if (isStartCell) return toCapture;

        this.playersOrder.forEach(color => {
            if (color === myColor || this.inactivePlayers[color]) return;
            this.tokens[color].forEach(token => {
                if (token.position === -1 || token.isFinished) return;
                const tokenCoords = this.playerPaths[color][token.position];
                if (tokenCoords.r === coords.r && tokenCoords.c === coords.c) {
                    toCapture.push(token);
                }
            });
        });
        return toCapture;
    }

    positionTokenOnBoard(token, coords) {
        if (!token.element) return;
        const cellId = `cell-${coords.r}-${coords.c}`;
        const targetCell = document.getElementById(cellId);
        if (targetCell) {
            if (token.element.parentElement !== targetCell) {
                targetCell.appendChild(token.element);
            }
            // Reset inline grid positioning (used by old approach)
            token.element.style.gridRow = '';
            token.element.style.gridColumn = '';
            token.element.style.position = 'absolute';
            token.element.style.top = '50%';
            token.element.style.left = '50%';
            token.element.style.transform = 'translate(-50%,-50%)';
        } else {
            // Fallback: place directly on board grid
            const board = document.getElementById('ludo-board');
            if (board && token.element.parentElement !== board) {
                board.appendChild(token.element);
            }
            token.element.style.gridRow = coords.r;
            token.element.style.gridColumn = coords.c;
        }
    }

    moveTokenToHomeSlot(token) {
        if (!token.element) return;
        const slot = document.querySelector(`.home-area.${token.color}-home-zone .token-slot[data-index="${token.id}"]`);
        if (slot) {
            slot.appendChild(token.element);
            // Reset any board-specific inline styles
            token.element.style.gridRow = '';
            token.element.style.gridColumn = '';
            token.element.style.position = '';
            token.element.style.top = '';
            token.element.style.left = '';
            token.element.style.transform = '';
            token.element.style.display = 'flex';
            token.element.classList.remove('token-finished');
        }
    }

    recalculateBoardClusters() {
        const clusters = {};
        this.playersOrder.forEach(color => {
            if (this.inactivePlayers[color]) return;

            this.tokens[color].forEach(token => {
                if (token.position === -1 || token.isFinished) return;
                const coords = this.playerPaths[color][token.position];
                const key = `${coords.r}_${coords.c}`;
                if (!clusters[key]) clusters[key] = [];
                clusters[key].push(token);
            });
        });

        // Clear previous blockade markers and cluster badges
        document.querySelectorAll('.board-cell.cell-blockade').forEach(el => {
            el.classList.remove('cell-blockade');
        });
        document.querySelectorAll('.cluster-badge').forEach(el => el.remove());

        Object.keys(clusters).forEach(key => {
            const list = clusters[key];
            const len = list.length;
            const [r, c] = key.split('_').map(Number);
            const cellEl = document.getElementById(`cell-${r}-${c}`);

            if (len >= 2) {
                const firstColor = list[0].color;
                const isBlockade = list.every(t => t.color === firstColor);
                if (isBlockade && cellEl) {
                    cellEl.classList.add('cell-blockade');
                }

                // Add cluster count badge to cell
                if (cellEl) {
                    const badge = document.createElement('div');
                    badge.className = 'cluster-badge';
                    badge.textContent = `×${len}`;
                    cellEl.appendChild(badge);
                }
            }

            if (len === 1) {
                const token = list[0];
                if (token.element) {
                    token.element.style.transform = `scale(1) translate(0, 0)`;
                }
            } else if (len === 2) {
                const offsets = [ {x: -5, y: -5}, {x: 5, y: 5} ];
                list.forEach((token, idx) => {
                    if (token.element) {
                        token.element.style.transform = `scale(0.72) translate(${offsets[idx].x}px, ${offsets[idx].y}px)`;
                    }
                });
            } else if (len === 3) {
                const offsets = [ {x: -5, y: -5}, {x: 5, y: -5}, {x: 0, y: 6} ];
                list.forEach((token, idx) => {
                    if (token.element) {
                        token.element.style.transform = `scale(0.65) translate(${offsets[idx].x}px, ${offsets[idx].y}px)`;
                    }
                });
            } else {
                const offsets = [ {x: -6, y: -6}, {x: 6, y: -6}, {x: -6, y: 6}, {x: 6, y: 6} ];
                list.forEach((token, idx) => {
                    const offsetIdx = idx % 4;
                    if (token.element) {
                        token.element.style.transform = `scale(0.55) translate(${offsets[offsetIdx].x}px, ${offsets[offsetIdx].y}px)`;
                    }
                });
            }
        });
    }

    updateStatsUI(color) {
        const statsEl = document.getElementById(`stats-${color}`);
        const extraStatsEl = document.getElementById(`extra-stats-${color}`);

        if (statsEl) {
            const homeCount = this.tokens[color].filter(t => t.position === -1).length;
            const finishedCount = this.tokens[color].filter(t => t.isFinished).length;
            const boardCount = 4 - homeCount - finishedCount;
            statsEl.textContent = `${homeCount} / ${boardCount} / ${finishedCount}`;
        }

        if (extraStatsEl) {
            extraStatsEl.textContent = `${this.stats[color].turnsPlayed} / ${this.stats[color].capturesMade}`;
        }
    }

    playAudio(type) {
        if (this.audioEngine) {
            this.audioEngine.play(type);
        }
    }

    triggerVibration(ms) {
        if (this.settings.vibration && navigator.vibrate) {
            navigator.vibrate(ms);
        }
    }

    showToastNotification(message, type = 'blue') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast-item toast-${type} fade-in`;
        toast.textContent = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    logFeedMessage(msg) {
        const feed = document.getElementById('game-message-feed');
        if (!feed) return;

        const item = document.createElement('p');
        item.className = 'feed-item fade-in';
        item.textContent = msg;
        feed.appendChild(item);

        feed.scrollTop = feed.scrollHeight;

        while (feed.children.length > 15) {
            feed.removeChild(feed.firstChild);
        }
    }

    initBackgroundParticles() {
        const canvas = document.getElementById('bg-particles');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        this.particles = [];
        for (let i = 0; i < 35; i++) {
            this.particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 2 + 1,
                alpha: Math.random() * 0.5 + 0.1
            });
        }

        const animate = () => {
            if (!this.settings.particles) {
                ctx.clearRect(0, 0, width, height);
                requestAnimationFrame(animate);
                return;
            }

            ctx.clearRect(0, 0, width, height);
            
            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                ctx.fill();
            });

            requestAnimationFrame(animate);
        };

        animate();
    }

    checkSavedMatch() {
        const saved = window.LudoUtils.storage.get('ludo_active_match');
        if (saved) {
            setTimeout(() => {
                this.openOverlay('resume-match-overlay');
            }, 1000);
        }
    }

    getCurrentPlayerColor() {
        return this.playersOrder[this.currentPlayerIdx];
    }

    updateActivePlayerUI() {
        const activeColor = this.getCurrentPlayerColor();
        
        this.playersOrder.forEach(color => {
            const panel = document.getElementById(`panel-${color}`);
            if (panel) panel.classList.remove('active');
        });

        const activePanel = document.getElementById(`panel-${activeColor}`);
        if (activePanel) activePanel.classList.add('active');

        const activeNameText = document.getElementById('current-player-turn');
        if (activeNameText) {
            activeNameText.textContent = this.playerNames[activeColor];
        }

        const activeDot = document.getElementById('turn-indicator-dot');
        if (activeDot) {
            activeDot.className = `active-dot dot-${activeColor}`;
        }

        // Disable dice button for other players in online mode
        const btnRoll = document.getElementById('btn-roll-dice');
        if (btnRoll) {
            if (this.gameMode === 'online') {
                if (activeColor === this.myOnlineColor && !this.isBotColor[activeColor]) {
                    btnRoll.disabled = false;
                    btnRoll.textContent = 'Roll Dice';
                    btnRoll.style.opacity = '1';
                    btnRoll.style.cursor = 'pointer';
                } else {
                    btnRoll.disabled = true;
                    btnRoll.textContent = `Waiting for ${this.playerNames[activeColor]}...`;
                    btnRoll.style.opacity = '0.6';
                    btnRoll.style.cursor = 'not-allowed';
                }
            } else {
                btnRoll.disabled = false;
                btnRoll.textContent = 'Roll Dice';
                btnRoll.style.opacity = '1';
                btnRoll.style.cursor = 'pointer';
            }
        }
    }

    updatePlayerStatus(color, status) {
        const panel = document.getElementById(`panel-${color}`);
        if (panel) {
            const statusEl = panel.querySelector('.player-status');
            if (statusEl) {
                statusEl.textContent = status;
            }
        }
    }

    passTurn() {
        this.consecutiveSixes = 0;
        this.extraTurnAwarded = false;
        
        const prevColor = this.getCurrentPlayerColor();
        this.updatePlayerStatus(prevColor, 'Waiting...');

        do {
            this.currentPlayerIdx = (this.currentPlayerIdx + 1) % 4;
        } while (this.inactivePlayers[this.getCurrentPlayerColor()]);

        const activeColor = this.getCurrentPlayerColor();
        this.updateActivePlayerUI();
        this.updatePlayerStatus(activeColor, 'Your Turn');

        this.hasPendingMove = false;
        this.isRolling = false;

        const btnRoll = document.getElementById('btn-roll-dice');
        if (btnRoll) btnRoll.disabled = false;

        if (this.isBotColor[activeColor]) {
            this.playBotTurn();
        }
    }

    processTurnLogic(rollValue) {
        const activeColor = this.getCurrentPlayerColor();
        
        if (rollValue === 6) {
            this.consecutiveSixes++;
            if (this.consecutiveSixes === 3) {
                this.logFeedMessage(`Three consecutive sixes! Turn passed.`);
                this.showToastNotification(`Skips turn (Three 6s)!`, activeColor);
                this.passTurn();
            } else {
                this.logFeedMessage(`${this.playerNames[activeColor]} gets an extra turn!`);
                this.showToastNotification(`Roll again!`, activeColor);
                this.isRolling = false;
                this.hasPendingMove = false;
                const btnRoll = document.getElementById('btn-roll-dice');
                if (btnRoll) btnRoll.disabled = false;
                
                if (this.isBotColor[activeColor]) {
                    this.playBotTurn();
                }
            }
        } else if (this.extraTurnAwarded) {
            this.extraTurnAwarded = false;
            this.logFeedMessage(`${this.playerNames[activeColor]} gets an extra turn for capturing!`);
            this.showToastNotification(`Roll again!`, activeColor);
            this.isRolling = false;
            this.hasPendingMove = false;
            const btnRoll = document.getElementById('btn-roll-dice');
            if (btnRoll) btnRoll.disabled = false;

            if (this.isBotColor[activeColor]) {
                this.playBotTurn();
            }
        } else {
            this.passTurn();
        }
    }

    setupNamesPicker() {
        const container = document.getElementById('names-inputs-container');
        if (!container) return;

        container.innerHTML = '';
        const count = parseInt(document.getElementById('select-player-count').value);
        this.activePlayersCount = count;

        const colors = ['red', 'green', 'yellow', 'blue'];
        this.inactivePlayers = { red: false, green: true, yellow: true, blue: true };

        for (let i = 0; i < 4; i++) {
            const color = colors[i];
            const isActive = i < count;
            if (isActive) {
                this.inactivePlayers[color] = false;
            }

            const row = document.createElement('div');
            row.className = 'setup-group';
            row.style.display = 'flex';
            row.style.flexDirection = 'column';
            row.style.gap = '6px';

            row.innerHTML = `
                <label class="settings-label" style="text-transform: capitalize; color: var(--color-${color});">Player ${i + 1} (${color})</label>
                <div style="display: flex; gap: 10px; width: 100%;">
                    <input type="text" id="input-name-${color}" class="select-premium" style="flex: 1;" value="${this.playerNames[color]}" ${!isActive ? 'disabled' : ''}>
                    <select id="select-type-${color}" class="select-premium" style="width: 100px;" ${!isActive ? 'disabled' : ''}>
                        <option value="human" ${i === 0 ? 'selected' : ''}>Human</option>
                        <option value="bot" ${i > 0 ? 'selected' : ''}>AI Bot</option>
                    </select>
                </div>
            `;
            container.appendChild(row);
        }
    }

    saveCustomPlayerProfiles() {
        const colors = ['red', 'green', 'yellow', 'blue'];
        colors.forEach(color => {
            const nameInput = document.getElementById(`input-name-${color}`);
            const typeSelect = document.getElementById(`select-type-${color}`);
            if (nameInput) {
                this.playerNames[color] = nameInput.value.trim() || `Player (${color})`;
            }
            if (typeSelect) {
                this.isBotColor[color] = typeSelect.value === 'bot';
            }
        });
        this.syncPlayerNamesToPanels();
    }

    exitGame() {
        if (confirm('Are you sure you want to exit HashLudo?')) {
            window.close();
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error enabling fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    initSocketConnection() {
        if (this.socket) return;

        const url = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3000'
            : 'https://hashludo-production.up.railway.app';
            
        this.socket = io(url);

        this.socket.on('room_created', (room) => {
            this.updateLobbyRoomUI(room);
        });

        this.socket.on('room_updated', (room) => {
            this.updateLobbyRoomUI(room);
        });

        this.socket.on('join_error', (errorMsg) => {
            alert('Error: ' + errorMsg);
            if (this.socket) {
                this.socket.disconnect();
                this.socket = null;
            }
        });

        this.socket.on('match_started', (room) => {
            this.closeOverlay('online-lobby-overlay');
            this.showToastNotification('Match Started!', 'green');

            this.gameMode = 'online';
            this.activePlayersCount = room.maxPlayers;
            
            // Find my client color & host role
            const myPlayer = room.players.find(p => p.id === this.socket.id);
            this.myOnlineColor = myPlayer ? myPlayer.color : 'red';
            this.isHostClient = myPlayer ? myPlayer.isHost : false;

            // Reset slots and configurations
            const colors = ['red', 'green', 'yellow', 'blue'];
            colors.forEach(c => {
                this.inactivePlayers[c] = true;
                this.isBotColor[c] = true;
            });

            room.players.forEach(p => {
                this.playerNames[p.color] = p.name;
                this.isBotColor[p.color] = p.isBot;
                this.inactivePlayers[p.color] = false;
            });

            this.syncPlayerNamesToPanels();
            const hostPlayer = room.players.find(p => p.isHost);
            const hostColor = hostPlayer ? hostPlayer.color : 'red';
            this.hostColor = hostColor;
            this.startGame(hostColor);
        });

        this.socket.on('game_dice_rolled', (data) => {
            this.rollActiveDice(data.value);
        });

        this.socket.on('game_token_moved', (data) => {
            const token = this.tokens[data.color][data.tokenIdx];
            if (token) {
                this.animateTokenMove(token, data.steps);
            }
        });

        this.socket.on('game_turn_passed', (data) => {
            this.currentPlayerIdx = data.nextPlayerIdx;
            this.isRolling = false;
            this.hasPendingMove = false;
            
            const btnRoll = document.getElementById('btn-roll-dice');
            if (btnRoll) btnRoll.disabled = false;

            this.updateActivePlayerUI();

            const activeColor = this.getCurrentPlayerColor();
            if (this.isBotColor[activeColor] && this.isHostClient) {
                this.playBotTurn();
            }
        });

        this.socket.on('player_left_game', (data) => {
            this.showToastNotification(`${data.name} left. Bot takeover!`, 'red');
            this.logFeedMessage(`${data.name} (${data.color}) has disconnected. AI Bot took control.`);
            this.isBotColor[data.color] = true;
        });

        // Bind Lobby Color click actions once
        document.querySelectorAll('.color-select-btn').forEach(btn => {
            btn.onclick = () => {
                const color = btn.getAttribute('data-color');
                if (this.socket && !btn.classList.contains('disabled')) {
                    this.playAudio('click');
                    this.socket.emit('select_color', color);
                }
            };
        });
    }

    updateLobbyRoomUI(room) {
        document.getElementById('lobby-create-screen').style.display = 'none';
        document.getElementById('lobby-join-screen').style.display = 'none';
        document.getElementById('lobby-choices').style.display = 'none';
        document.getElementById('lobby-active-room').style.display = 'flex';
        document.getElementById('lobby-username-container').style.display = 'none';

        document.getElementById('label-active-room-code').textContent = room.id;
        document.getElementById('label-joined-ratio').textContent = `${room.players.length} / ${room.maxPlayers}`;

        const listContainer = document.getElementById('lobby-joined-players-list');
        listContainer.innerHTML = '';

        const myPlayer = room.players.find(p => p.id === this.socket.id);
        const myColor = myPlayer ? myPlayer.color : null;
        const isCurrentHost = myPlayer ? myPlayer.isHost : false;

        // Render joined players list
        for (let i = 0; i < room.maxPlayers; i++) {
            const player = room.players[i];
            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.alignItems = 'center';
            item.style.background = 'rgba(255,255,255,0.02)';
            item.style.border = '1px solid rgba(255,255,255,0.04)';
            item.style.padding = '8px 12px';
            item.style.borderRadius = '8px';

            if (player) {
                item.innerHTML = `
                    <span style="font-weight: 700; display:flex; align-items:center; gap:8px;">
                        <span style="width:10px; height:10px; border-radius:50%; background:var(--color-${player.color}); display:inline-block;"></span>
                        ${player.name} ${player.isHost ? '<span style="color:var(--color-yellow); font-size:0.8rem;">(Host)</span>' : ''}
                    </span>
                    <span style="color:var(--color-green); font-size:0.9rem;">Joined</span>
                `;
            } else {
                item.innerHTML = `
                    <span style="color:var(--text-muted); font-style:italic;">Waiting...</span>
                    <span>--</span>
                `;
            }
            listContainer.appendChild(item);
        }

        // Render color selector picker state
        const takenColors = room.players.map(p => p.color);
        document.querySelectorAll('.color-select-btn').forEach(btn => {
            const color = btn.getAttribute('data-color');
            btn.className = 'color-select-btn'; // Reset
            
            if (color === myColor) {
                btn.classList.add('selected');
            } else if (takenColors.includes(color)) {
                btn.classList.add('disabled');
            }
        });

        // Setup Start Match Button
        const startButton = document.getElementById('btn-start-lobby-game');
        if (isCurrentHost) {
            startButton.removeAttribute('disabled');
            if (room.players.length === room.maxPlayers) {
                startButton.textContent = 'Start Game';
                startButton.style.opacity = '1';
                startButton.style.cursor = 'pointer';
            } else {
                startButton.setAttribute('disabled', 'true');
                startButton.textContent = 'Waiting for players...';
                startButton.style.opacity = '0.5';
                startButton.style.cursor = 'not-allowed';
            }
        } else {
            startButton.setAttribute('disabled', 'true');
            startButton.textContent = 'Waiting for Host to start...';
            startButton.style.opacity = '0.5';
            startButton.style.cursor = 'not-allowed';
        }
    }
}

// Instantiate and initialize when DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new LudoGameApp();
    app.init();
    window.LudoApp = app;
});
