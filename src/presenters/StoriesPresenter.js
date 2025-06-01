import StoryAPI from '../api/story-api';

class StoriesPresenter {
  constructor(view) {
    this.view = view;
  }

  async fetchStories() {
    this.view.showLoading();
    try {
      const response = await StoryAPI.getAllStories();

      if (response.error) {
        this.view.displayError(response.message);
      } else {
        if (response.listStory && Array.isArray(response.listStory)) {
          this.view.displayStories(response.listStory);
        } else {
          this.view.displayError('Data cerita tidak valid atau tidak ditemukan.');
        }
      }
    } catch (error) {
      this.view.displayError(`Gagal memuat cerita. ${error.message || 'Silakan coba lagi.'}`);
    }
  }

  async fetchStoryDetail(id) {
    // console.log('Raw Story ID:', id);
    if (id && typeof id === 'object' && id.id) {
      id = id.id;
    }

    if (!id || typeof id !== 'string') {
      // console.error('Invalid story ID:', id);
      this.view.displayError('ID cerita tidak valid.');
      return;
    }

    // console.log('Fetching story detail for ID:', id);
    const response = await StoryAPI.getStoryDetail(id);
    // console.log('API Response:', response);

    try {
      if (response.error) {
        const errorMessage = typeof response.message === 'string' ? response.message : JSON.stringify(response.message || response);
        // console.error('StoriesPresenter Error:', errorMessage);
        this.view.displayError(errorMessage);
      } else if (response.story) {
        this.view.displayStoryDetail(response.story);
      } else {
        // console.warn('Invalid response:', response);
        this.view.displayError('Detail cerita tidak valid atau tidak ditemukan.');
      }
    } catch (error) {
      // console.error(`Error fetching story detail for ${id}:`, error);
      this.view.displayError(`Gagal memuat detail cerita. ${error.message || 'Terjadi kesalahan tidak dikenal.'}`);
    }
  }
}

export default StoriesPresenter;
