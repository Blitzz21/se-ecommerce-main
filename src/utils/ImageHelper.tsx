import React, { useEffect, useState } from 'react';

// Import GPU images to make them available in the bundle
import rtx4090 from '../assets/gpu/rtx-4090.png';
import rtx4080 from '../assets/gpu/rtx-4080.png';
import rtx4080super from '../assets/gpu/rtx-4080-super.png';
import rtx4070ti from '../assets/gpu/rtx-4070-ti.png';
import rtx6000 from '../assets/gpu/rtx-6000.png';
import rtx6000ada from '../assets/gpu/rtx-6000-ada.png';
import rtx5000 from '../assets/gpu/rtx-5000.png';
import a100 from '../assets/gpu/a100.png';
import h100 from '../assets/gpu/h100.png';
import cmp170hx from '../assets/gpu/cmp-170hx.png';
import cmp50hx from '../assets/gpu/cmp-50hx.png';
import rx7900xtx from '../assets/gpu/rx-7900-xtx.png';
import rx7800xt from '../assets/gpu/rx-7800-xt.png';
import rx7600 from '../assets/gpu/rx-7600.png';
import radeonProW7900 from '../assets/gpu/radeon-pro-w7900.png';
import w7900x from '../assets/gpu/w7900x.png';
import mi250x from '../assets/gpu/mi250x.png';
import arcA770 from '../assets/gpu/arc-a770.png';
import intelArcA770 from '../assets/gpu/intel-arc-a770.png';

// Map the paths to the imported images
const imageMap: Record<string, string> = {
  '../assets/gpu/rtx-4090.png': rtx4090,
  '../assets/gpu/rtx-4080.png': rtx4080,
  '../assets/gpu/rtx-4080-super.png': rtx4080super,
  '../assets/gpu/rtx-4070-ti.png': rtx4070ti,
  '../assets/gpu/rtx-6000.png': rtx6000,
  '../assets/gpu/rtx-6000-ada.png': rtx6000ada,
  '../assets/gpu/rtx-5000.png': rtx5000,
  '../assets/gpu/a100.png': a100,
  '../assets/gpu/h100.png': h100,
  '../assets/gpu/cmp-170hx.png': cmp170hx,
  '../assets/gpu/cmp-50hx.png': cmp50hx,
  '../assets/gpu/rx-7900-xtx.png': rx7900xtx,
  '../assets/gpu/rx-7800-xt.png': rx7800xt,
  '../assets/gpu/rx-7600.png': rx7600,
  '../assets/gpu/radeon-pro-w7900.png': radeonProW7900,
  '../assets/gpu/w7900x.png': w7900x,
  '../assets/gpu/mi250x.png': mi250x,
  '../assets/gpu/arc-a770.png': arcA770,
  '../assets/gpu/intel-arc-a770.png': intelArcA770,
  '../assets/gpu/placeholder.png': rtx4090, // Use rtx4090 as placeholder fallback
};

// Also map without the ../ prefix for database paths
const absolutePathMap: Record<string, string> = {
  '/assets/gpu/rtx-4090.png': rtx4090,
  '/src/assets/gpu/rtx-4090.png': rtx4090,
  'assets/gpu/rtx-4090.png': rtx4090,
  'assets/gpu/rtx-4080.png': rtx4080,
  'assets/gpu/rtx-4080-super.png': rtx4080super,
  'assets/gpu/rtx-4070-ti.png': rtx4070ti,
  'assets/gpu/rtx-6000.png': rtx6000,
  'assets/gpu/rtx-6000-ada.png': rtx6000ada,
  'assets/gpu/rtx-5000.png': rtx5000,
  'assets/gpu/a100.png': a100,
  'assets/gpu/h100.png': h100,
  'assets/gpu/cmp-170hx.png': cmp170hx,
  'assets/gpu/cmp-50hx.png': cmp50hx,
  'assets/gpu/rx-7900-xtx.png': rx7900xtx,
  'assets/gpu/rx-7800-xt.png': rx7800xt,
  'assets/gpu/rx-7600.png': rx7600,
  'assets/gpu/radeon-pro-w7900.png': radeonProW7900,
  'assets/gpu/w7900x.png': w7900x,
  'assets/gpu/mi250x.png': mi250x,
  'assets/gpu/arc-a770.png': arcA770,
  'assets/gpu/intel-arc-a770.png': intelArcA770,
  'assets/gpu/placeholder.png': rtx4090, // Use rtx4090 as placeholder fallback
};

// Also map by filename for fallback
const filenameMap: Record<string, string> = {
  'rtx-4090.png': rtx4090,
  'rtx-4080.png': rtx4080,
  'rtx-4080-super.png': rtx4080super,
  'rtx-4070-ti.png': rtx4070ti,
  'rtx-6000.png': rtx6000,
  'rtx-6000-ada.png': rtx6000ada,
  'rtx-5000.png': rtx5000,
  'a100.png': a100,
  'h100.png': h100,
  'cmp-170hx.png': cmp170hx,
  'cmp-50hx.png': cmp50hx,
  'rx-7900-xtx.png': rx7900xtx,
  'rx-7800-xt.png': rx7800xt,
  'rx-7600.png': rx7600,
  'radeon-pro-w7900.png': radeonProW7900,
  'w7900x.png': w7900x,
  'mi250x.png': mi250x,
  'arc-a770.png': arcA770,
  'intel-arc-a770.png': intelArcA770,
  'placeholder.png': rtx4090, // Use rtx4090 as placeholder fallback
};

interface GpuImageProps {
  src: string;
  alt: string;
  className?: string;
}

/**
 * Normalizes image path to handle different formats
 * @param src The original source path
 * @returns A normalized path to check against our maps
 */
const normalizeImagePath = (src: string): string => {
  if (!src) {
    console.warn('Empty image source provided to normalizeImagePath');
    return src;
  }
  
  console.log('ImageHelper: Normalizing path for:', src);
  
  // Already normalized
  if (src in imageMap) {
    console.log('ImageHelper: Path already in imageMap');
    return src;
  }
  
  // Check if it's a filename only
  const filename = src.split('/').pop();
  if (filename && filename in filenameMap) {
    console.log('ImageHelper: Found filename match:', filename);
    return filename;
  }
  
  // Check if it has the assets/gpu part without the ../
  if (src in absolutePathMap) {
    console.log('ImageHelper: Found in absolutePathMap');
    return src;
  }
  
  // Check if it has the assets/gpu part
  if (src.includes('assets/gpu/')) {
    const relativePath = '../' + src.substring(src.indexOf('assets/'));
    console.log('ImageHelper: Converted to relative path:', relativePath);
    return relativePath;
  }
  
  console.warn('ImageHelper: Could not normalize path:', src);
  return src;
};

/**
 * Resolves the image source from various formats to the actual imported module
 * @param src The source path to resolve
 * @returns The resolved path to the actual image
 */
export const resolveGpuImagePath = (src: string): string => {
  if (!src) {
    console.warn('Empty image source provided to resolveGpuImagePath');
    return src;
  }
  
  console.log('ImageHelper: Resolving path for:', src);
  
  const normalized = normalizeImagePath(src);
  console.log('ImageHelper: Normalized path:', normalized);
  
  // Check in the main map
  if (normalized in imageMap) {
    console.log('ImageHelper: Found in imageMap');
    return imageMap[normalized];
  }
  
  // Check in the absolute path map
  if (normalized in absolutePathMap) {
    console.log('ImageHelper: Found in absolutePathMap');
    return absolutePathMap[normalized];
  }
  
  // Check in the filename map
  const filename = normalized.split('/').pop();
  if (filename && filename in filenameMap) {
    console.log('ImageHelper: Found in filenameMap with key:', filename);
    return filenameMap[filename];
  }
  
  // If all else fails, return the original
  console.warn('ImageHelper: Could not resolve path to a valid image module:', src);
  return src;
};

/**
 * Renders a GPU image with the correct path resolution
 * This component will look in the imageMap for matching paths and use the imported image
 * If the path is not found, it will attempt to use the path directly
 */
export const GpuImage: React.FC<GpuImageProps> = ({ src, alt, className }) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  
  useEffect(() => {
    // If src is undefined or empty, use a default based on alt text
    if (!src) {
      console.warn('Empty image source provided to GpuImage component');
      if (alt?.toLowerCase().includes('nvidia')) {
        setImageSrc(rtx4090);
      } else if (alt?.toLowerCase().includes('amd')) {
        setImageSrc(rx7900xtx);
      } else if (alt?.toLowerCase().includes('intel')) {
        setImageSrc(arcA770);
      } else {
        setImageSrc(rtx4090); // Default fallback
      }
      return;
    }
    
    // Resolve the image path
    const resolved = resolveGpuImagePath(src);
    setImageSrc(resolved);
    setError(false);
  }, [src, alt]);
  
  const handleError = () => {
    if (!error) {
      console.error(`Failed to load image: ${src} -> ${imageSrc}`);
      setError(true);
      
      // Try a default image based on the product name from the alt text
      if (alt?.toLowerCase().includes('nvidia')) {
        setImageSrc(rtx4090);
      } else if (alt?.toLowerCase().includes('amd')) {
        setImageSrc(rx7900xtx);
      } else if (alt?.toLowerCase().includes('intel')) {
        setImageSrc(arcA770);
      } else {
        // Default fallback
        setImageSrc(rtx4090);
      }
    }
  };
  
  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      className={className} 
      onError={handleError} 
    />
  );
};

export default GpuImage; 