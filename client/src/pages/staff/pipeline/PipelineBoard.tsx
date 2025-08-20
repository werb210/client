import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ApplicationCard } from './ApplicationCard';
import { useToast } from '@/hooks/use-toast';

// Pipeline stages configuration
const PIPELINE_STAGES = [
  { id: 'new', title: 'New', color: 'bg-blue-50 border-blue-200' },
  { id: 'in_review', title: 'In Review', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'requires_docs', title: 'Requires Docs', color: 'bg-orange-50 border-orange-200' },
  { id: 'lender', title: 'Lender', color: 'bg-purple-50 border-purple-200' },
  { id: 'completed', title: 'Completed', color: 'bg-green-50 border-green-200' },
];

interface PipelineBoardProps {
  applications: any[];
}

/**
 * Pipeline Board with Drag & Drop Lanes
 * Handles card movement between stages and API updates
 */
export function PipelineBoard({ applications }: PipelineBoardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Group applications by stage
  const applicationsByStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.id] = applications.filter(app => {
      // Map application status to pipeline stage
      switch (app.status || app.stage || 'new') {
        case 'submitted':
        case 'new':
          return stage.id === 'new';
        case 'in_review':
        case 'review':
          return stage.id === 'in_review';
        case 'requires_documents':
        case 'requires_docs':
        case 'document_required':
          return stage.id === 'requires_docs';
        case 'with_lender':
        case 'lender_review':
        case 'lender':
          return stage.id === 'lender';
        case 'approved':
        case 'completed':
        case 'funded':
          return stage.id === 'completed';
        default:
          return stage.id === 'new';
      }
    });
    return acc;
  }, {} as Record<string, any[]>);

  // Update application stage mutation
  const updateStageMutation = useMutation({
    mutationFn: async ({ applicationId, newStage }: { applicationId: string; newStage: string }) => {
      const response = await fetch(`/api/applications/${applicationId}/stage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stage: newStage }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to update application stage: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate applications query to refresh the board
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      toast({
        title: "Stage Updated",
        description: "Application moved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // No destination means dropped outside a droppable area
    if (!destination) return;

    // No movement if dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    // Update the application stage
    updateStageMutation.mutate({
      applicationId: draggableId,
      newStage: destination.droppableId,
    });
  };

  return (
    <div className="h-full p-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-5 gap-4 h-full">
          {PIPELINE_STAGES.map((stage) => {
            const stageApplications = applicationsByStage[stage.id] || [];
            
            return (
              <Card key={stage.id} className={`h-full flex flex-col ${stage.color}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-700">
                      {stage.title}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {stageApplications.length}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-hidden">
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`h-full overflow-y-auto space-y-2 p-1 rounded ${
                          snapshot.isDraggingOver ? 'bg-blue-100' : ''
                        }`}
                      >
                        {stageApplications.map((application, index) => (
                          <Draggable
                            key={application.id}
                            draggableId={application.id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={snapshot.isDragging ? 'z-50' : ''}
                              >
                                <ApplicationCard 
                                  application={application}
                                  isDragging={snapshot.isDragging}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {stageApplications.length === 0 && (
                          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                            No applications
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}