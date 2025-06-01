import StoryDb from '../../utils/StoryDb';
import StoryCard from '../../components/StoryCard';
import Spinner from '../../components/Spinner';
import NotificationHelper from '../../utils/NotificationHelper';

class FavoriteStories {
  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'favorite-stories-page';
    this.render();
  }

  render() {
    this.element.innerHTML = `
            <h2 class="page-title">Cerita Favorit Anda</h2>
            <div id="favoriteStoriesList" class="stories-grid">
                ${new Spinner().render().outerHTML}
            </div>
            <p id="favoriteStoriesMessage" class="info-message" aria-live="polite"></p>
        `;
    return this.element;
  }

  afterRender() {
    this.favoriteStoriesListElement = this.element.querySelector('#favoriteStoriesList');
    this.messageElement = this.element.querySelector('#favoriteStoriesMessage');

    if (!this.favoriteStoriesListElement || !this.messageElement) {
      console.error('FavoriteStories Error: Essential elements not found after render.');
      return;
    }

    this._fetchAndDisplayFavoriteStories();
  }

  async _fetchAndDisplayFavoriteStories() {
    this.showLoading();
    try {
      const stories = await StoryDb.getAllStories();

      this.favoriteStoriesListElement.innerHTML = '';
      this.messageElement.textContent = '';

      if (!stories || stories.length === 0) {
        this.favoriteStoriesListElement.innerHTML = '<p class="info-message">Anda belum memiliki cerita favorit. Tambahkan beberapa dari halaman detail cerita!</p>';
        return;
      }

      stories.forEach((story) => {
        const storyCard = new StoryCard(story);
        const renderedCard = storyCard.render();
        if (renderedCard instanceof HTMLElement) {
          this.favoriteStoriesListElement.appendChild(renderedCard);
        } else {
          console.error('FavoriteStories Error: StoryCard.render() did not return an HTMLElement for story:', story);
        }
      });
      NotificationHelper.showInfo(`Menampilkan ${stories.length} cerita favorit dari IndexedDB.`);
    } catch (error) {
      console.error('FavoriteStories Error: Failed to fetch favorite stories from IndexedDB:', error);
      NotificationHelper.showError('Gagal memuat cerita favorit. Silakan coba lagi.');
      this.messageElement.textContent = 'Gagal memuat cerita favorit.';
    }
  }

  showLoading() {
    if (!this.favoriteStoriesListElement || !this.messageElement) return;
    this.favoriteStoriesListElement.innerHTML = new Spinner().render().outerHTML;
    this.messageElement.textContent = 'Memuat cerita favorit...';
  }

  getFavoriteStoriesPageElement() {
    return this.element;
  }
}

export default FavoriteStories;
