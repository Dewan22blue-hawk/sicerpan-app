import { routerInstance } from './utils/Router';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthHelper from './utils/AuthHelper';
import StoriesPage from './pages/stories/Stories';
import AddStoryPage from './pages/stories/AddStory';
import DetailStoryPage from './pages/stories/DetailStory';
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';
import NotFoundPage from './pages/NotFound';
import FavoriteStoriesPage from './pages/favorites/FavoriteStories';

class App {
  constructor(appElement) {
    this.appElement = appElement;
    this.header = new Header();
    this.footer = new Footer();
    this.router = routerInstance;
    this._setupRoutes();
    this._renderLayout();
  }

  _setupRoutes() {
    this.router.addRoute('/', () => {
      if (!AuthHelper.isLoggedIn()) {
        this.router.navigate('/login');
        return null;
      }
      return new StoriesPage();
    });
    this.router.addRoute('/stories', () => {
      if (!AuthHelper.isLoggedIn()) {
        this.router.navigate('/login');
        return null;
      }
      return new StoriesPage();
    });
    this.router.addRoute('/add-story', () => {
      if (!AuthHelper.isLoggedIn()) {
        this.router.navigate('/login');
        return null;
      }
      return new AddStoryPage();
    });
    this.router.addRoute('/stories/:id', (id) => {
      if (!AuthHelper.isLoggedIn()) {
        this.router.navigate('/login');
        return null;
      }
      return new DetailStoryPage(id);
    });
    this.router.addRoute('/favorites', () => {
      if (!AuthHelper.isLoggedIn()) {
        this.router.navigate('/login');
        return null;
      }
      return new FavoriteStoriesPage();
    });
    this.router.addRoute('/login', () => {
      if (AuthHelper.isLoggedIn()) {
        this.router.navigate('/');
        return null;
      }
      return new LoginPage();
    });
    this.router.addRoute('/register', () => {
      if (AuthHelper.isLoggedIn()) {
        this.router.navigate('/');
        return null;
      }
      return new RegisterPage();
    });
    this.router.addNotFoundHandler(() => new NotFoundPage());
  }

  _renderLayout() {
    this.appElement.innerHTML = `
                <header id="app-header"></header>
                <main id="mainContent" class="main-content"></main>
                <footer id="app-footer"></footer>
            `;
    document.getElementById('app-header').appendChild(this.header.render());
    document.getElementById('app-footer').appendChild(this.footer.render());
  }

  async renderPage() {
    const mainContent = document.getElementById('mainContent');

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        this._updateMainContent(mainContent);
      });
    } else {
      this._updateMainContent(mainContent);
    }

    this.header.updateLoginStatus();
  }

  _updateMainContent(mainContent) {
    const currentPage = this.router.currentPageInstance;
    if (currentPage && typeof currentPage.beforeUnmount === 'function') {
      console.log('App: Calling beforeUnmount() for current page:', currentPage.constructor.name);
      currentPage.beforeUnmount();
    }

    const page = this.router.resolve();
    if (page) {
      mainContent.innerHTML = '';
      const renderedElement = page.render();
      if (renderedElement instanceof HTMLElement) {
        mainContent.appendChild(renderedElement);
        if (typeof page.afterRender === 'function') {
          page.afterRender();
        }
      } else {
        console.error('App Error: Page.render() did not return an HTMLElement:', renderedElement);
      }
      this.router.currentPageInstance = page;
    } else {
      console.log('App: No page instance returned (likely due to redirect or null). Clearing mainContent.');
      mainContent.innerHTML = '';
      this.router.currentPageInstance = null;
    }
  }
}

export default App;
