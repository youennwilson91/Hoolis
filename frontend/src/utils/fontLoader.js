// Font loader utility
export const loadFont = () => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = '/champagne-limousines-bold.ttf';
  link.as = 'font';
  link.type = 'font/truetype';
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}; 