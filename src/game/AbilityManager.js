/**
 * ALCHEMY CLASH: ABILITY MANAGER
 * Card ability resolution. Called during reveal phase.
 */

export class AbilityManager {
    constructor(duel, maxLanePower = 99) {
        this.duel          = duel;
        this.maxLanePower  = maxLanePower;
    }

    trigger(card) {
        const ability = card.userData.data.ability;
        if (!ability || ability.type === 'NONE') return;

        console.log(`AbilityManager: [${card.userData.data.name}] → ${ability.type}`);

        const fn = this.abilityMap[ability.type];
        if (fn) fn.call(this, card, ability.value);
        else console.warn(`AbilityManager: Unknown ability "${ability.type}"`);
    }

    get abilityMap() {
        return {
            BOOST_LANE:  this.boostLane,
            BURN_ENEMY:  this.burnEnemy,
            SURGE:       this.surge,
            SPY:         this.spy
        };
    }

    /**
     * Flat power boost to card owner's side of lane
     */
    boostLane(card, value) {
        const lane = card.userData.targetLane;
        if (!lane) return;

        if (card.userData.owner === 'PLAYER') {
            lane.userData.pPower = Math.min(this.maxLanePower, lane.userData.pPower + value);
        } else {
            lane.userData.ePower = Math.min(this.maxLanePower, lane.userData.ePower + value);
        }

        if (this.duel.vfx) this.duel.vfx.createImpact(card.position, 0xc9a84c, 12);
        gsap.to(lane.scale, { x: 1.04, y: 1.04, duration: 0.15, yoyo: true, repeat: 1 });

        this.sync();
    }

    /**
     * Reduces opponent's power in this lane
     */
    burnEnemy(card, value) {
        const lane = card.userData.targetLane;
        if (!lane) return;

        if (card.userData.owner === 'PLAYER') {
            lane.userData.ePower = Math.max(0, lane.userData.ePower - value);
        } else {
            lane.userData.pPower = Math.max(0, lane.userData.pPower - value);
        }

        if (this.duel.vfx) this.duel.vfx.createImpact(lane.position, 0xc4614a, 14);
        this.sync();
    }

    /**
     * Conditional surge — bonus if currently winning the lane
     */
    surge(card, value) {
        const lane = card.userData.targetLane;
        if (!lane) return;

        const isWinning = card.userData.owner === 'PLAYER'
            ? lane.userData.pPower > lane.userData.ePower
            : lane.userData.ePower > lane.userData.pPower;

        if (!isWinning) return;

        if (card.userData.owner === 'PLAYER') {
            lane.userData.pPower = Math.min(this.maxLanePower, lane.userData.pPower + value);
        } else {
            lane.userData.ePower = Math.min(this.maxLanePower, lane.userData.ePower + value);
        }

        if (this.duel.vfx) this.duel.vfx.createImpact(card.position, 0xc9a84c, 16);
        if (this.duel.audio) this.duel.audio.play('SURGE', 0.5);
        this.sync();
    }

    /**
     * Spy — card defects to the enemy side, contributing power there
     */
    spy(card) {
        const lane      = card.userData.targetLane;
        if (!lane) return;

        const power     = card.userData.data.atk;
        const isPlayer  = card.userData.owner === 'PLAYER';

        // Remove from current side
        if (isPlayer) {
            lane.userData.pPower = Math.max(0, lane.userData.pPower - power);
            lane.userData.pCards--;
            card.userData.owner = 'ENEMY';
            lane.userData.eCards++;
        } else {
            lane.userData.ePower = Math.max(0, lane.userData.ePower - power);
            lane.userData.eCards--;
            card.userData.owner = 'PLAYER';
            lane.userData.pCards++;
        }

        // Slide to new side
        const targetY = card.userData.owner === 'ENEMY'
            ? lane.position.y + 1.2 - (lane.userData.eCards * 0.4)
            : lane.position.y - 1.2 + (lane.userData.pCards * 0.4);

        gsap.to(card.position, {
            y:        targetY,
            duration: 1.0,
            ease:     "power2.inOut",
            onComplete: () => {
                if (card.userData.owner === 'PLAYER') lane.userData.pPower += power;
                else lane.userData.ePower += power;

                if (this.duel.vfx) this.duel.vfx.createImpact(card.position, 0xa89cc8, 12);
                this.sync();
            }
        });
    }

    sync() {
        this.duel.updateLaneVisuals();
        if (this.duel.ui) this.duel.ui.updateUI();
    }
}
