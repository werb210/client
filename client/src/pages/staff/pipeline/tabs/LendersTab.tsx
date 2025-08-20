import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Star } from 'lucide-react';

interface LendersTabProps {
  applicationDetails: any;
}

export function LendersTab({ applicationDetails }: LendersTabProps) {
  const matchedLenders = applicationDetails.matchedLenders || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Matched Lenders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {matchedLenders.length > 0 ? (
            <div className="space-y-3">
              {matchedLenders.map((lender: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                    <div>
                      <p className="font-medium">{lender.name || `Lender ${index + 1}`}</p>
                      <p className="text-sm text-gray-600">{lender.productType || 'Unknown product'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 mr-1" />
                      <span className="text-sm">{lender.rating || 'N/A'}</span>
                    </div>
                    <Badge variant={lender.status === 'approved' ? 'default' : 'secondary'}>
                      {lender.status || 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No lenders matched yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}