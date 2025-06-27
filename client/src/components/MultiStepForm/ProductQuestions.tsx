import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApplication } from '@/context/ApplicationContext';

const productQuestionsSchema = z.object({
  creditScore: z.string().min(1, 'Credit score range is required'),
  businessAge: z.string().min(1, 'Business age is required'),
  collateral: z.string().min(1, 'Collateral information is required'),
  monthlyRevenue: z.number().min(1, 'Monthly revenue is required'),
  existingDebt: z.string().min(1, 'Existing debt information is required'),
  timeInBusiness: z.number().min(1, 'Time in business is required'),
});

type ProductQuestionsData = z.infer<typeof productQuestionsSchema>;

interface ProductQuestionsProps {
  onNext: () => void;
  onBack: () => void;
}

export function ProductQuestions({ onNext, onBack }: ProductQuestionsProps) {
  const { state, dispatch } = useApplication();
  const selectedProduct = state.formData.selectedProduct;
  
  const form = useForm<ProductQuestionsData>({
    resolver: zodResolver(productQuestionsSchema),
    defaultValues: {
      creditScore: state.formData.productQuestions?.creditScore || '',
      businessAge: state.formData.productQuestions?.businessAge || '',
      collateral: state.formData.productQuestions?.collateral || '',
      monthlyRevenue: state.formData.productQuestions?.monthlyRevenue || 0,
      existingDebt: state.formData.productQuestions?.existingDebt || '',
      timeInBusiness: state.formData.productQuestions?.timeInBusiness || 0,
    },
  });

  const onSubmit = (data: ProductQuestionsData) => {
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        section: 'productQuestions',
        data,
      },
    });
    onNext();
  };

  const getProductSpecificQuestions = () => {
    switch (selectedProduct) {
      case 'term_loan':
        return (
          <>
            <FormField
              control={form.control}
              name="collateral"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Do you have collateral to secure the loan?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="collateral-yes" />
                        <label htmlFor="collateral-yes" className="text-sm font-medium">
                          Yes, I have collateral (real estate, equipment, etc.)
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="collateral-no" />
                        <label htmlFor="collateral-no" className="text-sm font-medium">
                          No, I prefer an unsecured loan
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeInBusiness"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How many years has your business been operating?</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Years in business"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case 'line_of_credit':
        return (
          <>
            <FormField
              control={form.control}
              name="monthlyRevenue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is your average monthly revenue?</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <Input
                        type="number"
                        placeholder="0"
                        className="pl-8"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="existingDebt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Do you have existing business debt?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No existing debt</SelectItem>
                      <SelectItem value="minimal">Minimal debt (under $25k)</SelectItem>
                      <SelectItem value="moderate">Moderate debt ($25k - $100k)</SelectItem>
                      <SelectItem value="significant">Significant debt (over $100k)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case 'invoice_factoring':
        return (
          <>
            <FormField
              control={form.control}
              name="monthlyRevenue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is your monthly accounts receivable volume?</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <Input
                        type="number"
                        placeholder="0"
                        className="pl-8"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessAge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is the average age of your outstanding invoices?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select invoice age" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0-30">0-30 days</SelectItem>
                      <SelectItem value="31-60">31-60 days</SelectItem>
                      <SelectItem value="61-90">61-90 days</SelectItem>
                      <SelectItem value="over-90">Over 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      default:
        return null;
    }
  };

  const getProductTitle = () => {
    switch (selectedProduct) {
      case 'term_loan':
        return 'Term Loan Application Details';
      case 'line_of_credit':
        return 'Line of Credit Application Details';
      case 'invoice_factoring':
        return 'Invoice Factoring Application Details';
      default:
        return 'Product-Specific Questions';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getProductTitle()}</CardTitle>
        <p className="text-sm text-gray-600">
          Please provide additional information specific to your selected financing option.
        </p>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Common Questions */}
            <FormField
              control={form.control}
              name="creditScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is your estimated business credit score range?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select credit score range" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent (720+)</SelectItem>
                      <SelectItem value="good">Good (680-719)</SelectItem>
                      <SelectItem value="fair">Fair (640-679)</SelectItem>
                      <SelectItem value="poor">Poor (below 640)</SelectItem>
                      <SelectItem value="unknown">I don't know</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Product-Specific Questions */}
            {getProductSpecificQuestions()}

            <div className="flex items-center justify-between pt-6">
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
              
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
