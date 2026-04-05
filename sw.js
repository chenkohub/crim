// Criminal Law Study Hub — Service Worker
// Caches all app files for offline use

var CACHE_NAME = 'crimlaw-hub-v1';

// Files to cache on install
var FILES_TO_CACHE = [
  './',
  './index.html',
  './theme.css',
  './shared.js',
  './navbar.js',
  './manifest.json',
  // Tools
  './tools/spaced-repetition.html',
  './tools/flowcharts.html',
  './tools/practice-exams.html',
  './tools/issue-spotter.html',
  './tools/rule-drills.html',
  './tools/why-guides.html',
  './tools/feynman.html',
  './tools/pre-test.html',
  './tools/case-briefs.html',
  './tools/lecture-notes.html',
  // Games
  './games/connections/index.html',
  './games/whos-on-trial/index.html',
  './games/sort-it-out/index.html',
  './games/case-match/index.html',
  './games/crossword/index.html',
  './games/build-the-argument/index.html',
  // Data files
  './data/crim/trial.json',
  './data/crim/connections.json',
  './data/crim/crossword.json',
  './data/crim/arguments.json',
  './data/crim/cases.json',
  './data/crim/sort.json'
];

// Install: cache all app files
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(FILES_TO_CACHE);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate: clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: serve from cache first, fall back to network
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        return response;
      }
      return fetch(event.request).then(function(networkResponse) {
        // Cache successful GET responses for future offline use
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          var responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
    }).catch(function() {
      // If both cache and network fail, show a fallback for navigation requests
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
