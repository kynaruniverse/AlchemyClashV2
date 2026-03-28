/**
 * ALCHEMY CLASH: FUSION WORKSHOP UI
 * Drag-and-drop element fusion interface with alchemy theme.
 */

import { FusionEngine } from '../game/FusionEngine.js';

export class FusionWorkshop {
    constructor(parentContainer, onBack) {
        this.parent = parentContainer;
        this.onBack = onBack;
        this.fusion = new FusionEngine();
        this.slotA = null;
        this.slotB = null;
    }

    init() {
        this.parent.innerHTML = '';

        const screen = document.createElement('div');
        screen.id = 'workshop-screen';
        screen.className = 'game-screen active-screen';
        screen.innerHTML = `
            <div id="workshop-header">
                <button id="workshop-back-btn" class="alchemy-button back-btn">← Back</button>
                <div id="workshop-title">Fusion Workshop</div>
            </div>

            <div id="fusion-area">
                <div class="fusion-slot" id="slot-a">
                    <div class="slot-inner" id="slot-a-inner">
                        <span class="slot-placeholder">?</span>
                    </div>
                    <div class="slot-label">Element I</div>
                </div>

                <div id="fusion-plus">+</div>

                <div class="fusion-slot" id="slot-b">
                    <div class="slot-inner" id="slot-b-inner">
                        <span class="slot-placeholder">?</span>
                    </div>
                    <div class="slot-label">Element II</div>
                </div>
            </div>

            <button id="fuse-btn" class="alchemy-button fuse-btn" disabled>FUSE</button>

            <div id="fusion-result-area"></div>

            <div id="workshop-elements-label">Your Elements</div>
            <div id="workshop-elements-grid"></div>
        `;

        this.injectStyles();
        this.parent.appendChild(screen);

        document.getElementById('workshop-back-btn').onclick = () => this.onBack?.();
        document.getElementById('fuse-btn').onclick = () => this.performFusion();

        this.renderElements();
    }

    renderElements() {
        const grid = document.getElementById('workshop-elements-grid');
        grid.innerHTML = '';
        const unlocked = this.fusion.getUnlockedElements();

        unlocked.forEach(el => {
            const tile = document.createElement('div');
            tile.className = 'element-tile';
            tile.innerHTML = `
                <div class="element-symbol">${el.symbol}</div>
                <div class="element-name">${el.name}</div>
            `;
            tile.style.borderColor = el.color;
            tile.onclick = () => this.selectElement(el, tile);
            grid.appendChild(tile);
        });
    }

    selectElement(el, tileEl) {
        // Deselect visual
        document.querySelectorAll('.element-tile').forEach(t => t.classList.remove('slot-a-selected', 'slot-b-selected'));

        if (!this.slotA) {
            this.slotA = el;
            tileEl.classList.add('slot-a-selected');
            this.renderSlot('slot-a-inner', el);
        } else if (!this.slotB && el.key !== this.slotA.key) {
            this.slotB = el;
            tileEl.classList.add('slot-b-selected');
            this.renderSlot('slot-b-inner', el);
        } else {
            // Re-select slot A
            this.slotA = el;
            this.slotB = null;
            tileEl.classList.add('slot-a-selected');
            this.renderSlot('slot-a-inner', el);
            this.renderSlot('slot-b-inner', null);
        }

        const fuseBtn = document.getElementById('fuse-btn');
        fuseBtn.disabled = !(this.slotA && this.slotB);
    }

    renderSlot(slotId, el) {
        const inner = document.getElementById(slotId);
        if (!el) {
            inner.innerHTML = `<span class="slot-placeholder">?</span>`;
            return;
        }
        inner.innerHTML = `
            <div class="slot-element-symbol">${el.symbol}</div>
            <div class="slot-element-name">${el.name}</div>
        `;
        inner.style.borderColor = el.color;
    }

    performFusion() {
        if (!this.slotA || !this.slotB) return;

        const result = this.fusion.fuse(this.slotA.key, this.slotB.key);
        const area = document.getElementById('fusion-result-area');

        if (!result.success) {
            area.innerHTML = `<div class="fusion-result failure">No reaction. Try a different combination.</div>`;
            this.resetSlots();
            return;
        }

        const el = result.result;
        const isNew = !result.alreadyKnown;

        area.innerHTML = `
            <div class="fusion-result success" style="border-color: ${el.color}">
                <div class="result-symbol">${el.symbol}</div>
                <div class="result-name">${el.name}</div>
                <div class="result-desc">${el.description}</div>
                ${isNew ? `<div class="result-new">✨ New Element Discovered!</div>` : `<div class="result-known">Already known.</div>`}
                ${result.cardUnlocked && isNew ? `<div class="result-card-unlock">🃏 Card Unlocked: ${result.cardUnlocked.name}</div>` : ''}
            </div>
        `;

        this.resetSlots();
        this.renderElements();
    }

    resetSlots() {
        this.slotA = null;
        this.slotB = null;
        this.renderSlot('slot-a-inner', null);
        this.renderSlot('slot-b-inner', null);
        document.getElementById('fuse-btn').disabled = true;
        document.querySelectorAll('.element-tile').forEach(t => t.classList.remove('slot-a-selected', 'slot-b-selected'));
    }

    injectStyles() {
        if (document.getElementById('workshop-styles')) return;
        const style = document.createElement('style');
        style.id = 'workshop-styles';
        style.innerHTML = `
            #workshop-screen {
                background: linear-gradient(180deg, #0e0a04 0%, #1a1208 60%, #0e0a04 100%);
                overflow-y: auto;
            }
            #workshop-header {
                display: flex;
                align-items: center;
                gap: 20px;
                padding: 20px 0 10px;
            }
            #workshop-title {
                font-size: 22px;
                font-weight: 700;
                color: var(--soft-gold);
                letter-spacing: 3px;
                text-transform: uppercase;
            }
            .back-btn {
                padding: 8px 16px;
                font-size: 12px;
                flex-shrink: 0;
            }
            #fusion-area {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 20px;
                padding: 30px 0 20px;
            }
            .fusion-slot {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
            }
            .slot-inner {
                width: 110px;
                height: 110px;
                border-radius: 50%;
                border: 2px dashed var(--border-gold);
                background: var(--panel-parchment);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                transition: border-color 0.3s, background 0.3s;
            }
            .slot-placeholder { font-size: 36px; opacity: 0.3; }
            .slot-element-symbol { font-size: 34px; }
            .slot-element-name { font-size: 10px; letter-spacing: 1px; color: var(--parchment-deep); margin-top: 4px; }
            .slot-label { font-size: 10px; letter-spacing: 2px; color: var(--parchment-deep); opacity: 0.6; }
            #fusion-plus {
                font-size: 32px;
                color: var(--soft-gold);
                opacity: 0.6;
                margin-bottom: 20px;
            }
            .fuse-btn {
                display: block;
                margin: 0 auto 20px;
                padding: 14px 40px;
                font-size: 16px;
                letter-spacing: 4px;
            }
            #fusion-result-area { min-height: 120px; padding: 0 10px; }
            .fusion-result {
                border: 2px solid var(--border-gold);
                border-radius: 12px;
                padding: 20px;
                text-align: center;
                background: var(--panel-parchment);
                animation: resultAppear 0.4s ease;
            }
            .fusion-result.failure { border-color: var(--soft-red); color: var(--soft-red); font-size: 13px; padding: 16px; }
            .result-symbol { font-size: 42px; margin-bottom: 6px; }
            .result-name { font-size: 18px; font-weight: 700; color: var(--soft-gold); letter-spacing: 2px; }
            .result-desc { font-size: 12px; color: var(--parchment-deep); margin-top: 8px; font-style: italic; }
            .result-new { margin-top: 12px; color: var(--soft-gold); font-size: 13px; letter-spacing: 1px; }
            .result-known { margin-top: 12px; color: var(--parchment-deep); font-size: 12px; opacity: 0.6; }
            .result-card-unlock { margin-top: 8px; color: var(--muted-green); font-size: 13px; letter-spacing: 1px; }
            #workshop-elements-label {
                font-size: 11px;
                letter-spacing: 3px;
                color: var(--parchment-deep);
                opacity: 0.6;
                text-align: center;
                margin: 20px 0 12px;
                text-transform: uppercase;
            }
            #workshop-elements-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
                gap: 12px;
                padding-bottom: 40px;
            }
            .element-tile {
                background: var(--panel-parchment);
                border: 2px solid var(--border-parchment);
                border-radius: 10px;
                padding: 12px 6px;
                text-align: center;
                cursor: pointer;
                transition: transform 0.2s, border-color 0.2s;
            }
            .element-tile:active { transform: scale(0.95); }
            .element-tile.slot-a-selected { border-color: var(--soft-gold); background: rgba(201,168,76,0.12); }
            .element-tile.slot-b-selected { border-color: var(--dusty-blue); background: rgba(122,155,181,0.12); }
            .element-symbol { font-size: 26px; }
            .element-name { font-size: 9px; letter-spacing: 1px; color: var(--parchment-deep); margin-top: 4px; text-transform: uppercase; }
            @keyframes resultAppear {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
}
