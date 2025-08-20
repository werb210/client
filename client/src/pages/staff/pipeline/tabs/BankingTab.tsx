import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Landmark, TrendingUp, Calendar } from 'lucide-react';

interface BankingTabProps {
  applicationDetails: any;
}

export function BankingTab({ applicationDetails }: BankingTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Landmark className="h-5 w-5 mr-2" />
            Banking Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Primary Bank</label>
              <p>{applicationDetails.primaryBank || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Account Type</label>
              <p>{applicationDetails.accountType || 'Not provided'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Monthly Deposits</label>
              <p>{applicationDetails.monthlyDeposits || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Average Balance</label>
              <p>{applicationDetails.averageBalance || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}