import { routerInstance } from '../utils/Router';

class StoryCard {
  constructor(story) {
    this.story = story;
  }

  render() {
    const card = document.createElement('article');
    card.className = 'story-card';
    card.setAttribute('tabindex', '0');

    const date = new Date(this.story.createdAt).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    card.innerHTML = `
      <img src="${this.story.photoUrl}" alt="Gambar cerita ${this.story.name} berjudul ${this.story.description ? this.story.description.substring(0, 50) : ''}..." loading="lazy">
      <div class="card-content">
        <h3 class="card-title">${this.story.name}</h3>
        <p class="card-description">${this.story.description ? this.story.description.substring(0, 100) : ''}${this.story.description && this.story.description.length > 100 ? '...' : ''}</p>
        <p class="card-date"><i class="far fa-calendar-alt"></i> ${date}</p>
        <div class="card-actions">
          <button class="detail-button" aria-label="Lihat detail cerita ${this.story.name}">Lihat Detail <i class="fas fa-arrow-right"></i></button>
        </div>
      </div>
    `;

    const detailButton = card.querySelector('.detail-button');
    if (detailButton) {
      detailButton.addEventListener('click', () => {
        try {
          routerInstance.navigate(`/stories/${this.story.id}`);
        } catch (error) {
          console.error('StoryCard Error: Error navigating to detail:', error);
        }
      });
    } else {
      console.error('StoryCard Error: Detail button not found for story ID:', this.story.id);
    }

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        try {
          routerInstance.navigate(`/stories/${this.story.id}`);
        } catch (error) {
          console.error('StoryCard Error: Error navigating to detail via keyboard:', error);
        }
      }
    });

    return card;
  }
}

export default StoryCard;
