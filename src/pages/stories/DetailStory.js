import StoriesPresenter from '../../presenters/StoriesPresenter';
import Spinner from '../../components/Spinner';
import L from 'leaflet';
import StoryDb from '../../utils/StoryDb';
import NotificationHelper from '../../utils/NotificationHelper';

class DetailStory {
  constructor(storyId) {
    this.storyId = storyId;
    this.presenter = new StoriesPresenter(this);
    this.element = document.createElement('div');
    this.element.className = 'detail-story-page';
    this.map = null;
    this.marker = null;
    this.render();
  }

  render() {
    this.element.innerHTML = `
            <div id="detailContent">
                ${new Spinner().render().outerHTML}
            </div>
            <p id="detailMessage" class="info-message" aria-live="polite"></p>
        `;
    return this.element;
  }

  afterRender() {
    this.detailContentElement = this.element.querySelector('#detailContent');
    this.messageElement = this.element.querySelector('#detailMessage');

    if (!this.detailContentElement || !this.messageElement) {
      console.error('DetailStory Error: Essential elements (#detailContent or #detailMessage) not found in DetailStory page after render. Check HTML IDs/classes.');
      return;
    }
    this.presenter.fetchStoryDetail(this.storyId);
  }

  showLoading() {
    if (!this.detailContentElement || !this.messageElement) return;
    this.detailContentElement.innerHTML = new Spinner().render().outerHTML;
    this.messageElement.textContent = 'Memuat detail cerita...';
  }

  displayStoryDetail(story) {
    if (!this.detailContentElement || !this.messageElement) return;

    this.detailContentElement.innerHTML = '';
    this.messageElement.textContent = '';

    if (!story) {
      this.detailContentElement.innerHTML = '<p class="info-message">Cerita tidak ditemukan.</p>';
      return;
    }

    const date = new Date(story.createdAt).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    this.detailContentElement.innerHTML = `
            <h2 class="story-detail-title">${story.name}</h2>
            <div class="story-detail-image-container">
                <img src="${story.photoUrl}" alt="Gambar cerita ${story.name}" class="story-detail-image" loading="eager">
            </div>
            <div class="story-detail-info">
                <p class="story-detail-description"><strong>Deskripsi:</strong><br>${story.description}</p>
                <p class="story-detail-date"><i class="far fa-calendar-alt"></i> Dibuat pada: ${date}</p>
                ${
                  story.lat && story.lon
                    ? `
                    <div class="story-detail-location">
                        <p><strong>Lokasi:</strong></p>
                        <div id="detailMap" class="story-detail-map" style="height: 300px; border-radius: 8px;"></div>
                        <p class="lat-lon">Latitude: ${story.lat.toFixed(6)}, Longitude: ${story.lon.toFixed(6)}</p>
                    </div>
                `
                    : '<p class="no-location"><i class="fas fa-map-marker-alt"></i> Lokasi tidak tersedia.</p>'
                }
            </div>
            <div class="detail-actions">
                <button onclick="window.history.back()" class="back-button" aria-label="Kembali ke daftar cerita"><i class="fas fa-arrow-left"></i> Kembali</button>
                <button id="toggleFavoriteButton" class="tertiary-button" aria-label="Tambah/Hapus dari favorit">
                    <i class="far fa-heart"></i> Tambah ke Favorit
                </button>
            </div>
        `;

    if (story.lat && story.lon) {
      this._initMap(story.lat, story.lon, story.name, story.description);
    }

    const toggleFavoriteButton = this.detailContentElement.querySelector('#toggleFavoriteButton');
    if (toggleFavoriteButton) {
      this._checkFavoriteStatus(story.id, toggleFavoriteButton);

      toggleFavoriteButton.addEventListener('click', async () => {
        await this._toggleFavorite(story);
        this._checkFavoriteStatus(story.id, toggleFavoriteButton);
      });
    }
  }

  async _checkFavoriteStatus(storyId, buttonElement) {
    const favoritedStory = await StoryDb.getStory(storyId);
    if (favoritedStory) {
      buttonElement.innerHTML = '<i class="fas fa-heart"></i> Hapus dari Favorit';
      buttonElement.classList.add('favorited');
    } else {
      buttonElement.innerHTML = '<i class="far fa-heart"></i> Tambah ke Favorit';
      buttonElement.classList.remove('favorited');
    }
  }

  async _toggleFavorite(story) {
    const favoritedStory = await StoryDb.getStory(story.id);
    if (favoritedStory) {
      await StoryDb.deleteStory(story.id);
      NotificationHelper.showSuccess('Cerita dihapus dari favorit!');
    } else {
      await StoryDb.putStory(story);
      NotificationHelper.showSuccess('Cerita ditambahkan ke favorit!');
    }
  }

  _initMap(lat, lon, name, description) {
    const mapElement = this.element.querySelector('#detailMap');
    if (!mapElement) {
      console.error('DetailStory Error: #detailMap element not found for map initialization. Map cannot be initialized.');
      return;
    }
    if (!this.map) {
      this.map = L.map(mapElement).setView([lat, lon], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);

      this.marker = L.marker([lat, lon])
        .addTo(this.map)
        .bindPopup(`<b>${name}</b><br>${description.substring(0, 50)}${description.length > 50 ? '...' : ''}`)
        .openPopup();
    } else {
      this.map.setView([lat, lon], 13);
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
      this.marker = L.marker([lat, lon])
        .addTo(this.map)
        .bindPopup(`<b>${name}</b><br>${description.substring(0, 50)}${description.length > 50 ? '...' : ''}`)
        .openPopup();
    }
    if (this.map) {
      this.map.invalidateSize();
    }
  }

  displayError(message) {
    if (!this.detailContentElement || !this.messageElement) return;
    this.detailContentElement.innerHTML = '';
    this.messageElement.textContent = `Error: ${message}`;
    this.messageElement.classList.add('error-message');
    console.error('DetailStory Error:', message);
  }

  getDetailStoryPageElement() {
    return this.element;
  }

  beforeUnmount() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}

export default DetailStory;
