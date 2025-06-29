import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ApplicationForm } from '@/types/forms';
import { usePublicLenders, type LenderProduct } from '@/hooks/usePublicLenders';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, DollarSign, Clock, Building2, CheckCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const productSelectionSchema = z.object({
  selectedProductId: z.string().min(1, 'Please select a product'),
  selectedProductType: z.string().optional(),
  matchScore: z.number().optional(),
});

interface Step2Props {
  defaultValues?: Partial<ApplicationForm>;
  onSubmit: (data: Partial<ApplicationForm>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface ProductCardProps {
  product: LenderProduct;
  isSelected: boolean;
  onSelect: (productId: string) => void;
  matchScore?: number;
  userProfile: {
    fundingAmount: number;
    industry: string;
    headquarters: string;
  };
}

function ProductCard({ product, isSelected, onSelect, matchScore, userProfile }: ProductCardProps) {
  const isInRange = userProfile.fundingAmount >= product.minAmount && userProfile.fundingAmount <= product.maxAmount;
  const displayMatchScore = matchScore || calculateMatchScore(product, userProfile);

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected 
          ? "ring-2 ring-teal-600 border-teal-200 bg-teal-50 dark:bg-teal-900/20" 
          : "hover:border-gray-300"
      )}
      onClick={() => onSelect(product.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {product.productType}
              {displayMatchScore >= 85 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Recommended
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {product.lenderName}
            </p>
          </div>
          <div className="text-right">
            <div className={cn(
              "text-sm font-medium px-2 py-1 rounded",
              displayMatchScore >= 85 ? "bg-green-100 text-green-800" :
              displayMatchScore >= 70 ? "bg-yellow-100 text-yellow-800" :
              "bg-gray-100 text-gray-800"
            )}>
              {displayMatchScore}% match
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {product.description}
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Amount Range</p>
                <p className={cn(
                  "text-sm font-medium",
                  isInRange ? "text-green-600" : "text-gray-700"
                )}>
                  ${product.minAmount.toLocaleString()} - ${product.maxAmount.toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Interest Rate</p>
                <p className="text-sm font-medium">{product.interestRate}%</p>
              </div>
            </div>
          </div>

          {product.processingTime && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Processing time: {product.processingTime}
              </span>
            </div>
          )}

          {product.qualifications && product.qualifications.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.qualifications.slice(0, 3).map((qual, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {qual}
                </Badge>
              ))}
              {product.qualifications.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{product.qualifications.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {isSelected && (
            <div className="flex items-center gap-2 text-teal-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Selected for your application
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function calculateMatchScore(product: LenderProduct, userProfile: { fundingAmount: number; industry: string; headquarters: string }): number {
  let score = 60; // Base score

  // Amount range matching (30 points)
  if (userProfile.fundingAmount >= product.minAmount && userProfile.fundingAmount <= product.maxAmount) {
    score += 30;
  } else if (userProfile.fundingAmount < product.minAmount) {
    score += Math.max(0, 15 - ((product.minAmount - userProfile.fundingAmount) / product.minAmount * 15));
  }

  // Industry matching (10 points)
  if (product.industry && product.industry.toLowerCase().includes(userProfile.industry.toLowerCase())) {
    score += 10;
  }

  // Country/region matching (5 points)
  if (product.country && product.country === userProfile.headquarters) {
    score += 5;
  }

  return Math.min(100, Math.round(score));
}

export function Step2ProductSelection({ defaultValues, onSubmit, onNext, onPrevious }: Step2Props) {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const { data: products, isLoading, error } = usePublicLenders();
  
  const form = useForm({
    resolver: zodResolver(productSelectionSchema),
    defaultValues: {
      selectedProductId: defaultValues?.selectedProductId || '',
      selectedProductType: defaultValues?.selectedProductType || '',
      matchScore: defaultValues?.matchScore || 0,
    },
  });

  const userProfile = {
    fundingAmount: defaultValues?.fundingAmount || 0,
    industry: defaultValues?.industry || '',
    headquarters: defaultValues?.headquarters || 'US',
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    form.setValue('selectedProductId', productId);
    
    const selectedProduct = products?.find(p => p.id === productId);
    if (selectedProduct) {
      const matchScore = calculateMatchScore(selectedProduct, userProfile);
      form.setValue('selectedProductType', selectedProduct.productType);
      form.setValue('matchScore', matchScore);
    }
  };

  const handleSubmit = () => {
    const values = form.getValues();
    const selectedProduct = products?.find(p => p.id === values.selectedProductId);
    
    if (selectedProduct) {
      const formData = {
        selectedProductId: values.selectedProductId,
        selectedProductType: selectedProduct.productType,
        matchScore: calculateMatchScore(selectedProduct, userProfile),
      };
      onSubmit(formData);
      onNext();
    }
  };

  const sortedProducts = products?.sort((a, b) => {
    const scoreA = calculateMatchScore(a, userProfile);
    const scoreB = calculateMatchScore(b, userProfile);
    return scoreB - scoreA;
  });

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Unable to load lender products</h3>
                <p className="text-sm text-red-600 mt-1">
                  {error.message || 'Please check your connection and try again.'}
                </p>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={onPrevious}>
                Previous
              </Button>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Recommendations</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Based on your business profile, here are the best funding options for you
        </p>
      </div>

      {/* User Profile Summary */}
      <Card className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 border-teal-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Your Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-300">Funding Amount:</span>
              <span className="font-medium ml-2">${userProfile.fundingAmount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-300">Industry:</span>
              <span className="font-medium ml-2">{userProfile.industry}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-300">Location:</span>
              <span className="font-medium ml-2">{userProfile.headquarters}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name="selectedProductId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Available Funding Products</FormLabel>
                <FormControl>
                  <RadioGroup value={field.value} onValueChange={handleProductSelect}>
                    <div className="grid gap-4">
                      {isLoading ? (
                        Array.from({ length: 3 }, (_, i) => (
                          <Card key={i}>
                            <CardContent className="pt-6">
                              <div className="space-y-3">
                                <Skeleton className="h-6 w-1/3" />
                                <Skeleton className="h-4 w-full" />
                                <div className="grid grid-cols-2 gap-4">
                                  <Skeleton className="h-4 w-full" />
                                  <Skeleton className="h-4 w-full" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : sortedProducts && sortedProducts.length > 0 ? (
                        sortedProducts.map((product) => (
                          <div key={product.id} className="flex items-start gap-3">
                            <RadioGroupItem 
                              value={product.id} 
                              id={product.id}
                              className="mt-4" 
                            />
                            <div className="flex-1">
                              <ProductCard
                                product={product}
                                isSelected={selectedProductId === product.id}
                                onSelect={handleProductSelect}
                                userProfile={userProfile}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <Card>
                          <CardContent className="pt-6 text-center">
                            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 dark:text-gray-300">
                              No products are currently available. Please try again later.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between mt-8">
            <Button type="button" variant="outline" onClick={onPrevious}>
              Previous
            </Button>
            <Button 
              type="submit" 
              size="lg" 
              className="bg-teal-600 hover:bg-teal-700"
              disabled={!selectedProductId}
            >
              Continue with Selected Product
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}