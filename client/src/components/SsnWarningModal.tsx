import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface SsnWarningModalProps {
  open: boolean;
  onContinue: () => void;
}

export function SsnWarningModal({ open, onContinue }: SsnWarningModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <DialogTitle>Missing Information</DialogTitle>
          </div>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Failure to complete the application in full will result in delays or denial of funding.
          </p>
        </div>
        <DialogFooter>
          <Button 
            onClick={onContinue}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}