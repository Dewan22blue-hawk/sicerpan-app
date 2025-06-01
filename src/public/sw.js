const CACHE_NAME = 'dicoding-story-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.js',
  '/src/App.js',
  '/src/config.js',
  '/src/styles/global.css',
  '/src/styles/components.css',
  '/src/api/story-api.js',
  '/src/components/StoryCard.js',
  '/src/components/Header.js',
  '/src/components/Footer.js',
  '/src/components/Spinner.js',
  '/src/pages/auth/Login.js',
  '/src/pages/auth/Register.js',
  '/src/pages/stories/Stories.js',
  '/src/pages/stories/AddStory.js',
  '/src/pages/stories/DetailStory.js',
  '/src/pages/NotFound.js',
  '/src/presenters/AuthPresenter.js',
  '/src/presenters/StoriesPresenter.js',
  '/src/presenters/AddStoryPresenter.js',
  '/src/utils/Router.js',
  '/src/utils/AuthHelper.js',
  '/src/utils/NotificationHelper.js',
  '/src/utils/CameraHelper.js',
  '/src/utils/validation.js',
  // External libraries (consider caching strategies for these based on your needs)
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
  // You might also want to cache specific font files or map tiles if they are static
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('ServiceWorker: deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      )
    )
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const title = data.title || 'Story App Notification';
  const options = {
    body: data.options.body || 'You have a new update!',
    icon: '/favicon.ico', // Ensure you have a favicon
    badge: '/favicon.ico',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/#/stories') // Redirect to stories page on notification click
  );
});
