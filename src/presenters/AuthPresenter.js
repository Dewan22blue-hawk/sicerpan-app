import StoryAPI from '../api/story-api.js';
import AuthHelper from '../utils/AuthHelper.js';

class AuthPresenter {
  constructor(view) {
    this.view = view;
  }

  async register({ name, email, password }) {
    // console.log('AuthPresenter: Starting user registration...');
    try {
      const response = await StoryAPI.register({ name, email, password });
      // console.log('AuthPresenter: Register API response received:', response);
      if (response.error) {
        return { error: true, message: response.message };
      }
      return { error: false, message: response.message };
    } catch (error) {
      // console.error('AuthPresenter Error: User registration failed:', error);
      return { error: true, message: 'Gagal mendaftar. Silakan coba lagi. (Client-side error)' };
    }
  }

  async login({ email, password }) {
    // console.log('AuthPresenter: Starting user login...');
    try {
      const response = await StoryAPI.login({ email, password });
      // console.log('AuthPresenter: Login API response received:', response);

      if (response.error) {
        return { error: true, message: response.message };
      }

      AuthHelper.setAuthData(response.loginResult);
      return { error: false, message: response.message };
    } catch (error) {
      // console.error('AuthPresenter Error: User login failed:', error);

      return { error: true, message: `Gagal login. ${error.message || 'Silakan coba lagi.'}` };
    }
  }
}

export default AuthPresenter;
