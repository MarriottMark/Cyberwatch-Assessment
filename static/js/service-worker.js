const CACHE_NAME = 'cyberwatch-v1';

const FILES_TO_CACHE = [
    '/',
    '/incidents',
    '/add-incident',
    '/fulllist.html',
    '/static/css/styles.css',
    '/static/js/script.js',
    '/static/images/logo.png',
    '/static/images/HB.avif',
    '/static/icons/favicon.ico',
    '/static/manifest.json',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching resources...');
            return Promise.all(
                FILES_TO_CACHE.map(url => {
                    return cache.add(url).catch(err => {
                        console.warn('Failed to cache:', url, err);
                    });
                })
            );
        })
    );
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
});

self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
