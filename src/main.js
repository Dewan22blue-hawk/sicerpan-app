import './styles/global.css';
import './styles/components.css';
import App from './App';
import AuthHelper from './utils/AuthHelper';
import NotificationHelper from './utils/NotificationHelper';
import config from './config';
import { routerInstance } from './utils/Router';
import StoryAPI from './api/story-api';

const app = new App(document.getElementById('app'));

window.addEventListener('hashchange', () => {
  app.renderPage();
});

window.addEventListener('load', () => {
  app.renderPage();

  const skipLink = document.querySelector('.skip-link');
  const mainContent = document.getElementById('mainContent');
  if (skipLink && mainContent) {
    skipLink.addEventListener('click', function (event) {
      event.preventDefault();
      skipLink.blur();
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const publicVapidKey = config.VAPID_PUBLIC_KEY;

    if (AuthHelper.isLoggedIn()) {
      navigator.serviceWorker.ready
        .then((registration) => {
          return registration.pushManager.getSubscription().then((subscription) => {
            return { registration, subscription };
          });
        })
        .then(async ({ registration, subscription }) => {
          if (subscription) {
            console.log('Push notifications: Already subscribed:', subscription);
          } else {
            console.log('Push notifications: No existing subscription found. Attempting to subscribe...');
            return registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
            });
          }
          return subscription;
        })
        .then(async (newSubscription) => {
          if (newSubscription && !newSubscription._sentToServer) {
            await StoryAPI.subscribeNotification(newSubscription.toJSON());
            newSubscription._sentToServer = true;
            console.log('Push notifications: Successfully subscribed and sent to server.');
          } else if (newSubscription && newSubscription._sentToServer) {
            console.log('Push notifications: Already subscribed and sent to server previously.');
          }
        })
        .catch((error) => {
          console.error('Push notifications: Failed to subscribe or send to server:', error);
          NotificationHelper.showError('Gagal berlangganan notifikasi. Mungkin Anda memblokir izin atau terjadi kesalahan lain.');
        });
    } else {
      console.log('Push notifications: User not logged in, skipping subscription attempt.');
    }
  } else {
    console.warn('Push notifications are not supported in this browser environment.');
  }
});

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
