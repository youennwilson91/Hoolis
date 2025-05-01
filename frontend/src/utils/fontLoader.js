// Font loader utility
const WebFontLoader = {
  loadFonts: () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Agdasima:wght@400;600;700&display=swap';
    document.head.appendChild(link);
    
    // Force a redraw on fonts loaded
    link.onload = () => {
      document.body.style.visibility = 'hidden';
      setTimeout(() => {
        document.body.style.visibility = '';
      }, 50);
    };
  }
};

export default WebFontLoader; 