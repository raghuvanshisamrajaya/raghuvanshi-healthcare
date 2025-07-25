'use client';

import { useState, useEffect } from 'react';

// Image validation and fallback utility
export const getValidImageUrl = (imageUrl: string | undefined, category: string = ''): string => {
  // If no image provided, return category-based default
  if (!imageUrl || imageUrl.trim() === '') {
    return getCategoryImage(category);
  }

  // If it's already a local image path, return it
  if (imageUrl.startsWith('/images/') || imageUrl.startsWith('./') || imageUrl.startsWith('../')) {
    return imageUrl;
  }

  // Check if it's just a filename (for local images)
  if (!imageUrl.includes('/') && !imageUrl.startsWith('http')) {
    // It's just a filename, treat as local image
    return `/images/products/local/${imageUrl}`;
  }

  // For external URLs, be more permissive - let the component handle failures
  try {
    new URL(imageUrl); // Just check if it's a valid URL format
    return imageUrl; // Return the URL and let ProductImage component handle loading failures
  } catch {
    // If it's not a valid URL format, treat as local filename
    return `/images/products/local/${imageUrl}`;
  }
};

export const getCategoryImage = (category: string = ''): string => {
  const cat = category.toLowerCase();
  
  if (cat.includes('medicine') || cat.includes('drug') || cat.includes('tablet') || cat.includes('capsule')) {
    return '/images/products/medicine-placeholder.svg';
  }
  
  if (cat.includes('equipment') || cat.includes('device') || cat.includes('monitor') || cat.includes('thermometer')) {
    return '/images/products/equipment-placeholder.svg';
  }
  
  return '/images/products/default-product.svg';
};

export const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    
    // Check if it's a valid HTTP/HTTPS URL
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // More lenient validation - allow most URLs that could be images
    const pathname = urlObj.pathname.toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.avif'];
    
    // Accept if:
    // 1. Has image extension
    // 2. Contains 'image' in path
    // 3. Is from known image hosting services
    // 4. Has no extension but looks like it could be an image API
    return validExtensions.some(ext => pathname.endsWith(ext)) || 
           pathname.includes('image') || 
           pathname.includes('photo') ||
           pathname.includes('pic') ||
           urlObj.hostname.includes('imgur') ||
           urlObj.hostname.includes('cloudinary') ||
           urlObj.hostname.includes('unsplash') ||
           urlObj.hostname.includes('pixabay') ||
           urlObj.hostname.includes('pexels') ||
           urlObj.hostname.includes('freepik') ||
           urlObj.hostname.includes('shutterstock') ||
           urlObj.hostname.includes('amazonaws') ||
           urlObj.hostname.includes('googleusercontent') ||
           urlObj.hostname.includes('cdn') ||
           // If it doesn't have a file extension, assume it might be a dynamic image API
           !pathname.includes('.');
           
  } catch {
    return false;
  }
};

// Image component with better error handling
export const ProductImage = ({ 
  src, 
  alt, 
  category = '', 
  className = '',
  onImageError
}: {
  src?: string;
  alt: string;
  category?: string;
  className?: string;
  onImageError?: () => void;
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    // Always try the original source first if provided
    if (src && src.trim() !== '') {
      let imagePath = src;
      
      // Handle different image source types:
      if (src.startsWith('data:image/')) {
        // Base64 image data
        imagePath = src;
      } else if (!src.includes('/') && !src.startsWith('http')) {
        // Just a filename, convert to local path
        imagePath = `/images/products/local/${src}`;
      } else {
        // URL or path as-is
        imagePath = src;
      }
      
      setImageSrc(imagePath);
      setImageError(false);
    } else {
      // Only use fallback if no source provided
      const fallback = getCategoryImage(category);
      setImageSrc(fallback);
      setImageError(false);
    }
  }, [src, category]);

  const handleImageError = () => {
    if (!imageError && imageSrc !== getCategoryImage(category)) {
      setImageError(true);
      const fallbackSrc = getCategoryImage(category);
      setImageSrc(fallbackSrc);
      onImageError?.();
    }
  };

  if (imageError && imageSrc === getCategoryImage(category)) {
    // If even fallback fails, show placeholder
    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}>
        <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-xs text-gray-500">No Image</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleImageError}
      loading="lazy"
    />
  );
};
