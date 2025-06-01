class Spinner {
  render() {
    const spinnerContainer = document.createElement('div');
    spinnerContainer.className = 'spinner-container';
    spinnerContainer.innerHTML = `
            <div class="spinner"></div>
            <p class="spinner-text">Loading...</p>
        `;
    return spinnerContainer;
  }
}

export default Spinner;
