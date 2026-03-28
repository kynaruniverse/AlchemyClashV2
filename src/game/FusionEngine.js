/**
 * ALCHEMY CLASH: FUSION ENGINE
 * Handles element combination logic, unlock state, and persistence.
 */

import { ELEMENTS, FUSION_RECIPES, ELEMENT_TO_CARD } from './ElementData.js';
import { CARD_DATABASE } from './CardData.js';

export class FusionEngine {
    constructor() {
        this.elements = this.loadState();
    }

    loadState() {
        try {
            const saved = localStorage.getItem('ac_elements');
            if (saved) {
                const parsed = JSON.parse(saved);
                Object.keys(parsed).forEach(key => {
                    if (ELEMENTS[key]) ELEMENTS[key].unlocked = parsed[key].unlocked;
                });
            }
        } catch (e) {
            console.warn('FusionEngine: Could not load saved state.');
        }

        // Always ensure starter cards are unlocked
        ['FIRE_EMBER','WATER_DROP','EARTH_SHARD','AIR_WISP'].forEach(key => {
            if (CARD_DATABASE[key]) CARD_DATABASE[key].unlocked = true;
        });

        return ELEMENTS;
    }

    saveState() {
        try {
            const toSave = {};
            Object.keys(this.elements).forEach(key => {
                toSave[key] = { unlocked: this.elements[key].unlocked };
            });
            localStorage.setItem('ac_elements', JSON.stringify(toSave));
        } catch (e) {
            console.warn('FusionEngine: Could not save state.');
        }
    }

    /**
     * Attempt to fuse two elements.
     * Returns { success, result, cardUnlocked, alreadyKnown }
     */
    fuse(keyA, keyB) {
        const recipeKey = `${keyA}+${keyB}`;
        const resultKey = FUSION_RECIPES[recipeKey];

        if (!resultKey) {
            return { success: false, result: null, cardUnlocked: null, alreadyKnown: false };
        }

        const alreadyKnown = this.elements[resultKey].unlocked;
        this.elements[resultKey].unlocked = true;

        // Unlock associated card
        let cardUnlocked = null;
        const cardKey = ELEMENT_TO_CARD[resultKey];
        if (cardKey && CARD_DATABASE[cardKey]) {
            CARD_DATABASE[cardKey].unlocked = true;
            cardUnlocked = CARD_DATABASE[cardKey];
        }

        this.saveState();

        return {
            success: true,
            result: this.elements[resultKey],
            resultKey,
            cardUnlocked,
            alreadyKnown
        };
    }

    getUnlockedElements() {
        return Object.entries(this.elements)
            .filter(([, el]) => el.unlocked)
            .map(([key, el]) => ({ key, ...el }));
    }

    getAllElements() {
        return Object.entries(this.elements)
            .map(([key, el]) => ({ key, ...el }));
    }

    getUnlockedCards() {
        return Object.entries(CARD_DATABASE)
            .filter(([, card]) => card.unlocked)
            .map(([key, card]) => ({ key, ...card }));
    }

    isUnlocked(elementKey) {
        return this.elements[elementKey]?.unlocked === true;
    }

    resetProgress() {
        Object.keys(this.elements).forEach(key => {
            if (this.elements[key].tier > 0) this.elements[key].unlocked = false;
        });
        const starterElements = new Set(['FIRE', 'WATER', 'EARTH', 'AIR']);
        Object.keys(CARD_DATABASE).forEach(key => {
            if (!starterElements.has(CARD_DATABASE[key].element)) {
                CARD_DATABASE[key].unlocked = false;
            }
        });
        this.saveState();
    }
}