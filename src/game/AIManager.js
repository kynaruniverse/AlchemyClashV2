/**
 * ALCHEMY CLASH: AI MANAGER
 * Tactical opponent using unlocked card pool.
 */

import { CARD_DATABASE } from './CardData.js';

export class AIManager {
    constructor(duel, factory) {
        this.duel      = duel;
        this.factory   = factory;
        this.isThinking = false;

        // Build AI deck from unlocked cards (or fallback to starters)
        this.deck = this.buildAIDeck();
        this.hand = [];
        this.initialDraw();
    }

    buildAIDeck() {
        const all = Object.keys(CARD_DATABASE).filter(k => CARD_DATABASE[k].unlocked);
        // Ensure at least starter cards
        const starters = ['FIRE_EMBER', 'WATER_DROP', 'EARTH_SHARD', 'AIR_WISP'];
        const pool     = all.length >= 6 ? all : starters;

        // Build a 9-card deck by cycling the pool
        const deck = [];
        for (let i = 0; i < 9; i++) {
            deck.push(pool[i % pool.length]);
        }
        return deck;
    }

    initialDraw() {
        for (let i = 0; i < 3; i++) this.drawCard();
    }

    drawCard() {
        if (!this.deck.length) return;
        const idx  = Math.floor(Math.random() * this.deck.length);
        const card = this.deck.splice(idx, 1)[0];
        this.hand.push(card);
    }

    async playTurn() {
        if (this.isThinking) return [];
        this.isThinking = true;

        this.drawCard();

        // Thinking delay — feels alive
        await new Promise(resolve => setTimeout(resolve, 900 + Math.random() * 800));

        let energy      = this.duel.currentTurn;
        const played    = [];
        let possible    = this.hand.filter(k => CARD_DATABASE[k]?.cost <= energy);

        while (possible.length > 0) {
            possible.sort((a, b) => CARD_DATABASE[b].cost - CARD_DATABASE[a].cost);
            const cardKey  = possible[0];
            const lane     = this.calculateBestLane(cardKey);
            if (!lane) break;

            const entity = this.deployCard(cardKey, lane);
            played.push(entity);

            energy -= CARD_DATABASE[cardKey].cost;
            this.hand.splice(this.hand.indexOf(cardKey), 1);
            possible = this.hand.filter(k => CARD_DATABASE[k]?.cost <= energy);
        }

        this.isThinking = false;
        return played;
    }

    calculateBestLane(cardKey) {
        const data  = CARD_DATABASE[cardKey];
        const lanes = this.duel.lanes;

        const scores = lanes.map(lane => {
            let score = 0;
            const diff = lane.userData.pPower - lane.userData.ePower;

            if (diff > 0 && diff <= 4)                        score += 10; // contest close lanes
            if (diff < -5)                                    score -= 5;  // avoid over-committing
            if (data.ability?.type === 'BOOST_LANE' && diff < 0) score += 3;
            if (data.ability?.type === 'BURN_ENEMY' && diff > 0) score += 4;
            if (lane.userData.eCards >= 4)                    score = -100;

            return { lane, score };
        });

        scores.sort((a, b) => b.score - a.score);
        return scores[0]?.lane || null;
    }

    deployCard(cardKey, targetLane) {
        const spawnX = targetLane.position.x + (Math.random() - 0.5) * 0.5;
        const card   = this.factory.createCard(cardKey, spawnX, 10, 'ENEMY');

        card.rotation.y           = Math.PI; // face-down fog of war
        card.userData.targetLane  = targetLane;

        const yOffset = 1.2 - (targetLane.userData.eCards * 0.45);
        targetLane.userData.eCards++;

        gsap.to(card.position, {
            x: targetLane.position.x,
            y: targetLane.position.y + yOffset,
            z: 0.1,
            duration: 0.65,
            ease: "power3.out"
        });

        gsap.to(card.rotation, {
            z: (Math.random() - 0.5) * 0.08,
            duration: 0.5,
            delay: 0.2
        });

        return card;
    }
}
