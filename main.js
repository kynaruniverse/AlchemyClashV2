/**
 * ALCHEMY CLASH: MAIN BOOTSTRAPPER
 * State machine: Splash → Menu → Workshop / Collection / DeckBuilder → Battle
 */

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(() => console.log('Alchemy Clash: PWA Ready.'))
            .catch(err => console.log('SW Registration Failed:', err));
    });
}

import { Engine3D }         from './src/core/Engine3D.js';
import { CardFactory }      from './src/core/CardFactory.js';
import { InputSystem }      from './src/core/InputSystem.js';
import { DuelManager }      from './src/game/DuelManager.js';
import { VFXManager }       from './src/core/VFXManager.js';
import { Interface }        from './src/ui/Interface.js';
import { AIManager }        from './src/game/AIManager.js';
import { Environment }      from './src/core/Environment.js';
import { AudioManager }     from './src/core/AudioManager.js';
import { DeckBuilder }      from './src/ui/DeckBuilder.js';
import { FusionWorkshop }   from './src/ui/FusionWorkshop.js';
import { CollectionViewer } from './src/ui/CollectionViewer.js';
import { FusionEngine }     from './src/game/FusionEngine.js';

class GameBootstrapper {
    constructor() {
        console.log("ALCHEMY CLASH: Initializing...");

        this.app    = null;
        this.duel   = null;
        this.input  = null;
        this.audio  = new AudioManager();
        this.fusion = new FusionEngine();

        this.uiHub           = document.getElementById('ui-container');
        this.battleContainer = document.getElementById('game-container');

        this.initSplashScreen();
    }

    // ─── STATE 1: SPLASH ──────────────────────────────────────────────────────

    initSplashScreen() {
        this.uiHub.innerHTML = '';
        const splash = document.createElement('div');
        splash.id = 'splash-screen';
        splash.className = 'game-screen';
        splash.innerHTML = `
            <div id="kynar-logo">KYNAR UNIVERSE</div>
            <div id="splash-logo">
                <div id="splash-title">ALCHEMY<br>CLASH</div>
                <div id="splash-subtext">MASTER THE ELEMENTS</div>
            </div>
            <button id="enter-arena-btn" class="alchemy-button">PRESS TO START</button>
        `;
        this.uiHub.appendChild(splash);
        requestAnimationFrame(() => splash.classList.add('active-screen'));

        document.getElementById('enter-arena-btn').onclick = () => {
            this.audio.play('CLICK', 0.5);
            this.transitionState(splash, () => this.initMenuScreen());
        };
    }

    // ─── STATE 2: MAIN MENU ───────────────────────────────────────────────────

    initMenuScreen() {
        const menu = document.createElement('div');
        menu.id = 'menu-screen';
        menu.className = 'game-screen';
        menu.innerHTML = `
            <div id="menu-top">
                <div id="menu-player">
                    <div id="player-avatar">⚗️</div>
                    <div id="player-meta">
                        <div id="player-level">ALCHEMIST</div>
                        <div id="player-name">${this.getPlayerTitle()}</div>
                    </div>
                </div>
                <div id="menu-resources">
                    <div class="resource-pill">🌿 ${this.fusion.getUnlockedElements().length} Elements</div>
                    <div class="resource-pill">🃏 ${this.fusion.getUnlockedCards().length} Cards</div>
                </div>
            </div>

            <div id="menu-center">
                <div id="seasonal-mission-banner">⚗️<br>ALCHEMY LAB</div>
            </div>

            <div id="menu-bottom">
                <div id="menu-nav-grid">
                    <button class="menu-nav-btn" id="nav-workshop">
                        <span class="nav-icon">🔬</span>
                        <span class="nav-label">Workshop</span>
                    </button>
                    <button class="menu-nav-btn" id="nav-collection">
                        <span class="nav-icon">📖</span>
                        <span class="nav-label">Collection</span>
                    </button>
                    <button class="menu-nav-btn" id="nav-deck">
                        <span class="nav-icon">🃏</span>
                        <span class="nav-label">Deck</span>
                    </button>
                </div>

                <div id="play-btn-wrapper">
                    <div id="current-deck-label">READY TO BATTLE?</div>
                    <button id="main-play-btn" class="play-button">BATTLE</button>
                </div>
            </div>
        `;

        this.uiHub.appendChild(menu);
        this.injectMenuStyles();
        requestAnimationFrame(() => menu.classList.add('active-screen'));

        document.getElementById('nav-workshop').onclick = () => {
            this.audio.play('CLICK', 0.4);
            this.transitionState(menu, () => this.initWorkshopState(() => this.initMenuScreen()));
        };

        document.getElementById('nav-collection').onclick = () => {
            this.audio.play('CLICK', 0.4);
            this.transitionState(menu, () => this.initCollectionState(() => this.initMenuScreen()));
        };

        document.getElementById('nav-deck').onclick = () => {
            this.audio.play('CLICK', 0.4);
            this.transitionState(menu, () => this.initDeckBuilderState(null, () => this.initMenuScreen()));
        };

        document.getElementById('main-play-btn').onclick = () => {
            this.audio.play('SNAP', 0.5);
            this.transitionState(menu, () => this.initDeckBuilderState(
                (deck) => this.gotoBattleState(deck),
                () => this.initMenuScreen()
            ));
        };
    }

    getPlayerTitle() {
        const count = this.fusion.getUnlockedElements().length;
        if (count <= 4)  return 'Apprentice';
        if (count <= 8)  return 'Alchemist';
        if (count <= 12) return 'Sage';
        return 'Grand Alchemist';
    }

    // ─── STATE 3: WORKSHOP ────────────────────────────────────────────────────

    initWorkshopState(onBack) {
        const workshop = new FusionWorkshop(this.uiHub, onBack);
        workshop.init();
    }

    // ─── STATE 4: COLLECTION ─────────────────────────────────────────────────

    initCollectionState(onBack) {
        const viewer = new CollectionViewer(this.uiHub, onBack);
        viewer.init();
    }

    // ─── STATE 5: DECK BUILDER ───────────────────────────────────────────────

    initDeckBuilderState(onComplete, onBack) {
        try {
            const builder = new DeckBuilder(this.uiHub);
            builder.onComplete = (selectedDeck) => {
                this.audio.play('SNAP', 0.5);
                if (onComplete) onComplete(selectedDeck);
            };
            builder.onBack = onBack;
            builder.init();
        } catch (e) {
            console.error("DeckBuilder Failed:", e);
        }
    }

    // ─── STATE 6: BATTLE ─────────────────────────────────────────────────────

    gotoBattleState(playerDeck) {
        gsap.to(this.uiHub, { opacity: 0, duration: 0.4, onComplete: () => {
            this.uiHub.innerHTML = '';
            this.init3DSystems(playerDeck);
            this.initBattleHUD();
            this.battleContainer.style.display = 'block';
            gsap.to(this.battleContainer, { opacity: 1, duration: 1.2 });
            gsap.to(this.uiHub, { opacity: 1, duration: 0.6, delay: 0.8 });
        }});
    }

    init3DSystems(playerDeck) {
        try {
            this.app     = new Engine3D();
            this.vfx     = new VFXManager(this.app.scene);
            this.env     = new Environment(this.app.scene, null);
            this.app.setVFX(this.vfx);

            this.duel    = new DuelManager(this.app.scene, this.vfx, this.audio);
            this.factory = new CardFactory(this.app.scene, this.vfx);
            this.ai      = new AIManager(this.duel, this.factory);

            this.ui      = new Interface(this.duel);
            this.duel.ui = this.ui;
            this.duel.ai = this.ai;

            this.input         = new InputSystem(this.app, this.duel);
            this.input.enabled = false;

            this.app.transitionToBattle();

            const cards = this.factory.spawnDeck(playerDeck, 'PLAYER');
            this.duel.playerHand = cards;

            // Register cards with engine motion system
            cards.forEach(card => {
                card.mesh        = card;
                card.x           = card.position.x;
                card.y           = card.position.y;
                card.z           = card.position.z;
                card.targetX     = card.position.x;
                card.targetY     = card.position.y;
                card.targetZ     = 0;
                card.scale       = 1;
                card.targetScale = 1;
                card.rot         = 0;
                card.targetRot   = 0;
                card.state       = 'idle';
                this.app.cards.add(card);
            });

            setTimeout(() => {
                this.input.enabled = true;
                this.ui.announce("ROUND 1");
                this.ui.updateUI();
            }, 300);

        } catch (e) {
            console.error("3D Systems Initialization Failed:", e);
        }
    }

    initBattleHUD() {
        const battleHUD = document.createElement('div');
        battleHUD.id = 'battle-screen';
        battleHUD.className = 'game-screen active-screen';
        battleHUD.innerHTML = `
            <div id="score-container">
                ${[0,1,2].map(i => `
                <div class="lane-ui">
                    <div class="enemy-score" id="enemy-${i}">0</div>
                    <div class="lane-score"  id="score-${i}">0</div>
                </div>`).join('')}
            </div>
            <div id="announcer">MATCH START</div>
            <div id="bottom-bar">
                <div class="mana-container">
                    <div class="mana-hex"><span id="mana-value">1</span></div>
                    <div class="mana-label">ENERGY</div>
                </div>
                <button id="end-turn-btn">END TURN</button>
            </div>
        `;
        this.uiHub.appendChild(battleHUD);

        document.getElementById('end-turn-btn').onclick = () => {
            if (this.duel) this.duel.processTurn();
        };
    }

    // ─── TRANSITIONS ─────────────────────────────────────────────────────────

    transitionState(outgoing, nextStateCallback) {
        gsap.to(outgoing, { opacity: 0, duration: 0.3, onComplete: () => {
            outgoing.remove();
            nextStateCallback();
        }});
    }

    injectMenuStyles() {
        if (document.getElementById('menu-styles')) return;
        const style = document.createElement('style');
        style.id = 'menu-styles';
        style.innerHTML = `
            #menu-nav-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
                width: 100%;
                max-width: 360px;
                margin-bottom: 20px;
            }
            .menu-nav-btn {
                background: var(--panel-parchment-solid);
                border: 1px solid var(--border-parchment);
                border-radius: 12px;
                padding: 16px 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                transition: all 0.2s;
                color: var(--parchment);
                font-family: inherit;
            }
            .menu-nav-btn:active {
                transform: scale(0.96);
                background: rgba(201,168,76,0.1);
                border-color: var(--border-gold);
            }
            .nav-icon  { font-size: 26px; }
            .nav-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--parchment-deep); }
        `;
        document.head.appendChild(style);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.Game = new GameBootstrapper();
});
