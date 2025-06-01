const AUTH_KEY = 'dicoding_story_auth';

const AuthHelper = {
  setAuthData({ userId, name, token }) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ userId, name, token }));
  },

  getAuthData() {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  },

  getToken() {
    const data = this.getAuthData();
    return data ? data.token : null;
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  clearAuthData() {
    localStorage.removeItem(AUTH_KEY);
  },
};
export default AuthHelper;
