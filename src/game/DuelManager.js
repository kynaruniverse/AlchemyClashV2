/**
 * ALCHEMY CLASH: DUEL MANAGER
 * Turn engine, lane management, reveal sequence.
 * Input is handled exclusively by InputSystem — no duplicate pointer events here.
 */

import * as THREE from 'three';
import { AbilityManager } from './AbilityManager.js';


export class DuelManager {
    constructor(scene, vfx, audio) {
        this.scene  = scene;
        this.vfx    = vfx;
        this.audio  = audio;

        this.lanes          = [];
        this.playerMana     = 1;
        this.maxTurn        = 6;
        this.currentTurn    = 1;
        this.isRevealing    = false;

        this.ui             = null;
        this.ai             = null;
        this.playerHand     = [];
        this.playedThisTurn = [];

        this.createLanes();
        this.abilities = new AbilityManager(this);
    }

    createLanes() {
        const laneGeo     = new THREE.PlaneGeometry(3.2, 5.0);
        const laneSpacing = 4.0;

        for (let i = 0; i < 3; i++) {
            const laneMat = new THREE.MeshStandardMaterial({
                color:            0x3d2416,
                transparent:      true,
                opacity:          0.25,
                side:             THREE.DoubleSide,
                emissive:         new THREE.Color(0x000000),
                emissiveIntensity: 1.0
            });

            const lane = new THREE.Mesh(laneGeo, laneMat);
            lane.position.set(-laneSpacing + i * laneSpacing, 0, -0.05);

            lane.userData = {
                type:        'LANE',
                index:       i,
                pPower:      0,
                ePower:      0,
                pCards:      0,
                eCards:      0,
                cardsInLane: []
            };

            this.scene.add(lane);
            this.lanes.push(lane);

            // Parchment-toned lane border
            const edges = new THREE.EdgesGeometry(laneGeo);
            const line  = new THREE.LineSegments(
                edges,
                new THREE.LineBasicMaterial({ color: 0x8b5e3c, transparent: true, opacity: 0.4 })
            );
            line.position.copy(lane.position);
            this.scene.add(line);
            lane.userData.border = line;
        }
    }

    tryPlayCard(card) {
        if (this.isRevealing) return false;

        const cost = card.userData.data.cost || 1;
        if (this.playerMana < cost) {
            if (this.ui) this.ui.announce("NOT ENOUGH ENERGY");
            return false;
        }

        // Find closest valid lane
        let bestLane = null;
        let minDist  = 2.5;

        this.lanes.forEach(lane => {
            const dist = card.position.distanceTo(lane.position);
            if (dist < minDist && lane.userData.pCards < 4) {
                minDist  = dist;
                bestLane = lane;
            }
        });

        if (!bestLane) return false;

        this.playerMana          -= cost;
        card.userData.isPlayed    = true;
        card.userData.targetLane  = bestLane;
        this.playedThisTurn.push(card);

        // Remove from hand so layout updates correctly
        const idx = this.playerHand.indexOf(card);
        if (idx > -1) this.playerHand.splice(idx, 1);

        const yPos = -1.2 + bestLane.userData.pCards * 0.5;
        bestLane.userData.pCards++;

        gsap.to(card.position, {
            x:        bestLane.position.x,
            y:        bestLane.position.y + yPos,
            z:        0.1,
            duration: 0.35,
            ease:     "back.out(1.2)"
        });

        gsap.to(card.rotation, { y: Math.PI, duration: 0.4 });

        if (this.vfx)   this.vfx.createImpact(bestLane.position, 0xc9a84c, 8);
        if (this.audio) this.audio.play('SNAP', 0.5);
        if (this.ui)    this.ui.updateUI();

        return true;
    }

    async processTurn() {
        if (this.isRevealing) return;
        this.isRevealing = true;

        if (this.ui) this.ui.announce("OPPONENT'S MOVE...");

        const enemyMoves = await this.ai.playTurn();
        if (enemyMoves?.length) enemyMoves.forEach(c => this.playedThisTurn.push(c));

        // Reveal lowest cost first
        this.playedThisTurn.sort((a, b) => a.userData.data.cost - b.userData.data.cost);

        for (const card of this.playedThisTurn) {
            await this.revealCard(card);
        }

        this.playedThisTurn = [];
        this.currentTurn++;

        if (this.currentTurn > this.maxTurn) {
            this.endGame();
        } else {
            this.playerMana  = this.currentTurn;
            this.isRevealing = false;
            if (this.ui) {
                this.ui.updateUI();
                this.ui.announce(`ROUND ${this.currentTurn}`);
            }
        }
    }

    async revealCard(card) {
        return new Promise(resolve => {
            gsap.to(card.rotation, {
                y:        0,
                duration: 0.55,
                ease:     "back.out(1.4)",
                onComplete: () => {
                    const lane  = card.userData.targetLane;
                    const power = card.userData.data.atk;

                    if (lane) {
                        if (card.userData.owner === 'ENEMY') lane.userData.ePower += power;
                        else lane.userData.pPower += power;
                    }

                    if (this.vfx)   this.vfx.createImpact(card.position, 0xc9a84c, 10);
                    if (this.audio) this.audio.play('REVEAL', 0.4);

                    this.updateLaneVisuals();
                    if (this.ui) this.ui.updateUI();

                    this.abilities.trigger(card);
                    card.userData.revealed = true;
                    setTimeout(resolve, 550);
                }
            });
        });
    }

    updateLaneVisuals() {
        this.lanes.forEach(lane => {
            const p = lane.userData.pPower;
            const e = lane.userData.ePower;

            // Gold = player winning, soft red = enemy winning, neutral = tied
            let r = 0.24, g = 0.18, b = 0.09; // neutral earth

            if (p > e) { r = 0.79; g = 0.66; b = 0.30; } // soft gold
            if (e > p) { r = 0.77; g = 0.38; b = 0.29; } // soft red

            gsap.to(lane.material.emissive, { r, g, b, duration: 0.5 });

            if (lane.userData.border) {
                const col = p > e ? 0xc9a84c : (e > p ? 0xc4614a : 0x8b5e3c);
                lane.userData.border.material.color.set(col);
            }
        });
    }

    endGame() {
        let pWins = 0, eWins = 0;
        this.lanes.forEach(l => {
            if (l.userData.pPower > l.userData.ePower)      pWins++;
            else if (l.userData.ePower > l.userData.pPower) eWins++;
        });

        const msg = pWins > eWins ? "VICTORY" : (pWins === eWins ? "DRAW" : "DEFEAT");
        if (this.ui) this.ui.announce(msg);

        this.lanes.forEach(l => {
            const col = l.userData.pPower > l.userData.ePower ? 0xc9a84c : 0xc4614a;
            if (this.vfx) this.vfx.createExplosion(l.position, col);
        });
    }
}
