import StoriesPresenter from '../../presenters/StoriesPresenter';
import StoryCard from '../../components/StoryCard';
import Spinner from '../../components/Spinner';
import config from '../../config';
import L from 'leaflet';

class Stories {
  constructor() {
    this.presenter = new StoriesPresenter(this);
    this.element = document.createElement('div');
    this.element.className = 'stories-page';
    this.map = null; // Leaflet map instance
    this.markers = L.featureGroup(); // Layer for markers
    this.tileLayers = {}; // Store different tile layers
    this.currentTileLayer = null;
    this.render();
  }

  render() {
    this.element.innerHTML = `
            <h2 class="page-title">Cerita Terbaru</h2>
            <div class="stories-actions">
                <button id="refreshStories" class="action-button" aria-label="Refresh daftar cerita"><i class="fas fa-sync-alt"></i> Refresh</button>
                <button id="toggleMap" class="action-button" aria-label="Tampilkan atau sembunyikan peta cerita"><i class="fas fa-map-marked-alt"></i> Tampilkan Peta</button>
            </div>
            <div id="storyMapContainer" class="story-map-container" style="display: none;">
                <div id="storyMap" class="story-map"></div>
                <div id="mapLayerControl" class="map-layer-control">
                    <label>Pilih Gaya Peta:</label>
                    <select id="mapStyleSelect">
                        <option value="osm">OpenStreetMap</option>
                        <option value="maptiler_streets">MapTiler Streets</option>
                        <option value="maptiler_satellite">MapTiler Satellite</option>
                    </select>
                </div>
            </div>
            <div id="storiesList" class="stories-grid">
                ${new Spinner().render().outerHTML}
            </div>
            <p id="storiesMessage" class="info-message" aria-live="polite"></p>
        `;
    return this.element;
  }

  afterRender() {
    this.storiesListElement = this.element.querySelector('#storiesList');
    this.messageElement = this.element.querySelector('#storiesMessage');
    this.toggleMapButton = this.element.querySelector('#toggleMap');
    this.mapContainer = this.element.querySelector('#storyMapContainer');
    this.mapElement = this.element.querySelector('#storyMap');
    this.mapStyleSelect = this.element.querySelector('#mapStyleSelect');

    if (!this.storiesListElement || !this.messageElement || !this.toggleMapButton || !this.mapContainer || !this.mapElement || !this.mapStyleSelect) {
      // Biarkan error ini jika elemen penting tidak ditemukan (masalah UI)
      console.error('Stories Error: One or more essential elements not found in Stories page after render. Check HTML IDs/classes.');
      return;
    }

    const refreshButton = this.element.querySelector('#refreshStories');
    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        this.presenter.fetchStories();
      });
    }

    if (this.toggleMapButton) {
      this.toggleMapButton.addEventListener('click', () => {
        this._toggleMapVisibility();
      });
    }

    if (this.mapStyleSelect) {
      this.mapStyleSelect.addEventListener('change', (event) => {
        this._changeMapTileLayer(event.target.value);
      });
    }

    this.presenter.fetchStories();
  }

  _toggleMapVisibility() {
    if (!this.mapContainer || !this.toggleMapButton) {
      // Biarkan error ini jika elemen penting tidak ditemukan (masalah UI)
      console.error('Stories Error: Map container or toggle button not found for map visibility toggle.');
      return;
    }
    const isMapVisible = this.mapContainer.style.display === 'block';
    if (isMapVisible) {
      this.mapContainer.style.display = 'none';
      this.toggleMapButton.innerHTML = '<i class="fas fa-map-marked-alt"></i> Tampilkan Peta';
      this.toggleMapButton.setAttribute('aria-label', 'Tampilkan peta cerita');
    } else {
      this.mapContainer.style.display = 'block';
      this.toggleMapButton.innerHTML = '<i class="fas fa-times"></i> Sembunyikan Peta';
      this.toggleMapButton.setAttribute('aria-label', 'Sembunyikan peta cerita');
      if (!this.map) {
        this._initMap();
        if (this.currentStories && this.currentStories.length > 0) {
          this._addMarkersToMap(this.currentStories);
        }
      }
      if (this.map) {
        this.map.invalidateSize();
      }
    }
  }

  _initMap() {
    if (!this.mapElement) {
      // Biarkan error ini jika elemen penting tidak ditemukan (masalah UI)
      console.error('Stories Error: Map element (#storyMap) not found for map initialization. Map cannot be initialized.');
      return;
    }
    if (!this.map) {
      this.map = L.map(this.mapElement).setView([-6.2, 106.81], 10); // Default to Jakarta
      this._setupTileLayers();
      this.currentTileLayer = this.tileLayers['osm'];
      if (this.currentTileLayer) {
        this.currentTileLayer.addTo(this.map);
      } else {
        // Biarkan error ini jika tile layer OSM tidak terdefinisi
        console.error('Stories Error: OSM tile layer is undefined after setup.');
      }
      this.markers.addTo(this.map); // Add marker layer group to map
    }
  }

  _setupTileLayers() {
    this.tileLayers['osm'] = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    });

    const maptilerApiKey = config.MAPTILER_API_KEY;
    if (!maptilerApiKey || maptilerApiKey === 'YOUR_MAPTILER_API_KEY_HERE') {
      // Biarkan warning ini karena ini adalah masalah konfigurasi
      console.warn('Stories Warning: MapTiler API key is missing or default. MapTiler layers might not work.');
    }

    this.tileLayers['maptiler_streets'] = L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${maptilerApiKey}`, {
      attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
      maxZoom: 19,
    });

    this.tileLayers['maptiler_satellite'] = L.tileLayer(`https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${maptilerApiKey}`, {
      attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
      maxZoom: 19,
    });
  }

  _changeMapTileLayer(layerName) {
    if (!this.map) {
      // Biarkan error ini jika map instance tidak ditemukan
      console.error('Stories Error: Map instance not found when trying to change tile layer. Cannot change map style.');
      return;
    }
    if (this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }
    this.currentTileLayer = this.tileLayers[layerName];
    if (this.currentTileLayer) {
      this.currentTileLayer.addTo(this.map);
    } else {
      // Biarkan error ini jika tile layer yang diminta tidak terdefinisi
      console.error('Stories Error: Requested tile layer is undefined:', layerName);
    }
  }

  _addMarkersToMap(stories) {
    if (!this.map || !this.markers) {
      // Biarkan error ini jika map atau markers group tidak ditemukan
      console.error('Stories Error: Map or markers feature group not found for adding markers. Cannot add story markers.');
      return;
    }
    this.markers.clearLayers(); // Clear existing markers

    let bounds = [];
    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const latLng = [story.lat, story.lon];
        const marker = L.marker(latLng).bindPopup(`
                        <b>${story.name}</b><br>
                        ${story.description.substring(0, 50)}${story.description.length > 50 ? '...' : ''}<br>
                        <img src="${story.photoUrl}" alt="${story.name}'s story photo" style="width:100px; height:auto;">
                    `);
        this.markers.addLayer(marker);
        bounds.push(latLng);
      }
    });

    if (bounds.length > 0) {
      this.map.fitBounds(bounds, { padding: [50, 50] }); // Fit map to markers
    } else {
      this.map.setView([-6.2, 106.81], 10); // Default to Jakarta if no stories with location
    }
  }

  showLoading() {
    if (!this.storiesListElement || !this.messageElement) {
      // Biarkan error ini jika elemen penting tidak ditemukan
      console.error('Stories Error: Stories list element or message element not found for showLoading. Cannot display loading state.');
      return;
    }
    this.storiesListElement.innerHTML = new Spinner().render().outerHTML;
    this.messageElement.textContent = 'Memuat cerita...';
  }

  displayStories(stories) {
    if (!this.storiesListElement || !this.messageElement) {
      // Biarkan error ini jika elemen penting tidak ditemukan
      console.error('Stories Error: Stories list element or message element not found for displayStories. Cannot display stories.');
      return;
    }
    this.currentStories = stories; // Store current stories for map
    this.storiesListElement.innerHTML = '';
    this.messageElement.textContent = '';

    if (!stories || stories.length === 0) {
      this.storiesListElement.innerHTML = '<p class="info-message">Tidak ada cerita yang ditemukan. Yuk, buat cerita pertamamu!</p>';
      return;
    }

    stories.forEach((story) => {
      const storyCard = new StoryCard(story);
      const renderedCard = storyCard.render();
      if (renderedCard instanceof HTMLElement) {
        this.storiesListElement.appendChild(renderedCard);
      } else {
        console.error('Stories Error: StoryCard.render() did not return an HTMLElement for story:', story);
      }
    });

    if (this.map && this.mapContainer && this.mapContainer.style.display === 'block') {
      this._addMarkersToMap(this.currentStories);
    }
  }

  displayError(message) {
    if (!this.storiesListElement || !this.messageElement) {
      console.error('Stories Error: Stories list element or message element not found for displayError. Cannot display error message.');
      return;
    }
    // console.error('Stories: Displaying error message:', message); // Hapus log ini (opsional, bisa dibiarkan jika ingin melihat error di konsol)
    this.storiesListElement.innerHTML = '';
    this.messageElement.textContent = `Error: ${message}`;
    this.messageElement.classList.add('error-message');
  }

  getStoriesPageElement() {
    return this.element;
  }
}

export default Stories;
