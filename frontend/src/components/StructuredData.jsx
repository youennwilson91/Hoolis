import { useEffect } from 'react';

const StructuredData = ({ data }) => {
  useEffect(() => {
    if (!data) return;

    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[type="application/ld+json"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data]);

  return null;
};

// Predefined structured data schemas
export const createWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Hoolis",
  "description": "Découvrez notre collection exclusive de vetements et maroquinerie, et montres de luxe",
  "url": "https://hoolis.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://hoolis.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
});

export const createOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Hoolis",
  "description": "Boutique de luxe spécialisée en vêtements, maroquinerie et montres de prestige",
  "url": "https://hoolis.com",
  "logo": "https://hoolis.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+33-1-XX-XX-XX-XX",
    "contactType": "customer service",
    "availableLanguage": "French"
  },
  "sameAs": [
    "https://www.facebook.com/hoolis",
    "https://www.instagram.com/hoolis"
  ]
});

export const createProductSchema = (product) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.title || product.name,
  "description": product.description,
  "image": product.image || product.images?.[0]?.image,
  "brand": {
    "@type": "Brand",
    "name": "Hoolis"
  },
  "offers": {
    "@type": "Offer",
    "price": product.price,
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Hoolis"
    }
  }
});

export default StructuredData; 