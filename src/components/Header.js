import { routerInstance } from '../utils/Router';
import AuthHelper from '../utils/AuthHelper';

class Header {
  constructor() {
    this.element = document.createElement('nav');
    this.element.className = 'app-header';
    this.render();
  }

  render() {
    this.element.innerHTML = `
        <a href="#mainContent" class="skip-link">Skip to Content</a> <div class="header-content">
            <h1 class="app-logo"><a href="#/stories" aria-label="Beranda Dicoding Story App">Dicoding Story App</a></h1>
            <button id="menuToggle" class="menu-toggle" aria-label="Buka navigasi">
                <i class="fas fa-bars"></i>
            </button>
            <ul class="nav-list" id="navList">
                <li><a href="#/stories" aria-label="Halaman Beranda">Beranda</a></li>
                <li><a href="#/add-story" aria-label="Halaman Tambah Cerita Baru">Tambah Cerita</a></li>
                <li><a href="#/favorites" aria-label="Halaman Cerita Favorit Anda">Favorit</a></li> <li id="auth-link"></li>
                <li id="auth-link"></li>
            </ul>
        </div>
    `;
    this._setupEventListeners();
    this.updateLoginStatus();
    return this.element;
  }

  _setupEventListeners() {
    const menuToggle = this.element.querySelector('#menuToggle');
    const navList = this.element.querySelector('#navList');

    menuToggle.addEventListener('click', () => {
      navList.classList.toggle('active');
      const isExpanded = navList.classList.contains('active');
      menuToggle.setAttribute('aria-expanded', isExpanded);

      menuToggle.querySelector('i').className = isExpanded ? 'fas fa-times' : 'fas fa-bars';
    });

    navList.addEventListener('click', (event) => {
      if (event.target.tagName === 'A') {
        navList.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.querySelector('i').className = 'fas fa-bars';
      }
    });

    document.addEventListener('click', (event) => {
      if (!this.element.contains(event.target) && navList.classList.contains('active')) {
        navList.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.querySelector('i').className = 'fas fa-bars';
      }
    });
  }

  updateLoginStatus() {
    const authLinkContainer = this.element.querySelector('#auth-link');
    authLinkContainer.innerHTML = '';

    if (AuthHelper.isLoggedIn()) {
      const logoutButton = document.createElement('button');
      logoutButton.className = 'logout-button';
      logoutButton.innerHTML = 'Logout <i class="fas fa-sign-out-alt"></i>';
      logoutButton.setAttribute('aria-label', 'Keluar dari aplikasi');
      logoutButton.addEventListener('click', () => {
        AuthHelper.clearAuthData();

        routerInstance.navigate('/login');
        this.updateLoginStatus();
      });
      authLinkContainer.appendChild(logoutButton);
    } else {
      const loginLink = document.createElement('a');
      loginLink.href = '#/login';
      loginLink.setAttribute('aria-label', 'Masuk ke akun Anda');
      loginLink.innerHTML = 'Login <i class="fas fa-sign-in-alt"></i>';
      authLinkContainer.appendChild(loginLink);
    }
  }
}

export default Header;
