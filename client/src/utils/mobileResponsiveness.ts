/**
 * Mobile responsiveness testing and utilities
 */

export interface BreakpointConfig {
  name: string;
  width: number;
  height: number;
  description: string;
}

export const BREAKPOINTS: BreakpointConfig[] = [
  { name: 'mobile-small', width: 320, height: 568, description: 'iPhone 5/SE' },
  { name: 'mobile-medium', width: 375, height: 667, description: 'iPhone 6/7/8' },
  { name: 'mobile-large', width: 414, height: 896, description: 'iPhone XR/11' },
  { name: 'tablet-portrait', width: 768, height: 1024, description: 'iPad Portrait' },
  { name: 'tablet-landscape', width: 1024, height: 768, description: 'iPad Landscape' },
  { name: 'desktop-small', width: 1280, height: 720, description: 'Small Desktop' },
  { name: 'desktop-large', width: 1920, height: 1080, description: 'Large Desktop' }
];

/**
 * Test element responsiveness across breakpoints
 */
export function testElementResponsiveness(selector: string): Promise<ResponsivenessResult[]> {
  return Promise.all(
    BREAKPOINTS.map(async (breakpoint) => {
      // Simulate viewport change
      document.documentElement.style.width = `${breakpoint.width}px`;
      document.documentElement.style.height = `${breakpoint.height}px`;
      
      // Force reflow
      document.body.offsetHeight;
      
      const element = document.querySelector(selector);
      if (!element) {
        return {
          breakpoint: breakpoint.name,
          isVisible: false,
          isAccessible: false,
          issues: ['Element not found']
        };
      }

      const rect = element.getBoundingClientRect();
      const styles = window.getComputedStyle(element);
      
      return {
        breakpoint: breakpoint.name,
        isVisible: rect.width > 0 && rect.height > 0,
        isAccessible: !styles.display.includes('none'),
        isTouchFriendly: rect.height >= 44, // Minimum touch target size
        hasOverflow: element.scrollWidth > element.clientWidth,
        issues: []
      };
    })
  );
}

export interface ResponsivenessResult {
  breakpoint: string;
  isVisible: boolean;
  isAccessible: boolean;
  isTouchFriendly?: boolean;
  hasOverflow?: boolean;
  issues: string[];
}

/**
 * Generate responsive CSS classes based on content
 */
export function generateResponsiveClasses(baseClasses: string): string {
  const responsive = {
    // Mobile-first approach
    base: baseClasses,
    sm: 'sm:text-base sm:px-4',
    md: 'md:text-lg md:px-6',
    lg: 'lg:text-xl lg:px-8',
    xl: 'xl:text-2xl xl:px-10'
  };
  
  return Object.values(responsive).join(' ');
}

/**
 * Check if device is mobile
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768;
}

/**
 * Optimize touch targets for mobile
 */
export function optimizeTouchTargets(): void {
  const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
  
  interactiveElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    if (rect.height < 44) {
      (element as HTMLElement).style.minHeight = '44px';
    }
    if (rect.width < 44) {
      (element as HTMLElement).style.minWidth = '44px';
    }
  });
}

/**
 * Add responsive image loading
 */
export function setupResponsiveImages(): void {
  const images = document.querySelectorAll('img[data-responsive]');
  
  images.forEach(img => {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const containerWidth = img.parentElement?.clientWidth || window.innerWidth;
    const optimalWidth = Math.ceil(containerWidth * devicePixelRatio);
    
    // Update src for optimal resolution
    const baseSrc = img.getAttribute('data-src') || img.getAttribute('src');
    if (baseSrc) {
      img.setAttribute('src', `${baseSrc}?w=${optimalWidth}&q=80`);
    }
  });
}