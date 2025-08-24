import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { templateManager, type ApplicationTemplate } from '@/lib/applicationTemplates';
import { 
  FileText, 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  Star, 
  Clock, 
  TrendingUp,
  Building,
  Users
} from 'lucide-react';

interface ApplicationTemplatesProps {
  onTemplateSelect?: (template: ApplicationTemplate) => void;
  currentFormData?: any;
  showCreateTemplate?: boolean;
}

export function ApplicationTemplates({ 
  onTemplateSelect, 
  currentFormData,
  showCreateTemplate = true 
}: ApplicationTemplatesProps) {
  const [templates, setTemplates] = useState<ApplicationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ApplicationTemplate | null>(null);
  const { toast } = useToast();

  // Form state for creating new template
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    industry: '',
    businessType: ''
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const allTemplates = await templateManager.getAllTemplates();
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load application templates',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name.trim()) {
      toast({
        title: 'Error',
        description: 'Template name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      await templateManager.saveTemplate({
        name: newTemplate.name,
        description: newTemplate.description,
        industry: newTemplate.industry,
        businessType: newTemplate.businessType,
        formData: currentFormData || {}
      });

      toast({
        title: 'Success',
        description: 'Application template created successfully',
      });

      setNewTemplate({ name: '', description: '', industry: '', businessType: '' });
      setShowCreateDialog(false);
      loadTemplates();
    } catch (error) {
      console.error('Failed to create template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create template',
        variant: 'destructive'
      });
    }
  };

  const handleTemplateSelect = async (template: ApplicationTemplate) => {
    try {
      // Record usage
      await templateManager.updateTemplate(template.id, {
        lastUsed: new Date().toISOString()
      });

      onTemplateSelect?.(template);
      
      toast({
        title: 'Template Applied',
        description: `Applied template: ${template.name}`,
      });

      loadTemplates(); // Refresh to show updated usage
    } catch (error) {
      console.error('Failed to apply template:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply template',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await templateManager.deleteTemplate(templateId);
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });
      loadTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive'
      });
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 0.8) return 'text-green-600';
    if (rate >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Loading templates...</span>
        </div>
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Application Templates</h3>
        </div>
        
        {showCreateTemplate && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Template</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Application Template</DialogTitle>
                <DialogDescription>
                  Save the current application data as a reusable template
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Restaurant Expansion Loan"
                  />
                </div>
                
                <div>
                  <Label htmlFor="template-description">Description</Label>
                  <Textarea
                    id="template-description"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe when to use this template..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="template-industry">Industry</Label>
                  <Select value={newTemplate.industry} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, industry: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="professional-services">Professional Services</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="template-business-type">Business Type</Label>
                  <Select value={newTemplate.businessType} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, businessType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="corporation">Corporation</SelectItem>
                      <SelectItem value="llc">LLC</SelectItem>
                      <SelectItem value="non-profit">Non-Profit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate}>
                    Create Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <FileText className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="font-medium">No Templates Yet</h3>
              <p className="text-sm text-gray-500">
                Create your first template to save time on future applications
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    <Building className="h-3 w-3 mr-1" />
                    {template.industry}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {template.businessType}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3" />
                    <span>Used {template.usage.timesUsed} times</span>
                  </div>
                  {template.usage.successRate > 0 && (
                    <div className={`flex items-center space-x-1 ${getSuccessRateColor(template.usage.successRate)}`}>
                      <TrendingUp className="h-3 w-3" />
                      <span>{Math.round(template.usage.successRate * 100)}% success</span>
                    </div>
                  )}
                </div>
                
                {template.lastUsed && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>Last used {new Date(template.lastUsed).toLocaleDateString()}</span>
                  </div>
                )}
                
                <Button 
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full"
                  size="sm"
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}