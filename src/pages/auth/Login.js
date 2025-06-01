import AuthPresenter from '../../presenters/AuthPresenter';
import Router from '../../utils/Router';
import { routerInstance } from '../../utils/Router';
import NotificationHelper from '../../utils/NotificationHelper';
class Login {
  constructor() {
    this.presenter = new AuthPresenter(this);
    this.element = document.createElement('div');
    this.element.className = 'auth-page';
    this.render();
  }

  render() {
    this.element.innerHTML = `
            <div class="auth-card">
                <h2>Login ke Akun Anda</h2>
                <form id="loginForm" class="auth-form">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required aria-required="true" autocomplete="email">
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required aria-required="true" autocomplete="current-password">
                    </div>
                    <button type="submit" class="primary-button">Login <i class="fas fa-sign-in-alt"></i></button>
                    <p class="auth-link">Belum punya akun? <a href="#/register">Register di sini</a></p>
                    <p id="loginMessage" class="error-message" aria-live="polite"></p>
                </form>
            </div>
        `;

    return this.element;
  }

  afterRender() {
    const form = this.element.querySelector('#loginForm');
    const messageElement = this.element.querySelector('#loginMessage');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      messageElement.textContent = '';
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.setAttribute('disabled', 'true');
        submitButton.innerHTML = `<span class="loading-spinner"></span> Logging in...`;
      }

      const email = form.elements.email.value;
      const password = form.elements.password.value;

      try {
        const result = await this.presenter.login({ email, password });
        if (result.error) {
          NotificationHelper.showError(result.message);
        } else {
          NotificationHelper.showSuccess('Login berhasil!');
          console.log('Login: Successfully logged in. Attempting to navigate to /');
          routerInstance.navigate('/');
        }
      } catch (error) {
        console.error('Login error:', error);
        NotificationHelper.showError('Terjadi kesalahan saat login. Silakan coba lagi.');
      } finally {
        if (submitButton) {
          submitButton.removeAttribute('disabled');
          submitButton.innerHTML = `Login <i class="fas fa-sign-in-alt"></i>`;
        }
      }
    });
  }

  getLoginPageElement() {
    return this.element;
  }
}

export default Login;
