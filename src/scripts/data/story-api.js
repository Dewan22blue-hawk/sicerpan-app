import config from '../../config';
import AuthHelper from '../../utils/AuthHelper';

const API_BASE_URL = config.BASE_URL;

const StoryAPI = {
  /**
   * Mendaftarkan pengguna baru.
   * @param {Object} userData - Data pengguna (name, email, password).
   * @returns {Promise<Object>} Respons dari API.
   */
  async register({ name, email, password }) {
    console.log('StoryAPI: Sending register request to:', `${API_BASE_URL}/register`);
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    console.log('StoryAPI: Register response status:', response.status, response.statusText);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Server responded with status ${response.status} ${response.statusText || ''}` }));
      console.error('StoryAPI Error: Register non-OK response:', errorData);
      throw new Error(errorData.message || 'Registration failed due to server error.');
    }

    const data = await response.json();
    console.log('StoryAPI: Register parsed response data:', data);
    return data;
  },

  /**
   * Melakukan login pengguna.
   * @param {Object} credentials - Kredensial pengguna (email, password).
   * @returns {Promise<Object>} Respons dari API.
   */
  async login({ email, password }) {
    console.log('StoryAPI: Sending login request to:', `${API_BASE_URL}/login`);
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('StoryAPI: Login response status:', response.status, response.statusText);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Server responded with status ${response.status} ${response.statusText || ''}` }));
      console.error('StoryAPI Error: Login non-OK response:', errorData);
      throw new Error(errorData.message || 'Failed to login due to server error.');
    }

    const data = await response.json();
    console.log('StoryAPI: Login parsed response data:', data);
    return data;
  },

  /**
   * Mengambil semua cerita.
   * @param {Object} [options] - Opsi filter (page, size, location).
   * @returns {Promise<Object>} Respons dari API.
   */
  async getAllStories({ page = 1, size = 10, location = 0 } = {}) {
    const token = AuthHelper.getToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = new URL(`${API_BASE_URL}/stories`);
    url.searchParams.append('page', page);
    url.searchParams.append('size', size);
    url.searchParams.append('location', location);

    console.log('StoryAPI: Fetching all stories from:', url.toString());
    console.log('StoryAPI: Request headers for getAllStories:', headers);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: headers,
    });

    console.log('StoryAPI: getAllStories response status:', response.status, response.statusText);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Server responded with status ${response.status} ${response.statusText || ''}` }));
      console.error('StoryAPI Error: getAllStories non-OK response:', errorData);
      throw new Error(errorData.message || 'Failed to fetch stories from server.');
    }

    const data = await response.json();
    console.log('StoryAPI: getAllStories parsed data:', data);
    return data;
  },

  /**
   * Mengambil detail cerita berdasarkan ID.
   * @param {string} id - ID cerita.
   * @returns {Promise<Object>} Respons dari API.
   */
  async getStoryDetail(id) {
    const token = AuthHelper.getToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('StoryAPI: Fetching story detail from:', `${API_BASE_URL}/stories/${id}`);
    console.log('StoryAPI: Request headers for getStoryDetail:', headers);

    const response = await fetch(`${API_BASE_URL}/stories/${id}`, {
      method: 'GET',
      headers: headers,
    });

    console.log('StoryAPI: getStoryDetail response status:', response.status, response.statusText);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Server responded with status ${response.status} ${response.statusText || ''}` }));
      console.error('StoryAPI Error: getStoryDetail non-OK response:', errorData);
      throw new Error(errorData.message || 'Failed to fetch story detail from server.');
    }

    const data = await response.json();
    console.log('StoryAPI: getStoryDetail parsed data:', data);
    return data;
  },

  /**
   * Menambahkan cerita baru.
   * @param {Object} storyData - Data cerita (description, photo, lat, lon).
   * @returns {Promise<Object>} Respons dari API.
   */
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

    console.log('StoryAPI: Adding new story to:', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    console.log('StoryAPI: addStory response status:', response.status, response.statusText);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Server responded with status ${response.status} ${response.statusText || ''}` }));
      console.error('StoryAPI Error: addStory non-OK response:', errorData);
      throw new Error(errorData.message || 'Failed to add story due to server error.');
    }

    const data = await response.json();
    console.log('StoryAPI: addStory parsed data:', data);
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
