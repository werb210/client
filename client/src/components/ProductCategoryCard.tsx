import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { ProductCategory } from '@/hooks/useProductCategories';
import { formatCategoryName } from '@/lib/industryInsights';

interface ProductCategoryCardProps {
  category: ProductCategory;
  index: number;
  isSelected: boolean;
  onSelect: (category: string) => void;
}

export function ProductCategoryCard({ category, index, isSelected, onSelect }: ProductCategoryCardProps) {
  const categoryName = formatCategoryName(category.category);
  const matchScore = Math.max(95 - index * 5, 60); // Decreasing match scores
  
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-lg' 
          : 'hover:shadow-md hover:border-gray-300'
      }`}
      onClick={() => onSelect(isSelected ? '' : category.category)}
    >
      <CardContent className="p-4">
        {/* Header with title and match score */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-semibold text-lg flex items-center">
              {categoryName}
              {isSelected && <CheckCircle className="w-5 h-5 ml-2 text-blue-600" />}
            </h4>
            <p className="text-gray-600">
              {category.count} products available ({category.percentage}%)
            </p>
          </div>
          <div className="text-right">
            <div className={`px-2 py-1 rounded text-sm font-medium ${
              index === 0 ? 'bg-green-100 text-green-800' : 
              index === 1 ? 'bg-blue-100 text-blue-800' : 
              'bg-yellow-100 text-yellow-800'
            }`}>
              {matchScore}% Match
            </div>
            {index === 0 && <div className="text-xs text-blue-600 mt-1">Best Match</div>}
          </div>
        </div>

        {/* Product statistics grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3 text-sm">
          <div>
            <span className="text-gray-500">Available Products:</span>
            <div className="font-medium">{category.count} options</div>
          </div>
          <div>
            <span className="text-gray-500">Market Share:</span>
            <div className="font-medium">{category.percentage}% of portfolio</div>
          </div>
          <div>
            <span className="text-gray-500">Category:</span>
            <div className="font-medium">{categoryName}</div>
          </div>
        </div>

        {/* Selected state confirmation */}
        {isSelected && (
          <div className="mt-3 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              Click "Continue" to see specific {categoryName.toLowerCase()} products 
              and detailed terms from our {category.count} available lenders.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}