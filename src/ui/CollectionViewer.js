/**
 * ALCHEMY CLASH: COLLECTION VIEWER
 * Displays all discovered elements and unlocked cards.
 */

import { FusionEngine } from '../game/FusionEngine.js';
import { CARD_DATABASE } from '../game/CardData.js';

export class CollectionViewer {
    constructor(parentContainer, onBack) {
        this.parent = parentContainer;
        this.onBack = onBack;
        this.fusion = new FusionEngine();
        this.cardDB = CARD_DATABASE;
        this.activeTab = 'elements';
    }

    init() {
        this.parent.innerHTML = '';

        const screen = document.createElement('div');
        screen.id = 'collection-screen';
        screen.className = 'game-screen active-screen';
        screen.innerHTML = `
            <div id="collection-header">
                <button id="collection-back-btn" class="alchemy-button back-btn">← Back</button>
                <div id="collection-title">Collection</div>
            </div>
            <div id="collection-tabs">
                <button class="tab-btn active-tab" data-tab="elements">Elements</button>
                <button class="tab-btn" data-tab="cards">Cards</button>
            </div>
            <div id="collection-content"></div>
        `;

        this.injectStyles();
        this.parent.appendChild(screen);

        document.getElementById('collection-back-btn').onclick = () => this.onBack?.();

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active-tab'));
                btn.classList.add('active-tab');
                this.activeTab = btn.dataset.tab;
                this.renderContent();
            };
        });

        this.renderContent();
    }

    renderContent() {
        const content = document.getElementById('collection-content');
        content.innerHTML = '';

        if (this.activeTab === 'elements') {
            this.renderElements(content);
        } else {
            this.renderCards(content);
        }
    }

    renderElements(container) {
        const all = this.fusion.getAllElements();
        const grid = document.createElement('div');
        grid.className = 'collection-grid';

        all.forEach(el => {
            const tile = document.createElement('div');
            tile.className = `collection-element-tile ${el.unlocked ? 'unlocked' : 'locked'}`;
            tile.style.borderColor = el.unlocked ? el.color : 'transparent';
            tile.innerHTML = `
                <div class="col-symbol">${el.unlocked ? el.symbol : '?'}</div>
                <div class="col-name">${el.unlocked ? el.name : '???'}</div>
                <div class="col-tier">Tier ${el.tier}</div>
                ${el.unlocked ? `<div class="col-desc">${el.description}</div>` : ''}
            `;
            grid.appendChild(tile);
        });

        container.appendChild(grid);
    }

    renderCards(container) {
        const grid = document.createElement('div');
        grid.className = 'collection-grid';

        Object.entries(this.cardDB).forEach(([key, card]) => {
            const tile = document.createElement('div');
            tile.className = `collection-card-tile ${card.unlocked ? 'unlocked' : 'locked'}`;
            tile.style.borderColor = card.unlocked ? card.color : 'transparent';
            tile.innerHTML = `
                <div class="col-card-cost">${card.unlocked ? card.cost : '?'}</div>
                <div class="col-card-art" style="${card.unlocked ? `background-image:url('${card.texture}')` : ''}"></div>
                <div class="col-card-info">
                    <div class="col-name">${card.unlocked ? card.name : '???'}</div>
                    <div class="col-card-element">${card.unlocked ? card.element : ''}</div>
                    <div class="col-card-rarity rarity-${card.rarity?.toLowerCase()}">${card.unlocked ? card.rarity : ''}</div>
                </div>
            `;
            grid.appendChild(tile);
        });

        container.appendChild(grid);
    }

    injectStyles() {
        if (document.getElementById('collection-styles')) return;
        const style = document.createElement('style');
        style.id = 'collection-styles';
        style.innerHTML = `
            #collection-screen {
                background: linear-gradient(180deg, #0e0a04 0%, #1a1208 100%);
                overflow-y: auto;
            }
            #collection-header {
                display: flex;
                align-items: center;
                gap: 20px;
                padding: 20px 0 10px;
                flex-shrink: 0;
            }
            #collection-title {
                font-size: 22px;
                font-weight: 700;
                color: var(--soft-gold);
                letter-spacing: 3px;
                text-transform: uppercase;
            }
            .back-btn { padding: 8px 16px; font-size: 12px; flex-shrink: 0; }
            #collection-tabs {
                display: flex;
                gap: 4px;
                margin-bottom: 20px;
                flex-shrink: 0;
            }
            .tab-btn {
                flex: 1;
                padding: 10px;
                background: var(--panel-parchment);
                border: 1px solid var(--border-parchment);
                border-radius: 6px;
                color: var(--parchment-deep);
                font-family: inherit;
                font-size: 12px;
                letter-spacing: 2px;
                text-transform: uppercase;
                cursor: pointer;
                transition: all 0.2s;
            }
            .tab-btn.active-tab {
                background: rgba(201,168,76,0.15);
                border-color: var(--border-gold);
                color: var(--soft-gold);
            }
            #collection-content { flex: 1; overflow-y: auto; }
            .collection-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                gap: 12px;
                padding-bottom: 40px;
            }
            .collection-element-tile,
            .collection-card-tile {
                background: var(--panel-parchment);
                border: 2px solid var(--border-parchment);
                border-radius: 10px;
                padding: 12px 8px;
                text-align: center;
                transition: transform 0.2s;
            }
            .collection-element-tile.unlocked,
            .collection-card-tile.unlocked { cursor: default; }
            .collection-element-tile.locked,
            .collection-card-tile.locked { opacity: 0.35; }
            .col-symbol { font-size: 28px; margin-bottom: 6px; }
            .col-name { font-size: 10px; letter-spacing: 1px; color: var(--parchment); font-weight: 700; text-transform: uppercase; }
            .col-tier { font-size: 9px; color: var(--parchment-deep); opacity: 0.5; margin-top: 4px; }
            .col-desc { font-size: 9px; color: var(--parchment-deep); margin-top: 6px; font-style: italic; line-height: 1.3; }
            .col-card-cost {
                position: absolute;
                top: 6px; left: 6px;
                background: var(--earth-brown);
                width: 22px; height: 22px;
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                font-size: 11px; font-weight: 900;
            }
            .collection-card-tile { position: relative; padding: 0; overflow: hidden; }
            .col-card-art {
                height: 80px;
                background: var(--bg-mid) center/cover no-repeat;
            }
            .col-card-info { padding: 8px 6px; }
            .col-card-element { font-size: 8px; color: var(--parchment-deep); letter-spacing: 1px; opacity: 0.6; text-transform: uppercase; }
            .col-card-rarity { font-size: 8px; margin-top: 2px; letter-spacing: 1px; text-transform: uppercase; }
            .rarity-common { color: var(--parchment-deep); }
            .rarity-rare { color: var(--dusty-blue); }
            .rarity-epic { color: var(--lavender); }
            .rarity-legendary { color: var(--soft-gold); }
        `;
        document.head.appendChild(style);
    }
}
