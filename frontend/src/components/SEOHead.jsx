import { useEffect } from 'react';

const SEOHead = ({ 
  title = "Hoolis - Vêtements et Maroquinerie de luxe", 
  description = "Découvrez notre collection exclusive de vêtements et maroquinerie, et montres de luxe.",
  keywords = "vêtements de luxe, maroquinerie de luxe, vêtements, maroquinerie, luxe, montres de luxe, horlogerie",
  image = "https://hoolis.com/crown.png", // Image couronne pour les réseaux sociaux
  url = "https://hoolis.com/",
  type = "website"
}) => {
  
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta tags
    const updateMetaTag = (property, content) => {
      let meta = document.querySelector(`meta[property="${property}"]`) || 
                 document.querySelector(`meta[name="${property}"]`);
      if (meta) {
        meta.setAttribute('content', content);
      }
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Open Graph
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', url);
    updateMetaTag('og:type', type);
    
    // Twitter
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:url', url);
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', url);
    }
    
  }, [title, description, keywords, image, url, type]);

  return null;
};

export default SEOHead; 