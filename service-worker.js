/**
 * ALCHEMY CLASH: SERVICE WORKER (PWA)
 * Cache-first strategy for offline play.
 */

const CACHE_NAME = 'alchemy-clash-v2';

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './main.js',
    './manifest.json',
    './src/core/Engine3D.js',
    './src/core/CardFactory.js',
    './src/core/AudioManager.js',
    './src/core/VFXManager.js',
    './src/core/Environment.js',
    './src/core/InputSystem.js',
    './src/game/CardData.js',
    './src/game/ElementData.js',
    './src/game/FusionEngine.js',
    './src/game/DuelManager.js',
    './src/game/AIManager.js',
    './src/game/AbilityManager.js',
    './src/ui/Interface.js',
    './src/ui/DeckBuilder.js',
    './src/ui/FusionWorkshop.js',
    './src/ui/CollectionViewer.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('SW: Caching assets...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key);
            }))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(fetchResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    if (event.request.url.startsWith('http')) {
                        cache.put(event.request, fetchResponse.clone());
                    }
                    return fetchResponse;
                });
            });
        }).catch(() => {
            console.warn('SW: Asset unavailable offline.');
        })
    );
});
