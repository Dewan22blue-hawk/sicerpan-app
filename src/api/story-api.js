import config from '../config';
import AuthHelper from '../utils/AuthHelper';

const API_BASE_URL = config.BASE_URL;

const StoryAPI = {
  async register({ name, email, password }) {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    return data;
  },

  async login({ email, password }) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    return data;
  },

  async getAllStories({ page = 1, size = 10, location = 0 } = {}) {
    const token = AuthHelper.getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const url = new URL(`${API_BASE_URL}/stories`);
    url.searchParams.append('page', page);
    url.searchParams.append('size', size);
    url.searchParams.append('location', location);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: headers,
    });
    const data = await response.json();
    return data;
  },

  async getStoryDetail(id) {
    const token = AuthHelper.getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    console.log(`Fetching story detail for ID: ${id}`);
    const response = await fetch(`${API_BASE_URL}/stories/${id}`, {
      method: 'GET',
      headers: headers,
    });

    console.log('Raw Response:', response);

    const data = await response.json();

    console.log('Parsed JSON:', data);

    return data;
  },

  async addStory({ description, photo, lat = null, lon = null }) {
    const token = AuthHelper.getToken();
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    if (lat !== null && lon !== null) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }

    const url = token ? `${API_BASE_URL}/stories` : `${API_BASE_URL}/stories/guest`;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: formData,
    });
    const data = await response.json();
    return data;
  },

  /**
   * Mengirim langganan push notification ke server.
   * @param {PushSubscriptionJSON} subscription - Objek langganan push dari browser (toJSON()).
   * @returns {Promise<Object>} Respons dari API.
   */
  async subscribeNotification(subscription) {
    const token = AuthHelper.getToken();
    if (!token) {
      throw new Error('User not authenticated for notifications.');
    }

    const subscriptionToSend = {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    };

    console.log('StoryAPI: Sending push subscription to server:', subscriptionToSend);
    const response = await fetch(`${API_BASE_URL}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscriptionToSend),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Server responded with status ${response.status} ${response.statusText || ''}` }));
      console.error('StoryAPI Error: Failed to subscribe to push notification:', errorData);
      throw new Error(errorData.message || 'Failed to subscribe to push notification from server.');
    }

    const data = await response.json();
    console.log('StoryAPI: Push subscription response received:', data);
    return data;
  },

  /**
   * Mengirim permintaan berhenti langganan push notification ke server.
   * @param {string} endpoint - Endpoint langganan yang akan dihentikan.
   * @returns {Promise<Object>} Respons dari API.
   */
  async unsubscribeNotification(endpoint) {
    const token = AuthHelper.getToken();
    if (!token) {
      throw new Error('User not authenticated for notifications.');
    }

    console.log('StoryAPI: Sending push unsubscription to server for endpoint:', endpoint);
    const response = await fetch(`${API_BASE_URL}/notifications/subscribe`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Server responded with status ${response.status} ${response.statusText || ''}` }));
      console.error('StoryAPI Error: Failed to unsubscribe from push notification:', errorData);
      throw new Error(errorData.message || 'Failed to unsubscribe from push notification from server.');
    }

    const data = await response.json();
    console.log('StoryAPI: Push unsubscription response received:', data);
    return data;
  },
};

export default StoryAPI;
