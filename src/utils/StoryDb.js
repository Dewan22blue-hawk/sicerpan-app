import { openDB } from 'idb';

const DATABASE_NAME = 'story-app-db';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'stories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(db) {
    const objectStore = db.createObjectStore(OBJECT_STORE_NAME, {
      keyPath: 'id',
    });
  },
});

const StoryDb = {
  /**
   * Mengambil satu cerita berdasarkan ID dari IndexedDB.
   * @param {string} id ID cerita.
   * @returns {Promise<Object|undefined>} Objek cerita atau undefined jika tidak ditemukan.
   */
  async getStory(id) {
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },

  /**
   * Mengambil semua cerita dari IndexedDB.
   * @returns {Promise<Array<Object>>} Array berisi semua objek cerita.
   */
  async getAllStories() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },

  /**
   * Menyimpan atau memperbarui cerita di IndexedDB.
   * @param {Object} story Objek cerita yang akan disimpan.
   * @returns {Promise<string>} Kunci utama (ID cerita) yang disimpan.
   */
  async putStory(story) {
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },

  /**
   * Menghapus cerita berdasarkan ID dari IndexedDB.
   * @param {string} id ID cerita yang akan dihapus.
   * @returns {Promise<void>}
   */
  async deleteStory(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },
};

export default StoryDb;
