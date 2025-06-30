/**
 * Comprehensive Route Modernization Script
 * Systematically applies modern design system across all Client V2 pages and routes
 */

import * as fs from 'fs';
import * as path from 'path';

interface RouteUpdate {
  filePath: string;
  transformations: ((content: string) => string)[];
}

// Add MainLayout import to any file that doesn't have it
const addMainLayoutImport = (content: string): string => {
  if (content.includes('import MainLayout')) return content;
  
  const importRegex = /^(import.*?from.*?;)/gm;
  const lastImportMatch = Array.from(content.matchAll(importRegex)).pop();
  
  if (lastImportMatch) {
    const insertIndex = lastImportMatch.index! + lastImportMatch[0].length;
    return content.slice(0, insertIndex) + 
           '\nimport MainLayout from \'@/components/layout/MainLayout\';' + 
           content.slice(insertIndex);
  }
  
  return content;
};

// Wrap component return with MainLayout
const wrapWithMainLayout = (content: string): string => {
  // Find return statement in component
  const returnRegex = /return\s*\(\s*<div className="min-h-screen[^>]*>/g;
  
  return content.replace(returnRegex, (match) => {
    return match.replace('<div className="min-h-screen', '<MainLayout>\n      <div className="bg-background min-h-screen');
  });
};

// Replace legacy classes with modern design tokens
const modernizeClasses = (content: string): string => {
  const classReplacements = {
    // Background and layout
    'bg-gray-50': 'bg-background',
    'bg-white': 'bg-card',
    'text-gray-900': 'text-foreground',
    'text-gray-600': 'text-foreground/80',
    'text-gray-500': 'text-foreground/60',
    
    // Typography
    'text-3xl font-bold': 'heading-modern-h1',
    'text-2xl font-bold': 'heading-modern-h2',
    'text-xl font-bold': 'heading-modern-h3',
    'text-lg font-semibold': 'heading-modern-h4',
    
    // Spacing
    'space-y-6': 'space-y-modern-lg',
    'space-y-4': 'space-y-modern-md',
    'mb-8': 'mb-modern-xl',
    'mt-8': 'mt-modern-xl',
    'p-6': 'p-modern-lg',
    'p-8': 'p-modern-xl',
    
    // Colors
    'bg-blue-600': 'bg-primary',
    'hover:bg-blue-700': 'hover:bg-primary/90',
    'text-blue-600': 'text-primary',
    'border-blue-600': 'border-primary',
    
    // Cards and components
    'rounded-lg': 'rounded-2xl',
    'shadow-md': 'shadow-lg',
    
    // Progress bars
    'bg-gray-200': 'bg-muted',
    'h-2 rounded-full': 'h-2 rounded-full transition-all duration-300',
  };
  
  let updatedContent = content;
  
  Object.entries(classReplacements).forEach(([oldClass, newClass]) => {
    const regex = new RegExp(`\\b${oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    updatedContent = updatedContent.replace(regex, newClass);
  });
  
  return updatedContent;
};

// Add proper MainLayout closing tag
const addMainLayoutClosing = (content: string): string => {
  // Find the last closing div and replace with MainLayout closing
  const lastDivRegex = /(\s*<\/div>\s*<\/div>\s*)\);(\s*})/;
  
  return content.replace(lastDivRegex, '$1\n    </MainLayout>\n  );$2');
};

// Routes to modernize
const routesToModernize: RouteUpdate[] = [
  {
    filePath: 'client/src/routes/Step4_FinancialInfo.tsx',
    transformations: [addMainLayoutImport, wrapWithMainLayout, modernizeClasses, addMainLayoutClosing]
  },
  {
    filePath: 'client/src/routes/Step5_DocumentUpload.tsx',
    transformations: [addMainLayoutImport, wrapWithMainLayout, modernizeClasses, addMainLayoutClosing]
  },
  {
    filePath: 'client/src/routes/Step6_Signature.tsx',
    transformations: [addMainLayoutImport, wrapWithMainLayout, modernizeClasses, addMainLayoutClosing]
  },
  {
    filePath: 'client/src/pages/Dashboard.tsx',
    transformations: [addMainLayoutImport, wrapWithMainLayout, modernizeClasses, addMainLayoutClosing]
  },
  {
    filePath: 'client/src/pages/Register.tsx',
    transformations: [modernizeClasses] // Already has MainLayout
  }
];

// Execute modernization
export const modernizeAllRoutes = () => {
  console.log('🚀 Starting comprehensive route modernization...');
  
  routesToModernize.forEach(({ filePath, transformations }) => {
    try {
      const fullPath = path.resolve(filePath);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return;
      }
      
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Apply all transformations
      transformations.forEach(transform => {
        content = transform(content);
      });
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Modernized: ${filePath}`);
      
    } catch (error) {
      console.error(`❌ Error modernizing ${filePath}:`, error);
    }
  });
  
  console.log('🎉 Route modernization complete!');
};

// Run if called directly
if (require.main === module) {
  modernizeAllRoutes();
}