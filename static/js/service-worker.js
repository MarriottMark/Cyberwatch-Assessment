const CACHE_NAME = 'cyberwatch-v4';

const FILES_TO_CACHE = [
    '/',
    '/add-incident',
    '/fulllist.html',
    '/offline',
    '/static/css/styles.css',
    '/static/js/script.js',
    '/static/images/logo.png',
    '/static/images/HB.avif',
    '/static/icons/favicon.ico',
    '/static/icons/web-app-manifest-192x192.png',
    '/static/icons/web-app-manifest-512x512.png',
    '/static/manifest.json',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
});


self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        (async () => {
            const isPageRequest =
                event.request.mode === 'navigate' ||
                event.request.destination === 'document' ||
                (event.request.headers.get('accept') || '').includes('text/html');

            if (isPageRequest) {
                try {
                    const response = await fetch(event.request);
                    if (response.ok && event.request.url.startsWith(self.location.origin)) {
                        const cache = await caches.open(CACHE_NAME);
                        cache.put(event.request, response.clone());
                    }
                    return response;
                } catch (error) {
                    const cachedPage =
                        (await caches.match(event.request)) ||
                        (await caches.match('/')) ||
                        (await caches.match('/offline'));

                    if (cachedPage) {
                        return cachedPage;
                    }

                    return new Response(
                        '<!doctype html><html><body><h1>Offline</h1><p>Reconnect to the Flask server to load this page.</p></body></html>',
                        {
                            headers: { 'Content-Type': 'text/html; charset=utf-8' }
                        }
                    );
                }
            }

            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) {
                return cachedResponse;
            }

            try {
                const response = await fetch(event.request);
                if (response.ok && event.request.url.startsWith(self.location.origin)) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(event.request, response.clone());
                }
                return response;
            } catch (error) {
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) {
                    return cachedResponse;
                }

                return new Response('', { status: 504, statusText: 'Offline' });
            }
        })()
    );
});
