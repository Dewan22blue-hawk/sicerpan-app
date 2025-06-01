import StoryAPI from '../scripts/data/story-api';

class AddStoryPresenter {
  constructor(view) {
    this.view = view;
  }

  async addStory({ description, photo, lat, lon }) {
    try {
      const response = await StoryAPI.addStory({ description, photo, lat, lon });
      if (response.error) {
        return { error: true, message: response.message };
      }
      return { error: false, message: response.message };
    } catch (error) {
      // console.error('Error adding story:', error);
      return { error: true, message: 'Gagal mengunggah cerita. Silakan coba lagi.' };
    }
  }
}

export default AddStoryPresenter;
