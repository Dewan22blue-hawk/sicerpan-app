import Router from '../utils/Router';

class NotFound {
  render() {
    const element = document.createElement('div');
    element.className = 'not-found-page';
    element.innerHTML = `
            <div class="not-found-content">
                <i class="fas fa-exclamation-triangle fa-5x"></i>
                <h2>404 - Halaman Tidak Ditemukan</h2>
                <p>Maaf, halaman yang Anda cari tidak ada.</p>
                <button onclick="window.history.back()" class="primary-button" aria-label="Kembali ke halaman sebelumnya">
                    <i class="fas fa-arrow-left"></i> Kembali
                </button>
                <button onclick="location.hash = '#/stories'" class="secondary-button" aria-label="Pergi ke halaman beranda">
                    <i class="fas fa-home"></i> Beranda
                </button>
            </div>
        `;
    return element;
  }

  afterRender() {}
}

export default NotFound;
