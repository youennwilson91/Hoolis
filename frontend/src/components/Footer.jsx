import React from 'react';
import './Footer.scss';

const Footer = () => {
  const handleDownload = (filename) => {
    const link = document.createElement('a');
    link.href = `/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <span 
          className="footer-link" 
          onClick={() => handleDownload('CGU_MAISON_HOOLIS_GROUP.pdf')}
        >
          CGU
        </span>
        <span className="footer-separator">|</span>
        <span 
          className="footer-link" 
          onClick={() => handleDownload('CGV_MAISON_HOOLIS_GROUP.pdf')}
        >
          CGV
        </span>
        <span className="footer-separator">|</span>
        <span 
          className="footer-link" 
          onClick={() => handleDownload('Mentions_Legales_MAISON_HOOLIS_GROUP.pdf')}
        >
          Mentions légales
        </span>
        <span className="footer-separator">|</span>
        <span 
          className="footer-link" 
          onClick={() => handleDownload('POLITIQUE_RETOURS.pdf')}
        >
          Politique de retours
        </span>
      </div>
    </footer>
  );
};

export default Footer;