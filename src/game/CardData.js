/**
 * ALCHEMY CLASH: MASTER CARD DATABASE
 * Earth-tone alchemy theme. Cards unlocked via element fusion.
 */

export const CARD_DATABASE = {

    // --- STARTER CARDS (always available) ---
    'FIRE_EMBER': {
        name: 'Fire Ember',
        atk: 2,
        cost: 1,
        element: 'FIRE',
        color: '#c4614a',
        rarity: 'COMMON',
        ability: { type: 'NONE' },
        texture: 'assets/images/cards/fire_ember.png',
        desc: 'A humble spark. Small but reliable.',
        unlocked: true
    },
    'WATER_DROP': {
        name: 'Water Drop',
        atk: 2,
        cost: 1,
        element: 'WATER',
        color: '#7a9bb5',
        rarity: 'COMMON',
        ability: { type: 'NONE' },
        texture: 'assets/images/cards/water_drop.png',
        desc: 'Patient and persistent.',
        unlocked: true
    },
    'EARTH_SHARD': {
        name: 'Earth Shard',
        atk: 3,
        cost: 1,
        element: 'EARTH',
        color: '#8b5e3c',
        rarity: 'COMMON',
        ability: { type: 'NONE' },
        texture: 'assets/images/cards/earth_shard.png',
        desc: 'Solid and unyielding.',
        unlocked: true
    },
    'AIR_WISP': {
        name: 'Air Wisp',
        atk: 1,
        cost: 1,
        element: 'AIR',
        color: '#a89cc8',
        rarity: 'COMMON',
        ability: { type: 'BOOST_LANE', value: 2 },
        texture: 'assets/images/cards/air_wisp.png',
        desc: 'ON REVEAL: +2 Power to this lane.',
        unlocked: true
    },

    // --- FUSION UNLOCKED CARDS ---
    'STEAM_WRAITH': {
        name: 'Steam Wraith',
        atk: 3,
        cost: 2,
        element: 'STEAM',
        color: '#b5a99a',
        rarity: 'COMMON',
        ability: { type: 'BOOST_LANE', value: 1 },
        texture: 'assets/images/cards/steam_wraith.png',
        desc: 'ON REVEAL: +1 Power to all allied cards here.',
        unlocked: false
    },
    'LAVA_TITAN': {
        name: 'Lava Titan',
        atk: 6,
        cost: 4,
        element: 'LAVA',
        color: '#c4614a',
        rarity: 'RARE',
        ability: { type: 'BURN_ENEMY', value: 2 },
        texture: 'assets/images/cards/lava_titan.png',
        desc: 'ON REVEAL: -2 Enemy Power in this lane.',
        unlocked: false
    },
    'MUD_GOLEM': {
        name: 'Mud Golem',
        atk: 5,
        cost: 3,
        element: 'MUD',
        color: '#8b5e3c',
        rarity: 'COMMON',
        ability: { type: 'NONE' },
        texture: 'assets/images/cards/mud_golem.png',
        desc: 'Dense and immovable. What it lacks in grace it makes up in mass.',
        unlocked: false
    },
    'STORM_CALLER': {
        name: 'Storm Caller',
        atk: 4,
        cost: 3,
        element: 'STORM',
        color: '#7a9bb5',
        rarity: 'RARE',
        ability: { type: 'SURGE', value: 3 },
        texture: 'assets/images/cards/storm_caller.png',
        desc: 'SURGE: +3 Power if you are already winning this lane.',
        unlocked: false
    },
    'SMOKE_DANCER': {
        name: 'Smoke Dancer',
        atk: 1,
        cost: 2,
        element: 'SMOKE',
        color: '#a89cc8',
        rarity: 'RARE',
        ability: { type: 'SPY' },
        texture: 'assets/images/cards/smoke_dancer.png',
        desc: 'ON REVEAL: Moves to the enemy side of this lane.',
        unlocked: false
    },
    'DUST_WANDERER': {
        name: 'Dust Wanderer',
        atk: 2,
        cost: 1,
        element: 'DUST',
        color: '#d4b896',
        rarity: 'COMMON',
        ability: { type: 'NONE' },
        texture: 'assets/images/cards/dust_wanderer.png',
        desc: 'Drifts between worlds. Forgotten but ever-present.',
        unlocked: false
    },
    'LIGHTNING_SAGE': {
        name: 'Lightning Sage',
        atk: 5,
        cost: 3,
        element: 'LIGHTNING',
        color: '#c9a84c',
        rarity: 'EPIC',
        ability: { type: 'BURN_ENEMY', value: 3 },
        texture: 'assets/images/cards/lightning_sage.png',
        desc: 'ON REVEAL: -3 Enemy Power in this lane.',
        unlocked: false
    },
    'OBSIDIAN_KNIGHT': {
        name: 'Obsidian Knight',
        atk: 7,
        cost: 5,
        element: 'OBSIDIAN',
        color: '#3d2416',
        rarity: 'EPIC',
        ability: { type: 'SURGE', value: 5 },
        texture: 'assets/images/cards/obsidian_knight.png',
        desc: 'SURGE: +5 Power if you are already winning this lane.',
        unlocked: false
    },
    'VERDURE_SPRITE': {
        name: 'Verdure Sprite',
        atk: 3,
        cost: 2,
        element: 'VERDURE',
        color: '#6b8f6b',
        rarity: 'RARE',
        ability: { type: 'BOOST_LANE', value: 3 },
        texture: 'assets/images/cards/verdure_sprite.png',
        desc: 'ON REVEAL: +3 Power to this lane.',
        unlocked: false
    },
    'VOID_MAGE': {
        name: 'Void Mage',
        atk: 0,
        cost: 1,
        element: 'VOID',
        color: '#2a1f0e',
        rarity: 'LEGENDARY',
        ability: { type: 'BOOST_LANE', value: 7 },
        texture: 'assets/images/cards/void_mage.png',
        desc: 'ON REVEAL: +7 Power. The silence before the storm.',
        unlocked: false
    }
};