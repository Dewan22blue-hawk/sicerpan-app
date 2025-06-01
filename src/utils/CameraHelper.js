class CameraHelper {
  /**
   * Starts the camera stream and displays it in a video element.
   * @param {HTMLVideoElement} videoElement The video element to display the stream.
   * @returns {Promise<MediaStream>} A promise that resolves with the MediaStream object.
   */
  static async startCamera(videoElement) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoElement.srcObject = stream;
      videoElement.play();
      return stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      throw new Error('Gagal mengakses kamera. Pastikan browser memiliki izin.');
    }
  }

  /**
   * Takes a picture from the video stream and returns it as a Blob.
   * @param {HTMLVideoElement} videoElement The video element currently displaying the stream.
   * @param {HTMLCanvasElement} canvasElement The canvas element to draw the image on.
   * @returns {File} A File object representing the captured image.
   */
  static takePicture(videoElement, canvasElement) {
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    const context = canvasElement.getContext('2d');
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    // Convert canvas to Blob (PNG format)
    return new Promise((resolve) => {
      canvasElement.toBlob((blob) => {
        const timestamp = new Date().getTime();
        const file = new File([blob], `story_photo_${timestamp}.png`, { type: 'image/png' });
        resolve(file);
      }, 'image/png');
    });
  }

  /**
   * Stops the camera stream.
   * @param {MediaStream} stream The MediaStream object to stop.
   */
  static stopCamera(stream) {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      console.log('Camera stream stopped.');
    }
  }
}

export default CameraHelper;
