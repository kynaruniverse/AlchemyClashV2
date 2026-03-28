/**
 * ALCHEMY CLASH: BATTLE HUD INTERFACE
 * Alchemy-themed 2D overlay. Hand layout, energy, lane scores, announcer.
 */

export class Interface {
    constructor(duel) {
        this.duel        = duel;
        this.announcerEl = null;
        this.endTurnBtn  = null;

        this.handY       = -6.5;
        this.handSpacing = 2.0;
        this.maxSpread   = 7;

        this.init();
    }

    init() {
        this.announcerEl = document.getElementById('announcer');
        this.endTurnBtn  = document.getElementById('end-turn-btn');

        if (this.endTurnBtn) {
            this.endTurnBtn.onclick = () => {
                if (!this.duel.isRevealing) {
                    if (this.duel.audio) this.duel.audio.play('CLICK', 0.4);
                    this.duel.processTurn();
                }
            };
        }
    }

    /**
     * Cinematic screen announcement (ROUND 1, VICTORY, etc.)
     */
    announce(text) {
        const el = this.announcerEl;
        if (!el) return;

        el.innerText = text;
        el.style.display = 'block';

        gsap.timeline()
            .fromTo(el,
                { opacity: 0, scale: 0.6, y: -30 },
                { opacity: 1, scale: 1.15, y: 0, duration: 0.5, ease: "back.out(2)" }
            )
            .to(el, { scale: 1, duration: 0.2 })
            .to(el, { opacity: 0, scale: 1.4, duration: 0.4, ease: "power2.in" }, "+=1.4");
    }

    /**
     * Full HUD sync
     */
    updateUI() {
        this.updateEnergy();
        this.updateLaneScores();
        this.updateEndTurnBtn();
        this.layoutHand();
    }

    updateEnergy() {
        const el = document.getElementById('mana-value');
        if (!el) return;

        const current = parseInt(el.innerText);
        if (current !== this.duel.playerMana) {
            el.innerText = this.duel.playerMana;
            this.pulseElement(el.closest('.mana-hex') || el);
        }
    }

    updateLaneScores() {
        this.duel.lanes.forEach((lane, i) => {
            const pEl = document.getElementById(`score-${i}`);
            const eEl = document.getElementById(`enemy-${i}`);
            if (!pEl || !eEl) return;

            const pPow = lane.userData.pPower;
            const ePow = lane.userData.ePower;

            pEl.innerText = pPow;
            eEl.innerText = ePow;

            pEl.classList.toggle('winning', pPow > ePow);
            eEl.classList.toggle('winning', ePow > pPow);
        });
    }

    updateEndTurnBtn() {
        if (!this.endTurnBtn) return;

        if (this.duel.isRevealing) {
            this.endTurnBtn.classList.add('disabled-btn');
            this.endTurnBtn.innerText = 'WAITING...';
        } else {
            this.endTurnBtn.classList.remove('disabled-btn');
            this.endTurnBtn.innerText = 'END TURN';
        }
    }

    /**
     * Snap-style hand fan layout — positions cards in 3D via targetX/Y
     */
    layoutHand() {
        const hand = this.duel.playerHand;
        const n    = hand.length;
        if (!n) return;

        const spread = Math.min(this.maxSpread, (n - 1) * this.handSpacing);
        const startX = -spread / 2;

        hand.forEach((card, i) => {
            const centerOffset = i - (n - 1) / 2;

            card.targetX   = startX + i * this.handSpacing;
            card.targetY   = this.handY + Math.abs(centerOffset) * -0.15;
            card.targetZ   = 0;
            card.targetRot = centerOffset * 1.5; // subtle fan tilt
            card.targetScale = 1;
        });
    }

    pulseElement(el) {
        if (!el) return;
        gsap.fromTo(el,
            { scale: 1.35 },
            { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" }
        );
    }

    /**
     * Card detail popup on long-press / inspect
     */
    showCardDetail(cardData) {
        let overlay = document.getElementById('card-detail-popup');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'card-detail-popup';
            this.injectDetailStyles();
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = `
            <div class="detail-card-view" style="border-top: 6px solid ${cardData.color}">
                <div class="detail-top">
                    <span class="detail-cost">${cardData.cost}</span>
                    <span class="detail-name">${cardData.name}</span>
                    <span class="detail-rarity">${cardData.rarity}</span>
                </div>
                <div class="detail-art" style="background-image: url('${cardData.texture}')"></div>
                <div class="detail-element">${cardData.element}</div>
                <div class="detail-desc">${cardData.desc}</div>
                <div class="detail-stats">POWER: ${cardData.atk}</div>
                <div class="detail-hint">Tap to close</div>
            </div>
        `;

        overlay.style.display = 'flex';
        gsap.fromTo(overlay,
            { opacity: 0 },
            { opacity: 1, duration: 0.25 }
        );

        const close = () => {
            gsap.to(overlay, { opacity: 0, duration: 0.2, onComplete: () => {
                overlay.style.display = 'none';
            }});
        };

        overlay.onclick = close;
        setTimeout(close, 4000);
    }

    injectDetailStyles() {
        if (document.getElementById('detail-styles')) return;
        const style = document.createElement('style');
        style.id = 'detail-styles';
        style.innerHTML = `
            #card-detail-popup {
                position: fixed;
                inset: 0;
                z-index: 5000;
                display: none;
                align-items: center;
                justify-content: center;
                background: rgba(14,10,4,0.85);
                backdrop-filter: blur(6px);
            }
            .detail-card-view {
                background: var(--bg-mid);
                border: 1px solid var(--border-gold);
                border-radius: 14px;
                width: min(320px, 85vw);
                overflow: hidden;
                padding-bottom: 20px;
            }
            .detail-top {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 14px 16px 10px;
            }
            .detail-cost {
                background: var(--earth-brown);
                width: 30px; height: 30px;
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                font-size: 14px; font-weight: 900;
                color: var(--parchment);
                flex-shrink: 0;
            }
            .detail-name {
                font-size: 16px;
                font-weight: 700;
                color: var(--parchment);
                flex: 1;
            }
            .detail-rarity {
                font-size: 10px;
                letter-spacing: 1px;
                color: var(--soft-gold);
                text-transform: uppercase;
            }
            .detail-art {
                width: 100%;
                height: 160px;
                background: var(--bg-light) center/cover no-repeat;
            }
            .detail-element {
                font-size: 10px;
                letter-spacing: 3px;
                color: var(--parchment-deep);
                opacity: 0.6;
                text-align: center;
                margin-top: 14px;
                text-transform: uppercase;
            }
            .detail-desc {
                font-size: 13px;
                color: var(--parchment);
                text-align: center;
                padding: 10px 20px 0;
                font-style: italic;
                line-height: 1.5;
            }
            .detail-stats {
                font-size: 14px;
                font-weight: 900;
                color: var(--soft-red);
                text-align: center;
                margin-top: 10px;
                letter-spacing: 2px;
            }
            .detail-hint {
                font-size: 10px;
                color: var(--parchment-deep);
                opacity: 0.4;
                text-align: center;
                margin-top: 12px;
                letter-spacing: 1px;
            }
        `;
        document.head.appendChild(style);
    }
}
