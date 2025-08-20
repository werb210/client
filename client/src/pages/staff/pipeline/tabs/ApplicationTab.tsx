import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Building, User, Phone, Mail, MapPin } from 'lucide-react';

interface ApplicationTabProps {
  applicationDetails: any;
}

/**
 * Application Tab - Core Application Information
 * Shows business details, applicant info, and application status
 */
export function ApplicationTab({ applicationDetails }: ApplicationTabProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Application Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Application Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Application ID</label>
            <p className="font-mono text-sm">{applicationDetails.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Status</label>
            <Badge className="mt-1">
              {applicationDetails.status || 'New'}
            </Badge>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Requested Amount</label>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(applicationDetails.requestedAmount || applicationDetails.funding_amount || 0)}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Created Date</label>
            <p className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(applicationDetails.createdAt || applicationDetails.created_at || new Date().toISOString())}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Legal Business Name</label>
              <p>{applicationDetails.businessName || applicationDetails.legal_name || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">DBA Name</label>
              <p>{applicationDetails.dbaName || applicationDetails.operating_name || 'Not provided'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Industry</label>
              <p>{applicationDetails.industry || applicationDetails.business_type || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Business Structure</label>
              <p>{applicationDetails.businessStructure || applicationDetails.entity_type || 'Not provided'}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Business Address</label>
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-1 text-gray-400" />
              <div>
                <p>{applicationDetails.businessAddress || 'Not provided'}</p>
                <p className="text-sm text-gray-600">
                  {[
                    applicationDetails.businessCity,
                    applicationDetails.businessState,
                    applicationDetails.businessZip
                  ].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Use of Funds</label>
            <p>{applicationDetails.useOfFunds || applicationDetails.funds_purpose || 'Not provided'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Applicant Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Primary Applicant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Full Name</label>
              <p>{applicationDetails.applicantName || applicationDetails.contact_name || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Title</label>
              <p>{applicationDetails.applicantTitle || applicationDetails.contact_title || 'Not provided'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                <p>{applicationDetails.applicantEmail || applicationDetails.contact_email || 'Not provided'}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Phone</label>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                <p>{applicationDetails.applicantPhone || applicationDetails.contact_phone || 'Not provided'}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Ownership Percentage</label>
            <p>{applicationDetails.ownershipPercentage || applicationDetails.ownership_percentage || 'Not provided'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}