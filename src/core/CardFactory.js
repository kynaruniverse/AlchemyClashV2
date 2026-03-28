/**
 * ALCHEMY CLASH: CARD FACTORY
 * 3D card mesh creation. Alchemy earth-tone palette.
 */

import * as THREE from 'three';
import { CARD_DATABASE } from '../game/CardData.js';
// gsap is loaded globally via CDN in index.html

export class CardFactory {
    constructor(scene, vfxManager) {
        this.scene        = scene;
        this.vfx          = vfxManager;
        this.loader       = new THREE.TextureLoader();
        this.textureCache = new Map();
    }

    getTexture(url) {
        if (!this.textureCache.has(url)) {
            const tex = this.loader.load(url);
            tex.anisotropy  = 8;
            tex.colorSpace  = THREE.SRGBColorSpace;
            this.textureCache.set(url, tex);
        }
        return this.textureCache.get(url);
    }

    /**
     * Creates a 3D card mesh with alchemy-themed materials
     */
    createCard(cardKey, x, y, owner = 'PLAYER') {
        const data = CARD_DATABASE[cardKey];
        if (!data) {
            console.error(`CardFactory: Card key "${cardKey}" not found.`);
            return null;
        }

        const geometry = new THREE.BoxGeometry(2.2, 3.2, 0.08);

        // Parse hex string color to THREE.Color
        const edgeColor = new THREE.Color(data.color || '#8b5e3c');

        const emissiveMap = {
            'LEGENDARY': 0.4,
            'EPIC':      0.25,
            'RARE':      0.15,
            'COMMON':    0.06
        };
        const emissiveIntensity = emissiveMap[data.rarity] ?? 0.06;

        const sideMat = new THREE.MeshStandardMaterial({
            color:             edgeColor,
            metalness:         0.3,
            roughness:         0.7,
            emissive:          edgeColor,
            emissiveIntensity
        });

        const frontMat = new THREE.MeshStandardMaterial({
            map:       this.getTexture(data.texture),
            metalness: 0.1,
            roughness: 0.8
        });

        // Parchment card back
        const backMat = new THREE.MeshStandardMaterial({
            color:             new THREE.Color(0x2a1f0e),
            emissive:          new THREE.Color(0x8b5e3c),
            emissiveIntensity: 0.08,
            metalness:         0.1,
            roughness:         0.9
        });

        const materials = [sideMat, sideMat, sideMat, sideMat, frontMat, backMat];
        const mesh      = new THREE.Mesh(geometry, materials);
        mesh.position.set(x, y, 0);

        mesh.userData = {
            type:       'CARD',
            data:       { ...data },
            owner,
            isPlayed:   false,
            revealed:   false,
            targetLane: null
        };

        // Rarity VFX (soft alchemy glows)
        if (this.vfx) {
            if (data.rarity === 'LEGENDARY') this.vfx.attachLegendaryTrail(mesh, 0xc9a84c);
            else if (data.rarity === 'EPIC') this.vfx.attachEpicGlow(mesh, 0xa89cc8);
        }

        this.scene.add(mesh);
        return mesh;
    }

    /**
     * Spawns a deck of cards with stagger animation
     */
    spawnDeck(deckList = [], owner = 'PLAYER', onComplete = null) {
        if (!deckList.length) {
            if (onComplete) onComplete([]);
            return [];
        }

        const cards  = [];
        const startX = -4;
        const startY = owner === 'PLAYER' ? -6 : 6;

        deckList.forEach((cardKey, index) => {
            const offsetX = (index % 3) * 0.04;
            const offsetY = (index % 3) * 0.04;
            const card    = this.createCard(cardKey, startX + offsetX, startY + offsetY, owner);
            if (!card) return;

            if (owner === 'ENEMY') card.rotation.y = Math.PI;

            gsap.fromTo(card.position,
                { z: -1 },
                { z: 0, duration: 0.5, delay: index * 0.06, ease: "power2.out" }
            );

            cards.push(card);
        });

        return cards;
    }

    /**
     * Animates a card from hand into a lane
     */
    playCardToLane(card, lane) {
        if (!card || !lane) return;

        const side      = card.userData.owner;
        const cardsInLane = side === 'PLAYER' ? lane.userData.pCards : lane.userData.eCards;
        const targetY   = (side === 'PLAYER' ? -1.2 : 1.2) + cardsInLane * 0.5;

        if (side === 'PLAYER') lane.userData.pCards++;
        else lane.userData.eCards++;

        gsap.to(card.position, {
            x: lane.position.x + (Math.random() - 0.5) * 0.08,
            y: lane.position.y + targetY,
            z: 0.1,
            duration: 0.45,
            ease: "power3.out"
        });

        gsap.to(card.rotation, {
            x: (Math.random() - 0.5) * 0.06,
            y: Math.PI,
            z: (Math.random() - 0.5) * 0.06,
            duration: 0.4
        });

        if (this.vfx) this.vfx.createImpact(card.position, 0xc9a84c);
    }

    removeCard(card) {
        if (!card) return;

        if (Array.isArray(card.material)) {
            card.material.forEach(mat => {
                if (mat.map) mat.map.dispose();
                mat.dispose();
            });
        } else if (card.material) {
            if (card.material.map) card.material.map.dispose();
            card.material.dispose();
        }

        if (card.geometry) card.geometry.dispose();
        this.scene.remove(card);
    }
}
