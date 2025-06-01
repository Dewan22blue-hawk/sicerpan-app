import AuthPresenter from '../../presenters/AuthPresenter';
import Router from '../../utils/Router';
import NotificationHelper from '../../utils/NotificationHelper';

class Register {
  constructor() {
    this.presenter = new AuthPresenter(this);
    this.element = document.createElement('div');
    this.element.className = 'auth-page';
    this.render();
  }

  render() {
    this.element.innerHTML = `
            <div class="auth-card">
                <h2>Daftar Akun Baru</h2>
                <form id="registerForm" class="auth-form">
                    <div class="form-group">
                        <label for="name">Nama Lengkap</label>
                        <input type="text" id="name" name="name" required aria-required="true" autocomplete="name">
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required aria-required="true" autocomplete="email">
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required minlength="8" aria-required="true" autocomplete="new-password">
                        <small>Password minimal 8 karakter.</small>
                    </div>
                    <button type="submit" class="primary-button">Register <i class="fas fa-user-plus"></i></button>
                    <p class="auth-link">Sudah punya akun? <a href="#/login">Login di sini</a></p>
                    <p id="registerMessage" class="error-message" aria-live="polite"></p>
                </form>
            </div>
        `;

    return this.element;
  }

  afterRender() {
    const form = this.element.querySelector('#registerForm');
    const messageElement = this.element.querySelector('#registerMessage');

    if (!form) {
      console.error('Error: registerForm not found in Register page after render.');
      return;
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      messageElement.textContent = '';
      const name = form.elements.name.value;
      const email = form.elements.email.value;
      const password = form.elements.password.value;

      try {
        const result = await this.presenter.register({ name, email, password });
        if (result.error) {
          NotificationHelper.showError(result.message);
          messageElement.textContent = result.message;
          messageElement.focus();
        } else {
          NotificationHelper.showSuccess('Registrasi berhasil! Silakan login.');
          Router.navigate('/login');
        }
      } catch (error) {
        console.error('Registration error:', error);
        messageElement.textContent = 'Terjadi kesalahan saat registrasi. Silakan coba lagi.';
        messageElement.focus();
      }
    });
  }

  getRegisterPageElement() {
    return this.element;
  }
}

export default Register;
