import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useFormData } from '../context/FormDataContext';
import { useLocation } from 'wouter';
import { ArrowRight, DollarSign, Building, MapPin, BarChart3, Target, TrendingUp } from 'lucide-react';
import { markApplicationStarted } from '../lib/visitFlags';

const financialProfileSchema = z.object({
  fundingAmount: z.string().optional(),
  useOfFunds: z.string().optional(),
  businessLocation: z.string().optional(),
  industry: z.string().optional(),
  lookingFor: z.string().optional(),
  salesHistory: z.string().optional(),
  lastYearRevenue: z.string().optional(),
  monthlyRevenue: z.string().optional(),
  accountReceivable: z.string().optional(),
  fixedAssets: z.string().optional(),
});

type FinancialProfileFormData = z.infer<typeof financialProfileSchema>;

const useOfFundsOptions = [
  { value: 'business-expansion', label: 'Business Expansion', icon: TrendingUp },
  { value: 'working-capital', label: 'Working Capital', icon: DollarSign },
  { value: 'equipment-finance', label: 'Equipment Finance', icon: Building },
  { value: 'inventory', label: 'Inventory', icon: BarChart3 },
  { value: 'marketing', label: 'Marketing', icon: Target },
  { value: 'debt-consolidation', label: 'Debt Consolidation', icon: TrendingUp },
  { value: 'other', label: 'Other', icon: Building },
];

const businessLocationOptions = [
  { value: 'united-states', label: 'United States' },
  { value: 'canada', label: 'Canada' },
  { value: 'other', label: 'Other' },
];

const industryOptions = [
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'technology', label: 'Technology' },
  { value: 'construction', label: 'Construction' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'professional-services', label: 'Professional Services' },
  { value: 'restaurants', label: 'Restaurants & Food Service' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'transportation', label: 'Transportation & Logistics' },
  { value: 'education', label: 'Education' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'other', label: 'Other' },
];

const lookingForOptions = [
  { value: 'capital', label: 'Capital (Working Capital, Term Loans)' },
  { value: 'equipment', label: 'Equipment Financing' },
  { value: 'both', label: 'Both Capital and Equipment' },
];

const salesHistoryOptions = [
  { value: 'under-1-year', label: 'Under 1 Year' },
  { value: '1-2-years', label: '1-2 Years' },
  { value: '2-5-years', label: '2-5 Years' },
  { value: 'over-5-years', label: 'Over 5 Years' },
];

export default function Step1FinancialProfile() {
  const [location, setLocation] = useLocation();
  const { formData, updateFormData } = useFormData();

  const form = useForm<FinancialProfileFormData>({
    resolver: zodResolver(financialProfileSchema),
    defaultValues: {
      fundingAmount: formData.fundingAmount || '',
      useOfFunds: formData.useOfFunds || '',
      businessLocation: formData.businessLocation || '',
      industry: formData.industry || '',
      lookingFor: formData.lookingFor || '',
      salesHistory: formData.salesHistory || '',
      lastYearRevenue: formData.lastYearRevenue || '',
      monthlyRevenue: formData.monthlyRevenue || '',
      accountReceivable: formData.accountReceivable || '',
      fixedAssets: formData.fixedAssets || '',
    },
  });

  useEffect(() => {
    markApplicationStarted();
  }, []);

  const onSubmit = (data: FinancialProfileFormData) => {
    updateFormData(data);
    setLocation('/step2-recommendations');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Step 1: Financial Profile
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tell us about your funding needs and business basics to get personalized financing recommendations
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-2 w-8 bg-blue-600 rounded-full"></div>
            <div className="h-2 w-8 bg-gray-300 rounded-full"></div>
            <div className="h-2 w-8 bg-gray-300 rounded-full"></div>
            <div className="h-2 w-8 bg-gray-300 rounded-full"></div>
            <div className="h-2 w-8 bg-gray-300 rounded-full"></div>
            <div className="h-2 w-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Funding Amount */}
            <div className="space-y-3">
              <label htmlFor="fundingAmount" className="block text-lg font-semibold text-gray-900">
                How much funding are you looking for?
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="fundingAmount"
                  type="text"
                  {...form.register('fundingAmount')}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  placeholder="Enter amount (e.g., $100,000)"
                />
              </div>
            </div>

            {/* Use of Funds */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-900">
                How do you plan on using the funds?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {useOfFundsOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        form.watch('useOfFunds') === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        {...form.register('useOfFunds')}
                        value={option.value}
                        className="sr-only"
                      />
                      <IconComponent className="h-5 w-5 text-gray-600 mr-3" />
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Business Location */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-900">
                Where is your business headquartered?
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  {...form.register('businessLocation')}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg appearance-none bg-white"
                >
                  <option value="">Select business location</option>
                  {businessLocationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Industry */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-900">
                What industry does your business operate in?
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  {...form.register('industry')}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg appearance-none bg-white"
                >
                  <option value="">Select industry</option>
                  {industryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Looking For */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-900">
                What type of financing are you looking for?
              </label>
              <div className="grid grid-cols-1 gap-3">
                {lookingForOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      form.watch('lookingFor') === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      {...form.register('lookingFor')}
                      value={option.value}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Sales History */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-900">
                How long has your business been generating sales?
              </label>
              <div className="relative">
                <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  {...form.register('salesHistory')}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg appearance-none bg-white"
                >
                  <option value="">Select sales history</option>
                  {salesHistoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Revenue Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label htmlFor="lastYearRevenue" className="block text-lg font-semibold text-gray-900">
                  Last year's revenue
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="lastYearRevenue"
                    type="text"
                    {...form.register('lastYearRevenue')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    placeholder="e.g., $500,000"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="monthlyRevenue" className="block text-lg font-semibold text-gray-900">
                  Average monthly revenue
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="monthlyRevenue"
                    type="text"
                    {...form.register('monthlyRevenue')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    placeholder="e.g., $50,000"
                  />
                </div>
              </div>
            </div>

            {/* Assets Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label htmlFor="accountReceivable" className="block text-lg font-semibold text-gray-900">
                  Accounts receivable balance
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="accountReceivable"
                    type="text"
                    {...form.register('accountReceivable')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    placeholder="e.g., $25,000"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="fixedAssets" className="block text-lg font-semibold text-gray-900">
                  Fixed assets value
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="fixedAssets"
                    type="text"
                    {...form.register('fixedAssets')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    placeholder="e.g., $100,000"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
              >
                Continue to Recommendations
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>
            Your information is secure and encrypted. We use this data only to provide personalized financing recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}