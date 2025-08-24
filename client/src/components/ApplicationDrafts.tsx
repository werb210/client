import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { draftManager, type ApplicationDraft } from '@/lib/applicationDrafts';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Clock, 
  Smartphone,
  Monitor,
  Download,
  Upload,
  AlertTriangle
} from 'lucide-react';

interface ApplicationDraftsProps {
  onDraftSelect?: (draft: ApplicationDraft) => void;
  showCreateDraft?: boolean;
  currentFormData?: any;
  currentStep?: number;
}

export function ApplicationDrafts({ 
  onDraftSelect, 
  showCreateDraft = true,
  currentFormData,
  currentStep 
}: ApplicationDraftsProps) {
  const [drafts, setDrafts] = useState<ApplicationDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingDraft, setEditingDraft] = useState<ApplicationDraft | null>(null);
  const [newDraftName, setNewDraftName] = useState('');
  const [recoveryDrafts, setRecoveryDrafts] = useState<ApplicationDraft[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadDrafts();
    checkForRecovery();
  }, []);

  const loadDrafts = async () => {
    setLoading(true);
    try {
      const allDrafts = await draftManager.getAllDrafts();
      setDrafts(allDrafts);
    } catch (error) {
      console.error('Failed to load drafts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load application drafts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkForRecovery = async () => {
    try {
      const recoverable = await draftManager.recoverFromCrash();
      setRecoveryDrafts(recoverable);
    } catch (error) {
      console.error('Failed to check for recoverable drafts:', error);
    }
  };

  const handleCreateDraft = async () => {
    if (!newDraftName.trim()) {
      toast({
        title: 'Error',
        description: 'Draft name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const draftId = await draftManager.createDraft(newDraftName);
      
      // If we have current form data, update the draft
      if (currentFormData) {
        await draftManager.updateDraft(draftId, currentFormData, currentStep);
      }

      toast({
        title: 'Success',
        description: 'Application draft created successfully',
      });

      setNewDraftName('');
      setShowCreateDialog(false);
      loadDrafts();
    } catch (error) {
      console.error('Failed to create draft:', error);
      toast({
        title: 'Error',
        description: 'Failed to create draft',
        variant: 'destructive'
      });
    }
  };

  const handleDraftSelect = async (draft: ApplicationDraft) => {
    try {
      onDraftSelect?.(draft);
      
      toast({
        title: 'Draft Loaded',
        description: `Loaded draft: ${draft.name}`,
      });
    } catch (error) {
      console.error('Failed to load draft:', error);
      toast({
        title: 'Error',
        description: 'Failed to load draft',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    try {
      await draftManager.deleteDraft(draftId);
      toast({
        title: 'Success',
        description: 'Draft deleted successfully',
      });
      loadDrafts();
    } catch (error) {
      console.error('Failed to delete draft:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete draft',
        variant: 'destructive'
      });
    }
  };

  const handleRenameDraft = async (draftId: string, newName: string) => {
    try {
      await draftManager.renameDraft(draftId, newName);
      toast({
        title: 'Success',
        description: 'Draft renamed successfully',
      });
      setEditingDraft(null);
      loadDrafts();
    } catch (error) {
      console.error('Failed to rename draft:', error);
      toast({
        title: 'Error',
        description: 'Failed to rename draft',
        variant: 'destructive'
      });
    }
  };

  const handleDuplicateDraft = async (draftId: string) => {
    try {
      await draftManager.duplicateDraft(draftId);
      toast({
        title: 'Success',
        description: 'Draft duplicated successfully',
      });
      loadDrafts();
    } catch (error) {
      console.error('Failed to duplicate draft:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate draft',
        variant: 'destructive'
      });
    }
  };

  const getDeviceIcon = (draft: ApplicationDraft) => {
    return draft.metadata.deviceInfo?.isMobile ? 
      <Smartphone className="h-4 w-4" /> : 
      <Monitor className="h-4 w-4" />;
  };

  const getStepDescription = (step: number) => {
    const steps = [
      'Getting Started',
      'Financial Profile', 
      'Product Selection',
      'Business Details',
      'Applicant Information',
      'Document Upload',
      'Signature',
      'Review & Submit'
    ];
    return steps[step - 1] || 'Unknown Step';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Loading drafts...</span>
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
      {/* Recovery Alert */}
      {recoveryDrafts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-900">Recovery Available</CardTitle>
            </div>
            <CardDescription className="text-orange-700">
              We found {recoveryDrafts.length} auto-saved draft(s) from your last session. Would you like to recover them?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recoveryDrafts.map(draft => (
              <div key={draft.id} className="flex items-center justify-between p-2 bg-white rounded border">
                <div>
                  <span className="font-medium">{draft.name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    Step {draft.step} • {draft.completionPercentage}% complete
                  </span>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleDraftSelect(draft)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Recover
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Application Drafts</h3>
        </div>
        
        {showCreateDraft && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Save as Draft</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Application Draft</DialogTitle>
                <DialogDescription>
                  Save your current progress as a draft to continue later
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="draft-name">Draft Name</Label>
                  <Input
                    id="draft-name"
                    value={newDraftName}
                    onChange={(e) => setNewDraftName(e.target.value)}
                    placeholder="e.g., Restaurant Expansion Application"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDraft}>
                    Save Draft
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {drafts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <FileText className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="font-medium">No Saved Drafts</h3>
              <p className="text-sm text-gray-500">
                Your application progress will be automatically saved as drafts
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <Card key={draft.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editingDraft?.id === draft.id ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          value={editingDraft.name}
                          onChange={(e) => setEditingDraft({ ...editingDraft, name: e.target.value })}
                          className="text-base font-semibold"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleRenameDraft(draft.id, editingDraft.name)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingDraft(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <CardTitle className="text-base flex items-center space-x-2">
                          <span>{draft.name}</span>
                          {draft.autoSaved && (
                            <Badge variant="secondary" className="text-xs">Auto-saved</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Step {draft.step}: {getStepDescription(draft.step)}
                        </CardDescription>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingDraft(draft)}
                      className="text-gray-400 hover:text-blue-500"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicateDraft(draft.id)}
                      className="text-gray-400 hover:text-green-500"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDraft(draft.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{draft.completionPercentage}%</span>
                  </div>
                  <Progress value={draft.completionPercentage} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    {getDeviceIcon(draft)}
                    <Clock className="h-3 w-3" />
                    <span>{new Date(draft.lastModified).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="text-right">
                    <div>{new Date(draft.lastModified).toLocaleTimeString()}</div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleDraftSelect(draft)}
                  className="w-full"
                  size="sm"
                >
                  Continue Application
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}