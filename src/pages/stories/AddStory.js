import AddStoryPresenter from '../../presenters/AddStoryPresenter';
import Router from '../../utils/Router';
import CameraHelper from '../../utils/CameraHelper';
import Spinner from '../../components/Spinner';
import config from '../../config';
import NotificationHelper from '../../utils/NotificationHelper';

class AddStory {
  constructor() {
    this.presenter = new AddStoryPresenter(this);
    this.element = document.createElement('div');
    this.element.className = 'add-story-page';
    this.photoFile = null;
    this.map = null;
    this.marker = null;
    this.selectedLat = null;
    this.selectedLon = null;
    this.cameraStream = null;
    this.render();
  }

  render() {
    this.element.innerHTML = `
            <h2 class="page-title">Tambah Cerita Baru</h2>
            <form id="addStoryForm" class="add-story-form">
                <div class="form-group">
                    <label for="description">Deskripsi Cerita</label>
                    <textarea id="description" name="description" rows="5" required aria-required="true"></textarea>
                </div>

                <div class="form-group">
                    <label for="photo">Foto Cerita</label>
                    <input type="file" id="photo" name="photo" accept="image/*" style="display:none;" aria-label="Unggah foto dari perangkat">
                    <div class="photo-capture-area">
                        <video id="cameraPreview" autoplay playsinline style="display:none;"></video>
                        <canvas id="photoCanvas" style="display:none;"></canvas>
                        <img id="photoPreview" alt="Preview Foto" style="display:none; max-width: 100%; height: auto; border-radius: 8px;">
                        <div class="camera-controls">
                            <button type="button" id="startCameraButton" class="secondary-button" aria-label="Mulai kamera untuk mengambil foto"><i class="fas fa-camera"></i> Ambil dari Kamera</button>
                            <button type="button" id="takePictureButton" class="primary-button" style="display:none;" aria-label="Ambil foto"><i class="fas fa-circle"></i> Ambil Foto</button>
                            <button type="button" id="uploadFileButton" class="secondary-button" aria-label="Unggah foto dari perangkat Anda"><i class="fas fa-upload"></i> Unggah File</button>
                            <button type="button" id="clearPhotoButton" class="tertiary-button" style="display:none;" aria-label="Bersihkan foto yang dipilih"><i class="fas fa-times"></i> Hapus Foto</button>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label>Lokasi (Opsional)</label>
                    <div id="storyMap" class="story-map-form" style="height: 300px; border-radius: 8px; margin-bottom: 10px;"></div>
                    <p class="map-hint">Klik pada peta untuk menentukan lokasi cerita Anda.</p>
                    <div class="lat-lon-display">
                        <p>Latitude: <span id="latDisplay">N/A</span></p>
                        <p>Longitude: <span id="lonDisplay">N/A</span></p>
                    </div>
                    <button type="button" id="clearLocationButton" class="tertiary-button" style="display:none;" aria-label="Bersihkan lokasi yang dipilih"><i class="fas fa-map-marker-alt"></i> Hapus Lokasi</button>
                </div>

                <button type="submit" class="primary-button add-story-submit-button">Unggah Cerita <i class="fas fa-paper-plane"></i></button>
                <p id="addStoryMessage" class="error-message" aria-live="polite"></p>
            </form>
        `;
    return this.element; // **Harus mengembalikan elemen DOM yang telah dibuat dan diisi**
  }

  afterRender() {
    this.form = this.element.querySelector('#addStoryForm');
    this.descriptionInput = this.element.querySelector('#description');
    this.photoInput = this.element.querySelector('#photo');
    this.cameraPreview = this.element.querySelector('#cameraPreview');
    this.photoCanvas = this.element.querySelector('#photoCanvas');
    this.photoPreview = this.element.querySelector('#photoPreview');
    this.startCameraButton = this.element.querySelector('#startCameraButton');
    this.takePictureButton = this.element.querySelector('#takePictureButton');
    this.uploadFileButton = this.element.querySelector('#uploadFileButton');
    this.clearPhotoButton = this.element.querySelector('#clearPhotoButton');
    this.mapElement = this.element.querySelector('#storyMap');
    this.latDisplay = this.element.querySelector('#latDisplay');
    this.lonDisplay = this.element.querySelector('#lonDisplay');
    this.clearLocationButton = this.element.querySelector('#clearLocationButton');
    this.messageElement = this.element.querySelector('#addStoryMessage');

    if (!this.form) {
      console.error('Error: #addStoryForm not found in AddStory page after render. Check HTML structure.');
      return;
    }

    this._setupEventListeners();
    this._initMap();
  }

  _setupEventListeners() {
    this.form.addEventListener('submit', async (event) => {
      event.preventDefault();
      this.messageElement.textContent = ''; // Clear previous messages
      this.showLoading();

      const description = this.descriptionInput.value;

      if (!this.photoFile) {
        NotificationHelper.showError('Foto cerita wajib diisi.');
        this.hideLoading();
        return;
      }

      try {
        const result = await this.presenter.addStory({
          description,
          photo: this.photoFile,
          lat: this.selectedLat,
          lon: this.selectedLon,
        });

        if (result.error) {
          NotificationHelper.showError(result.message);
        } else {
          NotificationHelper.showSuccess('Cerita berhasil diunggah!');
          this.form.reset();
          this._resetPhotoInput();
          this._resetMap(); // _resetMap dipanggil setelah navigasi, akan aman
          Router.navigate('/stories');
        }
      } catch (error) {
      } finally {
        this.hideLoading();
      }
    });

    this.startCameraButton.addEventListener('click', async () => {
      try {
        await this._startCamera();
      } catch (error) {
        this.displayError('Gagal mengakses kamera. Pastikan browser memiliki izin.');
        console.error('Camera access error:', error);
      }
    });

    this.takePictureButton.addEventListener('click', () => {
      this._takePicture();
    });

    this.uploadFileButton.addEventListener('click', () => {
      this.photoInput.click(); // Trigger file input click
    });

    this.photoInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        this._displayFilePhoto(file);
      }
    });

    this.clearPhotoButton.addEventListener('click', () => {
      this._resetPhotoInput();
    });

    this.clearLocationButton.addEventListener('click', () => {
      this._resetMap();
    });
  }

  _initMap() {
    if (!this.mapElement) {
      console.error('Error: #storyMap element not found for map initialization.');
      return;
    }
    if (!this.map) {
      this.map = L.map(this.mapElement).setView([-6.2, 106.81], 13); // Default to Jakarta
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);

      this.map.on('click', (e) => {
        this.selectedLat = e.latlng.lat;
        this.selectedLon = e.latlng.lng;
        this._updateMapMarker(e.latlng);
      });
    }
    this.map.invalidateSize();
  }

  _updateMapMarker(latlng) {
    if (!this.map) {
      console.error('Error: Map instance not found when trying to update marker.');
      return;
    }
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
    this.marker = L.marker(latlng)
      .addTo(this.map)
      .bindPopup(`Lokasi Cerita: ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`)
      .openPopup();
    this.latDisplay.textContent = this.selectedLat.toFixed(6);
    this.lonDisplay.textContent = this.selectedLon.toFixed(6);
    this.clearLocationButton.style.display = 'inline-block';
  }

  _resetMap() {
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
    this.selectedLat = null;
    this.selectedLon = null;
    this.latDisplay.textContent = 'N/A';
    this.lonDisplay.textContent = 'N/A';
    this.clearLocationButton.style.display = 'none';
    if (this.map) {
      this.map.setView([-6.2, 106.81], 13); // Reset view ke default Jakarta
    }
  }

  async _startCamera() {
    if (!this.cameraPreview) {
      console.error('Error: #cameraPreview element not found.');
      return;
    }
    try {
      this.cameraStream = await CameraHelper.startCamera(this.cameraPreview);
      this.cameraPreview.style.display = 'block';
      this.photoPreview.style.display = 'none';
      this.photoCanvas.style.display = 'none';
      this.startCameraButton.style.display = 'none';
      this.uploadFileButton.style.display = 'none';
      this.takePictureButton.style.display = 'inline-block';
      this.clearPhotoButton.style.display = 'inline-block';
      this.photoFile = null; // Clear previous photo
    } catch (error) {
      console.error('Error starting camera:', error);
      throw error; // Re-throw to be caught by event listener
    }
  }

  _takePicture() {
    if (!this.cameraPreview || !this.photoCanvas) {
      console.error('Error: Camera preview or canvas element not found for taking picture.');
      return;
    }
    if (this.cameraStream) {
      const capturedFile = CameraHelper.takePicture(this.cameraPreview, this.photoCanvas);
      if (capturedFile instanceof Promise) {
        capturedFile.then((file) => (this.photoFile = file)); // Tangani promise resolution
      } else {
        this.photoFile = capturedFile; // Langsung assign jika File
      }

      this.photoCanvas.style.display = 'block';
      this.photoPreview.style.display = 'none';
      this.cameraPreview.style.display = 'none';
      this.takePictureButton.style.display = 'none';
      this.startCameraButton.style.display = 'inline-block';
      this.uploadFileButton.style.display = 'inline-block'; // Show upload button again
      CameraHelper.stopCamera(this.cameraStream); // Stop camera stream
      this.cameraStream = null;
    }
  }

  _displayFilePhoto(file) {
    if (!this.photoPreview) {
      console.error('Error: Photo preview element not found for displaying file.');
      return;
    }
    if (this.cameraStream) {
      CameraHelper.stopCamera(this.cameraStream);
      this.cameraStream = null;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoPreview.src = e.target.result;
      this.photoPreview.style.display = 'block';
      this.cameraPreview.style.display = 'none';
      this.photoCanvas.style.display = 'none';
      this.startCameraButton.style.display = 'inline-block';
      this.uploadFileButton.style.display = 'inline-block';
      this.takePictureButton.style.display = 'none';
      this.clearPhotoButton.style.display = 'inline-block';
    };
    reader.readAsDataURL(file);
    this.photoFile = file;
  }

  _resetPhotoInput() {
    if (!this.photoInput || !this.photoPreview || !this.cameraPreview || !this.photoCanvas || !this.startCameraButton || !this.uploadFileButton || !this.takePictureButton || !this.clearPhotoButton) {
      console.error('Error: One or more photo input elements not found for reset.');
      return;
    }
    if (this.cameraStream) {
      CameraHelper.stopCamera(this.cameraStream);
      this.cameraStream = null;
    }
    this.photoFile = null;
    this.photoInput.value = '';
    this.photoPreview.src = '';
    this.photoPreview.style.display = 'none';
    this.cameraPreview.style.display = 'none';
    this.photoCanvas.style.display = 'none';
    this.startCameraButton.style.display = 'inline-block';
    this.uploadFileButton.style.display = 'inline-block';
    this.takePictureButton.style.display = 'none';
    this.clearPhotoButton.style.display = 'none';
  }

  showLoading() {
    const submitButton = this.form.querySelector('.add-story-submit-button');
    if (!submitButton) {
      console.error('Error: Submit button not found for showLoading.');
      return;
    }
    submitButton.setAttribute('disabled', 'true');
    submitButton.innerHTML = `
            <span class="loading-spinner"></span> Mengunggah...
        `;
  }

  hideLoading() {
    const submitButton = this.form.querySelector('.add-story-submit-button');
    if (!submitButton) {
      console.error('Error: Submit button not found for hideLoading.');
      return;
    }
    submitButton.removeAttribute('disabled');
    submitButton.innerHTML = `
            Unggah Cerita <i class="fas fa-paper-plane"></i>
        `;
  }

  displayError(message) {
    if (!this.messageElement) {
      console.error('Error: Message element not found for displaying error.');
      return;
    }
    this.messageElement.textContent = `Error: ${message}`;
    this.messageElement.classList.add('error-message');
    this.messageElement.focus();
  }

  getAddStoryPageElement() {
    return this.element;
  }

  beforeUnmount() {
    if (this.cameraStream) {
      CameraHelper.stopCamera(this.cameraStream);
      this.cameraStream = null;
    }
    if (this.map) {
      this.map.remove(); // Clean up Leaflet map instance
      this.map = null;
    }
  }
}

export default AddStory;
