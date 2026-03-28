/**
 * ALCHEMY CLASH: DECK BUILDER
 * Alchemy-themed card selection. Only shows unlocked cards.
 */

import { CARD_DATABASE } from '../game/CardData.js';
import { FusionEngine } from '../game/FusionEngine.js';
// gsap is a CDN global — no import needed

export class DeckBuilder {
    constructor(parentContainer, maxDeckSize = 4) {
        this.parent = parentContainer;
        this.selectedCards = [];
        this.onComplete = null;
        this.onBack = null;
        this.maxDeckSize = maxDeckSize;
        this.fusion = new FusionEngine();
    }

    init() {
        this.parent.innerHTML = '';

        const screen = document.createElement('div');
        screen.id = 'deck-builder-screen';
        screen.className = 'game-screen active-screen';
        screen.innerHTML = `
            <div id="builder-header">
                <button id="builder-back-btn" class="alchemy-button back-btn">← Back</button>
                <div id="builder-title">Deck</div>
                <div id="builder-count">
                    <span id="card-count">0/${this.maxDeckSize}</span>
                </div>
            </div>

            <div id="builder-selected-row"></div>

            <div id="card-grid-container">
                <div id="card-grid"></div>
            </div>

            <div id="builder-footer">
                <button id="confirm-deck-btn" class="alchemy-button locked" disabled>
                    Pick ${this.maxDeckSize} Cards
                </button>
            </div>
        `;

        this.injectStyles();
        this.parent.appendChild(screen);

        document.getElementById('builder-back-btn').onclick = () => this.onBack?.();
        document.getElementById('confirm-deck-btn').addEventListener('click', () => {
            if (this.selectedCards.length === this.maxDeckSize && typeof this.onComplete === 'function') {
                this.onComplete(this.selectedCards);
            }
        });

        this.renderGrid();
    }

    renderGrid() {
        const grid = document.getElementById('card-grid');
        grid.innerHTML = '';

        const unlocked = Object.entries(CARD_DATABASE).filter(([, card]) => card.unlocked);

        if (unlocked.length === 0) {
            grid.innerHTML = `<div class="no-cards-msg">No cards yet. Fuse elements to unlock cards.</div>`;
            return;
        }

        unlocked.forEach(([key, card]) => {
            const item = document.createElement('div');
            item.className = 'grid-card';
            item.dataset.key = key;

            item.innerHTML = `
                <div class="card-inner" style="border-bottom: 3px solid ${card.color}">
                    <div class="card-cost">${card.cost}</div>
                    <div class="card-art-thumb" style="background-image: url('${card.texture}')"></div>
                    <div class="card-info">
                        <div class="card-name">${card.name}</div>
                        <div class="card-element">${card.element}</div>
                        <div class="card-atk">PWR: ${card.atk}</div>
                        <div class="card-rarity rarity-${card.rarity.toLowerCase()}">${card.rarity}</div>
                    </div>
                </div>
            `;

            item.addEventListener('click', () => this.toggleCard(key, item));
            grid.appendChild(item);
        });
    }

    toggleCard(key, element) {
        const index = this.selectedCards.indexOf(key);
        const btn = document.getElementById('confirm-deck-btn');
        const countDisplay = document.getElementById('card-count');

        if (index > -1) {
            this.selectedCards.splice(index, 1);
            element.classList.remove('selected');
        } else if (this.selectedCards.length < this.maxDeckSize) {
            this.selectedCards.push(key);
            element.classList.add('selected');
        }

        const count = this.selectedCards.length;
        countDisplay.innerText = `${count}/${this.maxDeckSize}`;
        this.renderSelectedRow();

        if (count === this.maxDeckSize) {
            btn.disabled = false;
            btn.classList.remove('locked');
            btn.innerText = 'Ready to Clash';
        } else {
            btn.disabled = true;
            btn.classList.add('locked');
            btn.innerText = `Pick ${this.maxDeckSize - count} More`;
        }
    }

    renderSelectedRow() {
        const row = document.getElementById('builder-selected-row');
        row.innerHTML = '';

        for (let i = 0; i < this.maxDeckSize; i++) {
            const slot = document.createElement('div');
            slot.className = 'selected-slot';

            if (this.selectedCards[i]) {
                const card = CARD_DATABASE[this.selectedCards[i]];
                slot.style.borderColor = card.color;
                slot.innerHTML = `
                    <div class="selected-slot-symbol">${card.element[0]}</div>
                    <div class="selected-slot-name">${card.name}</div>
                `;
                slot.classList.add('filled');
            } else {
                slot.innerHTML = `<div class="selected-slot-empty">+</div>`;
            }

            row.appendChild(slot);
        }
    }

    injectStyles() {
        if (document.getElementById('deck-builder-styles')) return;
        const style = document.createElement('style');
        style.id = 'deck-builder-styles';
        style.innerHTML = `
            #deck-builder-screen {
                background: linear-gradient(180deg, #0e0a04 0%, #1a1208 100%);
                display: flex;
                flex-direction: column;
            }
            #builder-header {
                padding: 20px 0 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-shrink: 0;
            }
            #builder-title {
                font-size: 22px;
                font-weight: 700;
                letter-spacing: 3px;
                color: var(--soft-gold);
                text-transform: uppercase;
            }
            #builder-count {
                font-size: 13px;
                color: var(--parchment-deep);
                letter-spacing: 1px;
            }
            .back-btn { padding: 8px 16px; font-size: 12px; flex-shrink: 0; }
            #builder-selected-row {
                display: flex;
                gap: 8px;
                padding: 12px 0;
                flex-shrink: 0;
                overflow-x: auto;
            }
            .selected-slot {
                flex-shrink: 0;
                width: 70px;
                height: 70px;
                border-radius: 8px;
                border: 2px dashed var(--border-parchment);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: var(--panel-parchment);
                transition: border-color 0.3s;
            }
            .selected-slot.filled { border-style: solid; }
            .selected-slot-symbol {
                font-size: 20px;
                font-weight: 900;
                color: var(--soft-gold);
            }
            .selected-slot-name {
                font-size: 8px;
                color: var(--parchment-deep);
                text-align: center;
                letter-spacing: 0.5px;
                padding: 0 4px;
                line-height: 1.2;
                margin-top: 2px;
            }
            .selected-slot-empty {
                font-size: 22px;
                color: var(--border-parchment);
                opacity: 0.4;
            }
            #card-grid-container {
                flex: 1;
                overflow-y: auto;
                mask-image: linear-gradient(to bottom, transparent, black 4%, black 96%, transparent);
            }
            #card-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                gap: 14px;
                padding: 10px 0 20px;
            }
            .no-cards-msg {
                text-align: center;
                color: var(--parchment-deep);
                font-size: 13px;
                opacity: 0.6;
                padding: 40px 20px;
                font-style: italic;
                grid-column: 1 / -1;
            }
            .grid-card {
                background: var(--bg-mid);
                border-radius: 10px;
                overflow: hidden;
                cursor: pointer;
                border: 2px solid transparent;
                transition: border-color 0.2s, transform 0.2s;
            }
            .grid-card.selected {
                border-color: var(--soft-gold);
                box-shadow: 0 0 16px rgba(201,168,76,0.3);
            }
            .grid-card:active { transform: scale(0.97); }
            .card-inner { display: flex; flex-direction: column; position: relative; }
            .card-cost {
                position: absolute;
                top: 6px; left: 6px;
                background: var(--earth-brown);
                width: 26px; height: 26px;
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                font-size: 13px; font-weight: 900;
                color: var(--parchment);
                z-index: 2;
            }
            .card-art-thumb {
                height: 110px;
                background: var(--bg-light) center/cover no-repeat;
            }
            .card-info {
                padding: 8px 10px 10px;
                background: rgba(0,0,0,0.6);
            }
            .card-name {
                font-size: 11px;
                font-weight: 700;
                color: var(--parchment);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .card-element {
                font-size: 9px;
                color: var(--parchment-deep);
                opacity: 0.6;
                letter-spacing: 1px;
                text-transform: uppercase;
                margin-top: 2px;
            }
            .card-atk {
                font-size: 13px;
                font-weight: 900;
                color: var(--soft-red);
                margin-top: 2px;
            }
            .card-rarity {
                font-size: 9px;
                letter-spacing: 1px;
                text-transform: uppercase;
                margin-top: 2px;
            }
            .rarity-common { color: var(--parchment-deep); opacity: 0.7; }
            .rarity-rare { color: var(--dusty-blue); }
            .rarity-epic { color: var(--lavender); }
            .rarity-legendary { color: var(--soft-gold); }
            #builder-footer {
                padding: 20px 0 10px;
                display: flex;
                justify-content: center;
                flex-shrink: 0;
            }
            #confirm-deck-btn { padding: 16px 40px; font-size: 15px; letter-spacing: 3px; }
        `;
        document.head.appendChild(style);
    }
}
