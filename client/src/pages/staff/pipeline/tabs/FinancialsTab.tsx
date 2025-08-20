import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface FinancialsTabProps {
  applicationDetails: any;
}

export function FinancialsTab({ applicationDetails }: FinancialsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Financial Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Annual Revenue</label>
              <p>{applicationDetails.annualRevenue || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Years in Business</label>
              <p>{applicationDetails.yearsInBusiness || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}