import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Building, User, Eye } from 'lucide-react';
import { usePipelineContext } from './PipelinePage';

interface ApplicationCardProps {
  application: any;
  isDragging?: boolean;
}

/**
 * Draggable Application Card
 * Shows key application info and opens drawer on click
 */
export function ApplicationCard({ application, isDragging = false }: ApplicationCardProps) {
  const { setOpenDrawerId, setSelectedApplication } = usePipelineContext();

  const handleCardClick = () => {
    setSelectedApplication(application);
    setOpenDrawerId(application.id.toString());
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Get priority color
  const getPriorityColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'urgent':
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isDragging ? 'rotate-3 shadow-lg' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        {/* Header with Business Name and Amount */}
        <div className="mb-3">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-sm text-gray-900 line-clamp-2">
              {application.businessName || application.company_name || application.legal_name || 'Unknown Business'}
            </h3>
            <Badge variant="outline" className="text-xs ml-2 shrink-0">
              {application.id}
            </Badge>
          </div>
          
          <div className="flex items-center text-green-600 font-semibold">
            <DollarSign className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {formatCurrency(application.requestedAmount || application.funding_amount || 0)}
            </span>
          </div>
        </div>

        {/* Key Details */}
        <div className="space-y-2 mb-3">
          {/* Applicant */}
          <div className="flex items-center text-xs text-gray-600">
            <User className="h-3 w-3 mr-2" />
            <span className="truncate">
              {application.applicantName || application.contact_name || 'No Contact'}
            </span>
          </div>

          {/* Industry */}
          {(application.industry || application.business_type) && (
            <div className="flex items-center text-xs text-gray-600">
              <Building className="h-3 w-3 mr-2" />
              <span className="truncate">
                {application.industry || application.business_type}
              </span>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center text-xs text-gray-600">
            <Calendar className="h-3 w-3 mr-2" />
            <span>
              {formatDate(application.createdAt || application.created_at || new Date().toISOString())}
            </span>
          </div>
        </div>

        {/* Priority and Action */}
        <div className="flex items-center justify-between">
          <Badge 
            className={`text-xs ${getPriorityColor(application.priority || application.status)}`}
            variant="secondary"
          >
            {application.priority || application.status || 'Normal'}
          </Badge>

          <Button 
            size="sm" 
            variant="ghost" 
            className="h-6 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}