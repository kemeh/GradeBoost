import React, { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
}

/**
 * Hook to dynamically update SEO meta tags on client-side route transitions
 */
export const useSEO = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  noIndex = false,
}: SEOProps) => {
  useEffect(() => {
    const baseTitle = 'Edulpha | AI-Powered Learning & GCE/Baccalauréat Exam Platform';
    const finalTitle = title ? `${title} | Edulpha` : baseTitle;
    document.title = finalTitle;

    // Helper to get or create a meta tag
    const setMetaTag = (attrName: 'name' | 'property', attrVal: string, contentVal: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentVal);
    };

    // Helper to get or create link tags (e.g., canonical)
    const setLinkTag = (relVal: string, hrefVal: string) => {
      let element = document.querySelector(`link[rel="${relVal}"]`) as HTMLLinkElement | null;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', relVal);
        document.head.appendChild(element);
      }
      element.setAttribute('href', hrefVal);
    };

    const defaultDesc =
      'Edulpha provides official GCE O/A Level and French Sub-system Baccalauréat past papers, interactive Gemini AI drills, and institutional partner portals.';
    const finalDesc = description || defaultDesc;
    const defaultKeywords = 'Edulpha, GCE Ordinary Level, GCE Advanced Level, Baccalauréat, Probatoire, Cameroon Education, Past Papers, AI Tutor, MINESEC';

    // Standard meta
    setMetaTag('name', 'description', finalDesc);
    setMetaTag('name', 'keywords', keywords || defaultKeywords);
    setMetaTag('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');

    // Open Graph / Facebook
    setMetaTag('property', 'og:title', finalTitle);
    setMetaTag('property', 'og:description', finalDesc);
    setMetaTag('property', 'og:type', ogType);

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', finalTitle);
    setMetaTag('name', 'twitter:description', finalDesc);

    // Canonical & OG URL
    const currentUrl = canonicalUrl || window.location.href;
    setLinkTag('canonical', currentUrl);
    setMetaTag('property', 'og:url', currentUrl);

    if (ogImage) {
      setMetaTag('property', 'og:image', ogImage);
      setMetaTag('name', 'twitter:image', ogImage);
    }
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, noIndex]);
};

export const SEO: React.FC<SEOProps> = (props) => {
  useSEO(props);
  return null;
};
