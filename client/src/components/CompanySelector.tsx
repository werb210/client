import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormDataContext } from '@/context/FormDataContext';
import { companyProfiles, type CompanyProfile } from '@/data/companyProfiles';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, DollarSign, Users } from 'lucide-react';

export function CompanySelector() {
  const { dispatch } = useFormDataContext();
  const [selectedProfile, setSelectedProfile] = useState<CompanyProfile | null>(null);

  const handleSelectCompany = (companyId: string) => {
    const profile = companyProfiles.find(p => p.id === companyId);
    if (profile) {
      setSelectedProfile(profile);
    }
  };

  const loadCompanyProfile = () => {
    if (!selectedProfile) return;

    // Load all the company data into the form context
    dispatch({
      type: 'UPDATE_STEP1',
      payload: selectedProfile.step1
    });

    dispatch({
      type: 'UPDATE_STEP3',
      payload: selectedProfile.step3
    });

    dispatch({
      type: 'UPDATE_STEP4',
      payload: selectedProfile.step4
    });

    alert(`✅ ${selectedProfile.name} application loaded successfully! All forms are now pre-filled with real financial data.`);
  };

  return (
    <Card className="mb-6 border-teal-200 bg-gradient-to-r from-teal-50 to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-teal-600" />
          Pre-filled Company Applications
        </CardTitle>
        <p className="text-sm text-gray-600">
          Select from 4 complete applications based on real financial documents
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Select Company</label>
            <Select onValueChange={handleSelectCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a pre-filled application..." />
              </SelectTrigger>
              <SelectContent>
                {companyProfiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={loadCompanyProfile} 
            disabled={!selectedProfile}
            className="bg-teal-600 hover:bg-teal-700"
          >
            Load Application
          </Button>
        </div>

        {selectedProfile && (
          <Card className="bg-white border-teal-100">
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-teal-600" />
                    <span className="text-sm font-medium">Location:</span>
                    <span className="text-sm">{selectedProfile.step3.businessCity}, {selectedProfile.step3.businessState}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Industry:</span>
                    <Badge variant="secondary">{selectedProfile.step1.industry}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-teal-600" />
                    <span className="text-sm font-medium">Funding Request:</span>
                    <span className="text-sm font-semibold">${selectedProfile.step1.fundingAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Employees:</span>
                    <span className="text-sm">{selectedProfile.step3.employeeCount}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  📄 Based on real financial documents: {selectedProfile.id === 'site-engineering' ? 'ATB Financial bank statements' : 
                  selectedProfile.id === 'pro-pipe' ? 'CWB bank statements' : 
                  selectedProfile.id === 'black-label' ? 'Financial statements & A/R reports' : 
                  'Financial projections & industry data'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}