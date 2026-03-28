/**
 * ALCHEMY CLASH: ELEMENT DATA
 * Basic elements, fusion recipes, and unlock results.
 */

export const ELEMENTS = {
    // --- BASIC ELEMENTS ---
    'FIRE': {
        name: 'Fire',
        symbol: '🔥',
        color: '#c4614a',
        description: 'The primal flame. Hot and consuming.',
        tier: 0,
        unlocked: true
    },
    'WATER': {
        name: 'Water',
        symbol: '💧',
        color: '#7a9bb5',
        description: 'The flow of life. Calm and adaptive.',
        tier: 0,
        unlocked: true
    },
    'EARTH': {
        name: 'Earth',
        symbol: '🪨',
        color: '#8b5e3c',
        description: 'The foundation of all things.',
        tier: 0,
        unlocked: true
    },
    'AIR': {
        name: 'Air',
        symbol: '🌬️',
        color: '#a89cc8',
        description: 'Invisible but ever-present.',
        tier: 0,
        unlocked: true
    },

    // --- TIER 1 FUSIONS ---
    'STEAM': {
        name: 'Steam',
        symbol: '♨️',
        color: '#b5a99a',
        description: 'Fire meets water. Power through pressure.',
        tier: 1,
        unlocked: false
    },
    'LAVA': {
        name: 'Lava',
        symbol: '🌋',
        color: '#c4614a',
        description: 'Earth consumes fire. Unstoppable force.',
        tier: 1,
        unlocked: false
    },
    'MUD': {
        name: 'Mud',
        symbol: '🟫',
        color: '#8b5e3c',
        description: 'Earth and water merge. Dense and binding.',
        tier: 1,
        unlocked: false
    },
    'STORM': {
        name: 'Storm',
        symbol: '⛈️',
        color: '#7a9bb5',
        description: 'Air and water collide. Raw and violent.',
        tier: 1,
        unlocked: false
    },
    'SMOKE': {
        name: 'Smoke',
        symbol: '🌫️',
        color: '#a89cc8',
        description: 'Fire and air intertwine. Obscuring and toxic.',
        tier: 1,
        unlocked: false
    },
    'DUST': {
        name: 'Dust',
        symbol: '🌪️',
        color: '#d4b896',
        description: 'Earth and air scatter. Ancient and drifting.',
        tier: 1,
        unlocked: false
    },

    // --- TIER 2 FUSIONS ---
    'LIGHTNING': {
        name: 'Lightning',
        symbol: '⚡',
        color: '#c9a84c',
        description: 'Storm charged by fire. Instant and lethal.',
        tier: 2,
        unlocked: false
    },
    'OBSIDIAN': {
        name: 'Obsidian',
        symbol: '🖤',
        color: '#3d2416',
        description: 'Lava cooled by water. Sharp as truth.',
        tier: 2,
        unlocked: false
    },
    'VERDURE': {
        name: 'Verdure',
        symbol: '🌿',
        color: '#6b8f6b',
        description: 'Mud and air breathe life. Growth and renewal.',
        tier: 2,
        unlocked: false
    },
    'VOID': {
        name: 'Void',
        symbol: '🌑',
        color: '#2a1f0e',
        description: 'Smoke and dust fade into nothing. The absence of all.',
        tier: 2,
        unlocked: false
    }
};

export const FUSION_RECIPES = {
    'FIRE+WATER':  'STEAM',
    'WATER+FIRE':  'STEAM',
    'FIRE+EARTH':  'LAVA',
    'EARTH+FIRE':  'LAVA',
    'EARTH+WATER': 'MUD',
    'WATER+EARTH': 'MUD',
    'AIR+WATER':   'STORM',
    'WATER+AIR':   'STORM',
    'FIRE+AIR':    'SMOKE',
    'AIR+FIRE':    'SMOKE',
    'EARTH+AIR':   'DUST',
    'AIR+EARTH':   'DUST',
    'STORM+FIRE':  'LIGHTNING',
    'FIRE+STORM':  'LIGHTNING',
    'LAVA+WATER':  'OBSIDIAN',
    'WATER+LAVA':  'OBSIDIAN',
    'MUD+AIR':     'VERDURE',
    'AIR+MUD':     'VERDURE',
    'SMOKE+DUST':  'VOID',
    'DUST+SMOKE':  'VOID'
};

// Which card does unlocking this element grant?
export const ELEMENT_TO_CARD = {
    'STEAM':     'STEAM_WRAITH',
    'LAVA':      'LAVA_TITAN',
    'MUD':       'MUD_GOLEM',
    'STORM':     'STORM_CALLER',
    'SMOKE':     'SMOKE_DANCER',
    'DUST':      'DUST_WANDERER',
    'LIGHTNING': 'LIGHTNING_SAGE',
    'OBSIDIAN':  'OBSIDIAN_KNIGHT',
    'VERDURE':   'VERDURE_SPRITE',
    'VOID':      'VOID_MAGE'
};