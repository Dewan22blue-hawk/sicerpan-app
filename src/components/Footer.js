class Footer {
  render() {
    const footer = document.createElement('footer');
    footer.className = 'app-footer';
    footer.innerHTML = `
            <p>&copy; ${new Date().getFullYear()} Dicoding Story App. Denny Irawan❤️All rights reserved.</p>
            <div class="social-links">
                <a href="https://github.com/Dewan22blue-hawk" target="_blank" rel="noopener noreferrer" aria-label="Kunjungi Github Dicoding Academy"><i class="fab fa-github"></i></a>
                <a href="https://www.linkedin.com/in/denny-irawan-a12480305/" target="_blank" rel="noopener noreferrer" aria-label="Kunjungi LinkedIn Dicoding Academy"><i class="fab fa-linkedin"></i></a>
            </div>
        `;
    return footer;
  }
}

export default Footer;
